import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import { COLORS, FUENTES, RADIOS, SOMBRAS } from '../theme';
import type { Punto } from '../types';

const CENTRO_CHICLAYO: LatLngExpression = [-6.7714, -79.8409];

interface MapViewProps {
  puntos?: Punto[];
  centro?: LatLngExpression;
  zoom?: number;
  alto?: number;
}

export default function MapView({ puntos = [], centro = CENTRO_CHICLAYO, zoom = 11, alto = 360 }: MapViewProps) {
  const icono = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: '<div class="map-pin"><span></span></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      }),
    [],
  );

  return (
    <div style={{ ...styles.marco, height: alto }}>
      <MapContainer center={centro} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {puntos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng] as LatLngExpression} icon={icono}>
            <Popup>
              <div style={styles.popup}>
                <p style={styles.popupTitulo}>{p.nombre}</p>
                <p style={styles.popupTexto}>{p.direccion}</p>
                {p.horario ? (
                  <p style={styles.popupMeta}>
                    {p.horario}
                    {p.capacidad ? ` · cap. ${p.capacidad}/día` : ''}
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={styles.leyenda}>
        <span style={styles.leyendaPunto} />
        {puntos.length} punto{puntos.length === 1 ? '' : 's'} de acopio
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  marco: {
    position: 'relative',
    borderRadius: RADIOS.md,
    overflow: 'hidden',
    border: `1px solid ${COLORS.lineSoft}`,
    background: COLORS.mapBg,
    boxShadow: SOMBRAS.card,
  },
  popup: { fontFamily: FUENTES.dm, minWidth: 180 },
  popupTitulo: { fontFamily: FUENTES.manrope, fontSize: 13, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' },
  popupTexto: { fontFamily: FUENTES.dm, fontSize: 11.5, color: COLORS.mut, margin: '0 0 4px' },
  popupMeta: { fontFamily: FUENTES.dm, fontSize: 11, color: COLORS.primaryText, margin: 0, fontWeight: 600 },
  leyenda: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    zIndex: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 12px',
    borderRadius: RADIOS.pill,
    background: 'rgba(255,255,255,0.94)',
    border: `1px solid ${COLORS.lineSoft}`,
    fontFamily: FUENTES.dm,
    fontSize: 11.5,
    fontWeight: 600,
    color: COLORS.inkItem,
    boxShadow: SOMBRAS.card,
  },
  leyendaPunto: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: COLORS.primary,
  },
};
