import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme';

const esWeb = Platform.OS === 'web';
const CHICLAYO = [-6.7714, -79.8408]; 

const latDe = (o) => o?.latitud ?? o?.coords?.latitude;
const lngDe = (o) => o?.longitud ?? o?.coords?.longitude;

function construirHtml(puntos, ubicacion, colores) {
  const data = JSON.stringify({
    puntos: puntos
      .filter((p) => latDe(p) != null && lngDe(p) != null)
      .map((p) => ({
        id: String(p.id),
        nombre: p.nombre || '',
        lat: Number(latDe(p)),
        lng: Number(lngDe(p)),
      })),
    yo:
      ubicacion && latDe(ubicacion) != null
        ? { lat: Number(latDe(ubicacion)), lng: Number(lngDe(ubicacion)) }
        : null,
    colores,
    centro: CHICLAYO,
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${COLORS.mapBg}; }
  .maplibregl-ctrl-attrib { font-size: 9px; }
  .pin { cursor: pointer; transform-origin: bottom center; transition: transform .15s; }
</style></head>
<body><div id="map"></div>
<script>
  var D = ${data};
  var ESTILO = 'https://tiles.openfreemap.org/styles/liberty';
  var RASTER = {
    version: 8,
    sources: { base: { type: 'raster', tileSize: 256,
      tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      attribution: '© OpenStreetMap © CARTO' } },
    layers: [{ id: 'base', type: 'raster', source: 'base' }]
  };

  var cargado = false, usandoRespaldo = false;
  var map = new maplibregl.Map({
    container: 'map', style: ESTILO,
    center: [D.centro[1], D.centro[0]], zoom: 13,
    attributionControl: { compact: true }
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

  function usarRespaldo() {
    if (usandoRespaldo || cargado) return;
    usandoRespaldo = true;
    map.setStyle(RASTER);
  }
  map.on('load', function () { cargado = true; });
  map.on('error', function () { if (!cargado) usarRespaldo(); });
  setTimeout(usarRespaldo, 7000);

  function crearPin(color) {
    var el = document.createElement('div');
    el.className = 'pin';
    el.style.width = '30px'; el.style.height = '30px';
    el.innerHTML = '<svg width="30" height="30" viewBox="-12 -22 24 24"><path d="M0 0C-7-8-10-13-10-18a10 10 0 1 1 20 0C10-13 7-8 0 0z" fill="' + color + '" stroke="#fff" stroke-width="1.6"/><circle cx="0" cy="-18" r="3.4" fill="#fff"/></svg>';
    return el;
  }
  function pintar(el, activo) {
    el.querySelector('path').setAttribute('fill', activo ? D.colores.activo : D.colores.pin);
    el.style.transform = activo ? 'scale(1.3)' : 'scale(1)';
    el.style.zIndex = activo ? 10 : 1;
  }
  function enviar(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage(s, '*');
  }

  var marcadores = {}, bounds = new maplibregl.LngLatBounds(), previo = null, hayPuntos = false;

  D.puntos.forEach(function (p) {
    var el = crearPin(D.colores.pin);
    el.title = p.nombre;
    el.addEventListener('click', function (e) { e.stopPropagation(); enviar({ tipo: 'select', id: p.id }); });
    new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(map);
    marcadores[p.id] = { el: el, lng: p.lng, lat: p.lat };
    bounds.extend([p.lng, p.lat]);
    hayPuntos = true;
  });

  if (D.yo) {
    var yo = document.createElement('div');
    yo.style.cssText = 'width:16px;height:16px;border-radius:50%;background:' + D.colores.yo +
      ';border:3px solid #fff;box-shadow:0 0 0 8px rgba(35,125,219,.2),0 1px 4px rgba(0,0,0,.4)';
    new maplibregl.Marker({ element: yo }).setLngLat([D.yo.lng, D.yo.lat]).addTo(map);
    bounds.extend([D.yo.lng, D.yo.lat]);
    hayPuntos = true;
  }

  if (hayPuntos) {
    map.fitBounds(bounds, { padding: { top: 60, bottom: 230, left: 30, right: 30 }, maxZoom: 16, duration: 0 });
  }

  window.seleccionar = function (id) {
    if (previo && marcadores[previo]) pintar(marcadores[previo].el, false);
    var m = marcadores[id];
    if (!m) return;
    pintar(m.el, true);
    map.easeTo({ center: [m.lng, m.lat], offset: [0, -80], duration: 500 });
    previo = id;
  };

  function alMensaje(e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.tipo === 'seleccionar') window.seleccionar(String(d.id));
    } catch (err) {}
  }
  window.addEventListener('message', alMensaje);
  document.addEventListener('message', alMensaje);
</script></body></html>`;
}

export default function Mapa({
  puntos = [],
  ubicacion = null,
  seleccionado = null,
  onSelect = null,
  onSeleccionarPunto = null,
  alto,
  radio = 0,
}) {
  const webRef = useRef(null);
  const iframeRef = useRef(null);
  const alSeleccionar = onSelect || onSeleccionarPunto;
  const alSeleccionarRef = useRef(null);

  const idSel = seleccionado != null ? String(seleccionado.id ?? seleccionado) : null;

  // Guardar el callback más reciente (dentro de un efecto, no durante el render)
  useEffect(() => {
    alSeleccionarRef.current = alSeleccionar;
  }, [alSeleccionar]);

  // El HTML solo se reconstruye si cambian puntos o ubicación (no al cambiar la selección)
  const html = useMemo(
    () =>
      construirHtml(puntos, ubicacion, {
        pin: COLORS.mapPin,
        activo: COLORS.primaryDeep,
        yo: COLORS.info,
      }),
    [puntos, ubicacion]
  );

  const enviarSeleccion = useCallback(() => {
    if (idSel == null) return;
    if (esWeb) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ tipo: 'seleccionar', id: idSel }),
        '*'
      );
    } else {
      webRef.current?.injectJavaScript(
        `window.seleccionar && window.seleccionar(${JSON.stringify(idSel)}); true;`
      );
    }
  }, [idSel]);

  useEffect(() => {
    enviarSeleccion();
  }, [enviarSeleccion]);

  // Web: recibir clics de los pines que vienen del iframe
  useEffect(() => {
    if (!esWeb) return undefined;
    const handler = (e) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      try {
        const d = JSON.parse(e.data);
        if (d.tipo === 'select') alSeleccionarRef.current?.({ id: d.id });
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const estiloMarco = [styles.marco, alto != null && { height: alto }, { borderRadius: radio }];

  if (esWeb) {
    return (
      <View style={estiloMarco}>
        <iframe
          ref={iframeRef}
          title="Mapa de puntos RAEE"
          srcDoc={html}
          onLoad={enviarSeleccion}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </View>
    );
  }

  return (
    <View style={estiloMarco}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={enviarSeleccion}
        onMessage={(e) => {
          try {
            const d = JSON.parse(e.nativeEvent.data);
            if (d.tipo === 'select') alSeleccionar?.({ id: d.id });
          } catch (_) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { flex: 1, overflow: 'hidden', backgroundColor: COLORS.mapBg },
  web: { flex: 1, backgroundColor: 'transparent' },
});