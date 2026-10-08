import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme';

const CHICLAYO_CENTER = [-6.7714, -79.8408];

export default function MapaWebView({
  puntos = [],
  ubicacion = null,
  seleccionado = null,
  alto,
  radio,
}) {
  const lat = ubicacion?.latitud ?? ubicacion?.coords?.latitude ?? CHICLAYO_CENTER[0];
  const lng = ubicacion?.longitud ?? ubicacion?.coords?.longitude ?? CHICLAYO_CENTER[1];

  const html = useMemo(() => {
    const puntosJSON = JSON.stringify(
      puntos
        .filter((p) => p.latitud != null && p.longitud != null)
        .map((p) => ({
          id: p.id,
          lat: p.latitud ?? p.coords?.latitude,
          lng: p.longitud ?? p.coords?.longitude,
          nombre: p.nombre || '',
        }))
    );

    const sel = seleccionado
      ? JSON.stringify({
          id: seleccionado.id,
          lat: seleccionado.latitud ?? seleccionado.coords?.latitude,
          lng: seleccionado.longitud ?? seleccionado.coords?.longitude,
        })
      : 'null';

    const user = ubicacion
      ? JSON.stringify({
          lat: ubicacion.latitud ?? ubicacion.coords?.latitude,
          lng: ubicacion.longitud ?? ubicacion.coords?.longitude,
        })
      : 'null';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #D9EBDE; }
    .pin-default { width: 16px; height: 16px; border-radius: 50%; background: #07854D; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
    .pin-activo { width: 20px; height: 20px; border-radius: 50%; background: #087C4B; border: 2px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,.4); }
    .pin-user { width: 14px; height: 14px; border-radius: 50%; background: #237DDB; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${lat}, ${lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const puntos = ${puntosJSON};
    const seleccionado = ${sel};
    const usuario = ${user};

    const iconDefault = L.divIcon({ className: 'pin', html: '<div class="pin-default"></div>', iconSize: [16,16], iconAnchor: [8,8] });
    const iconActivo = L.divIcon({ className: 'pin-activo', html: '<div class="pin-activo"></div>', iconSize: [20,20], iconAnchor: [10,10] });
    const iconUser = L.divIcon({ className: 'pin-user', html: '<div class="pin-user"></div>', iconSize: [14,14], iconAnchor: [7,7] });

    puntos.forEach(p => {
      const activo = seleccionado && seleccionado.id == p.id;
      const m = L.marker([p.lat, p.lng], { icon: activo ? iconActivo : iconDefault }).addTo(map);
      if (p.nombre) m.bindPopup(p.nombre);
    });

    if (usuario) {
      L.marker([usuario.lat, usuario.lng], { icon: iconUser }).addTo(map);
    }

    if (seleccionado) {
      map.setView([seleccionado.lat, seleccionado.lng], 14);
    }
  </script>
</body>
</html>`;
  }, [puntos, ubicacion, seleccionado]);

  return (
    <View style={[styles.container, alto != null && { height: alto, borderRadius: radio }]}>
      <WebView source={{ html }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: COLORS.mapBg },
  webview: { flex: 1 },
});
