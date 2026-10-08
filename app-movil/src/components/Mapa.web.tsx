import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import * as maplibregl from 'maplibre-gl/dist/maplibre-gl.mjs';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLE_URL, COLORS } from '../theme';

const CHICLAYO_CENTER = [-79.8408, -6.7714];

export default function MapaWeb({
  puntos = [],
  ubicacion = null,
  seleccionado = null,
  onSelect = null,
  onSeleccionarPunto = null,
  alto,
  radio,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const onPressPunto = onSelect || onSeleccionarPunto;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: CHICLAYO_CENTER,
      zoom: 12,
      attributionControl: true,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    puntos.forEach((p) => {
      const lat = p.latitud ?? p.coords?.latitude;
      const lng = p.longitud ?? p.coords?.longitude;
      if (lat == null || lng == null) return;

      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = COLORS.mapPin;
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener('click', () => {
        onPressPunto?.(p);
      });

      markersRef.current.push(marker);
    });
  }, [puntos]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (ubicacion) {
      const lat = ubicacion.latitud ?? ubicacion.coords?.latitude;
      const lng = ubicacion.longitud ?? ubicacion.coords?.longitude;
      if (lat != null && lng != null) {
        const el = document.createElement('div');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#237DDB';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        mapRef.current.easeTo({
          center: [lng, lat],
          zoom: 13.5,
          duration: 600,
        });
      }
    }
  }, [ubicacion]);

  useEffect(() => {
    if (!mapRef.current || !seleccionado) return;
    const lat = seleccionado.latitud ?? seleccionado.coords?.latitude;
    const lng = seleccionado.longitud ?? seleccionado.coords?.longitude;
    if (lat == null || lng == null) return;

    mapRef.current.easeTo({
      center: [lng, lat],
      zoom: 14,
      duration: 500,
    });
  }, [seleccionado]);

  return (
    <View style={[styles.container, alto != null && { height: alto, borderRadius: radio }]}>
      <div ref={containerRef} style={styles.mapWeb} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.mapBg,
  },
  mapWeb: {
    width: '100%',
    height: '100%',
  },
});
