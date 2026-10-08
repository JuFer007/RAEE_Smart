import React, { useRef, memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAP_STYLE_URL, COLORS } from '../theme';

const CHICLAYO_CENTER = [-79.8408, -6.7714];

MapLibreGL.setAccessToken(null);

function MapaNative({
  puntos = [],
  ubicacion = null,
  seleccionado = null,
  onSelect = null,
  onSeleccionarPunto = null,
  alto,
  radio,
}) {
  const mapRef = useRef(null);
  const onPressPunto = onSelect || onSeleccionarPunto;

  useEffect(() => {
    if (!mapRef.current || !seleccionado) return;
    const lat = seleccionado.latitud ?? seleccionado.coords?.latitude;
    const lng = seleccionado.longitud ?? seleccionado.coords?.longitude;
    if (lat == null || lng == null) return;

    mapRef.current.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: 14,
      animationDuration: 500,
    });
  }, [seleccionado]);

  useEffect(() => {
    if (!mapRef.current || !ubicacion) return;
    const lat = ubicacion.latitud ?? ubicacion.coords?.latitude;
    const lng = ubicacion.longitud ?? ubicacion.coords?.longitude;
    if (lat == null || lng == null) return;

    mapRef.current.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: 13.5,
      animationDuration: 600,
    });
  }, [ubicacion]);

  const isActivo = (p) => {
    if (seleccionado == null || p == null) return false;
    const sid = String(seleccionado.id ?? seleccionado);
    const pid = String(p.id ?? p);
    return sid === pid;
  };

  return (
    <View style={[styles.container, alto != null && { height: alto, borderRadius: radio }]}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAP_STYLE_URL}
        logoEnabled={false}
        attributionEnabled
        compassEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled={false}
      >
        <MapLibreGL.Camera
          zoomLevel={12}
          centerCoordinate={CHICLAYO_CENTER}
          animationDuration={600}
        />

        {ubicacion ? <MapLibreGL.UserLocation visible showsUserHeadingIndicator /> : null}

        {puntos.map((p) => {
          const lat = p.latitud ?? p.coords?.latitude;
          const lng = p.longitud ?? p.coords?.longitude;
          if (lat == null || lng == null) return null;
          const activo = isActivo(p);

          return (
            <MapLibreGL.PointAnnotation
              key={p.id}
              id={`punto-${p.id}`}
              coordinate={[lng, lat]}
              onSelected={() => onPressPunto?.(p)}
            >
              <View style={[styles.pin, activo && styles.pinActivo]}>
                <View style={styles.pinInner} />
              </View>
            </MapLibreGL.PointAnnotation>
          );
        })}
      </MapLibreGL.MapView>
    </View>
  );
}

export default memo(MapaNative);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.mapBg,
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 133, 77, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  pinActivo: {
    backgroundColor: 'rgba(7, 125, 80, 0.4)',
    transform: [{ scale: 1.15 }],
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.mapPin,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});
