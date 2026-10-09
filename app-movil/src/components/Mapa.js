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
</style></head>
<body><div id="map"></div>
<script>
  var D = ${data};
  var ESTILOS = [
    'https://tiles.openfreemap.org/styles/liberty',
    'https://tiles.openfreemap.org/styles/positron'
  ];
  var RASTER = {
    version: 8,
    sources: { base: { type: 'raster', tileSize: 256, maxzoom: 19,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      attribution: '© OpenStreetMap contributors' } },
    layers: [{ id: 'base', type: 'raster', source: 'base' }]
  };

  var listo = false, intento = 0, timer = null, activoId = null;
  var porId = {};
  D.puntos.forEach(function (p) { porId[p.id] = p; });

  var map = new maplibregl.Map({
    container: 'map', style: ESTILOS[0],
    center: [D.centro[1], D.centro[0]], zoom: 13,
    minZoom: 8, maxZoom: 18, renderWorldCopies: false,
    attributionControl: { compact: true }
  });

  // Si el navegador pierde el contexto WebGL el mapa queda gris: avisar y repintar al volver
  var lienzo = map.getCanvas();
  lienzo.addEventListener('webglcontextlost', function (ev) {
    ev.preventDefault();
    console.warn('[mapa] contexto WebGL perdido');
  });
  lienzo.addEventListener('webglcontextrestored', function () {
    console.warn('[mapa] contexto WebGL restaurado');
    map.triggerRepaint();
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

  function enviar(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage(s, '*');
  }

  /* ---------- Pines dibujados DENTRO del mapa (capas WebGL) ---------- */
  function crearPin(color) {
    var c = document.createElement('canvas');
    c.width = 60; c.height = 72;
    var x = c.getContext('2d');
    x.translate(30, 66);
    x.scale(2.2, 2.2);
    var p = new Path2D('M0 0C-7-8-10-13-10-18a10 10 0 1 1 20 0C10-13 7-8 0 0z');
    x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 6; x.shadowOffsetY = 2;
    x.fillStyle = color; x.fill(p);
    x.shadowColor = 'transparent';
    x.lineWidth = 1.6; x.strokeStyle = '#ffffff'; x.stroke(p);
    x.beginPath(); x.arc(0, -18, 3.6, 0, Math.PI * 2); x.fillStyle = '#ffffff'; x.fill();
    return x.getImageData(0, 0, 60, 72);
  }

  function geoPuntos() {
    return { type: 'FeatureCollection', features: D.puntos.map(function (p) {
      return { type: 'Feature',
        properties: { id: p.id, nombre: p.nombre.replace(/^Municipalidad (Distrital )?de /, '') },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] } };
    }) };
  }
  function geoYo() {
    return { type: 'FeatureCollection', features: D.yo ? [{ type: 'Feature', properties: {},
      geometry: { type: 'Point', coordinates: [D.yo.lng, D.yo.lat] } }] : [] };
  }

  function aplicarActivo() {
    var f = ['==', ['get', 'id'], activoId == null ? '' : activoId];
    ['puntos-activo', 'puntos-pulso'].forEach(function (l) {
      if (map.getLayer(l)) map.setFilter(l, f);
    });
  }

  function montar() {
    try {
      if (!map.hasImage('pin')) map.addImage('pin', crearPin(D.colores.pin), { pixelRatio: 2 });
      if (!map.hasImage('pin-activo')) map.addImage('pin-activo', crearPin(D.colores.activo), { pixelRatio: 2 });
      if (!map.getSource('puntos')) {
        map.addSource('puntos', { type: 'geojson', data: geoPuntos() });
        map.addSource('yo', { type: 'geojson', data: geoYo() });

        map.addLayer({ id: 'yo-halo', type: 'circle', source: 'yo',
          paint: { 'circle-radius': 18, 'circle-color': D.colores.yo, 'circle-opacity': 0.2 } });
        map.addLayer({ id: 'yo-punto', type: 'circle', source: 'yo',
          paint: { 'circle-radius': 7, 'circle-color': D.colores.yo,
                   'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } });

        map.addLayer({ id: 'puntos-pulso', type: 'circle', source: 'puntos',
          filter: ['==', ['get', 'id'], ''],
          paint: { 'circle-radius': 16, 'circle-color': D.colores.activo, 'circle-opacity': 0.25,
                   'circle-pitch-alignment': 'map' } });

        map.addLayer({ id: 'puntos-pin', type: 'symbol', source: 'puntos',
          layout: { 'icon-image': 'pin', 'icon-anchor': 'bottom',
                    'icon-allow-overlap': true, 'icon-ignore-placement': true } });

        map.addLayer({ id: 'puntos-activo', type: 'symbol', source: 'puntos',
          filter: ['==', ['get', 'id'], ''],
          layout: { 'icon-image': 'pin-activo', 'icon-anchor': 'bottom', 'icon-size': 1.25,
                    'icon-allow-overlap': true, 'icon-ignore-placement': true } });

        if (map.getStyle().glyphs) {
          map.addLayer({ id: 'puntos-etiqueta', type: 'symbol', source: 'puntos', minzoom: 12,
            layout: { 'text-field': ['get', 'nombre'], 'text-font': ['Noto Sans Regular'],
                      'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.4],
                      'text-optional': true },
            paint: { 'text-color': '#1d3a2c', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 } });
        }
      }
      aplicarActivo();
    } catch (err) {
      console.warn('[mapa] montar:', err && err.message);
    }
  }
  map.on('style.load', montar);

  ['puntos-pin', 'puntos-activo'].forEach(function (capa) {
    map.on('click', capa, function (e) {
      var f = e.features && e.features[0];
      if (f) enviar({ tipo: 'select', id: f.properties.id });
    });
    map.on('mouseenter', capa, function () { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', capa, function () { map.getCanvas().style.cursor = ''; });
  });

  /* ---------- Encuadre inicial ---------- */
  var bounds = new maplibregl.LngLatBounds(), hay = false;
  D.puntos.forEach(function (p) { bounds.extend([p.lng, p.lat]); hay = true; });
  if (D.yo) { bounds.extend([D.yo.lng, D.yo.lat]); hay = true; }
  if (hay) map.fitBounds(bounds, { padding: { top: 60, bottom: 230, left: 30, right: 30 }, maxZoom: 16, duration: 0 });

  /* ---------- Selección desde la app ---------- */
  window.seleccionar = function (id) {
    var p = porId[id];
    if (!p) return;
    activoId = id;
    aplicarActivo();
    map.easeTo({ center: [p.lng, p.lat], offset: [0, -80], duration: 500 });
  };

  /* ---------- Respaldo si el estilo no carga ---------- */
  function programar() {
    clearTimeout(timer);
    if (intento <= ESTILOS.length) timer = setTimeout(siguiente, 8000);
  }
  function siguiente() {
    if (listo) return;
    intento++;
    map.setStyle(intento < ESTILOS.length ? ESTILOS[intento] : RASTER);
    programar();
  }
  function marcarListo() { listo = true; clearTimeout(timer); }
  map.on('load', marcarListo);
  map.on('idle', marcarListo);
  map.on('error', function (e) {
    console.warn('[mapa] error:', e && e.error && e.error.message, e && e.sourceId);
  });
  programar();

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
