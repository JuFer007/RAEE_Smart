import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import MapView from '../components/MapView';
import { Card } from '../components/Card';
import Icon from '../components/Icon';
import { COLORS, FUENTES, RADIOS } from '../theme';
import { PUNTOS, CAMPANAS, MUNICIPALIDADES } from '../data/mockData';

function nombreMunicipalidad(id) {
  return MUNICIPALIDADES.find((m) => m.id === id)?.nombre || 'Municipalidad';
}

export default function Puntos() {
  const [seleccionado, setSeleccionado] = useState(PUNTOS[0]);

  return (
    <>
      <Topbar
        titulo="Puntos de acopio"
        subtitulo={`${PUNTOS.length} puntos habilitados · ${CAMPANAS.length} campañas activas`}
      />

      <div className="panel-content fade-in">
        <div style={styles.grid}>
          <Card
            titulo="Mapa de puntos"
            subtitulo={seleccionado ? `Seleccionado: ${seleccionado.nombre}` : 'Ubicaciones en la provincia'}
          >
            <MapView puntos={PUNTOS} alto={430} centro={[seleccionado.lat, seleccionado.lng]} zoom={12} />
          </Card>

          <Card titulo="Listado de puntos" subtitulo="Haz clic para ubicarlo en el mapa" padding={14}>
            <div style={styles.lista}>
              {PUNTOS.map((p) => {
                const activo = seleccionado?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSeleccionado(p)}
                    style={{ ...styles.item, ...(activo ? styles.itemActivo : {}) }}
                  >
                    <span style={{ ...styles.itemIcono, ...(activo ? styles.itemIconoActivo : {}) }}>
                      <Icon name="location" size={17} color={activo ? COLORS.white : COLORS.primaryText} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <span style={styles.itemTitulo}>{p.nombre}</span>
                      <span style={styles.itemMeta}>{p.direccion}</span>
                      <span style={styles.itemMeta}>{p.horario} · cap. {p.capacidad}/día</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <Card
          titulo="Detalle del punto seleccionado"
          subtitulo={seleccionado ? nombreMunicipalidad(seleccionado.municipalidadId) : ''}
          style={{ marginTop: 16 }}
        >
          {seleccionado ? (
            <div style={styles.detalle}>
              <Dato valor={seleccionado.nombre} etiqueta="Punto de acopio" />
              <Dato valor={seleccionado.direccion} etiqueta="Dirección" />
              <Dato valor={seleccionado.horario} etiqueta="Horario de atención" />
              <Dato valor={`${seleccionado.capacidad} RAEE/día`} etiqueta="Capacidad diaria" />
            </div>
          ) : null}
        </Card>

        <Card
          titulo="Campañas de reciclaje"
          subtitulo="Jornadas y módulos de acopio activos"
          style={{ marginTop: 16 }}
        >
          <div style={styles.campanas}>
            {CAMPANAS.map((c) => (
              <div key={c.id} style={styles.campana}>
                <span style={styles.campanaIcono}>
                  <Icon name="calendar" size={16} color={COLORS.primaryText} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={styles.campanaTitulo}>{c.titulo}</p>
                  <p style={styles.campanaMeta}>
                    {c.lugar} · {c.horario}
                  </p>
                </div>
                <span style={styles.campanaEstado}>{c.activa ? 'Activa' : 'Inactiva'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Dato({ valor, etiqueta }) {
  return (
    <div style={styles.dato}>
      <span style={styles.datoEtiqueta}>{etiqueta}</span>
      <span style={styles.datoValor}>{valor}</span>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 16,
    alignItems: 'start',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 430, overflowY: 'auto' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: 12,
    background: COLORS.surface,
    width: '100%',
  },
  itemActivo: { borderColor: COLORS.focus, background: COLORS.primaryPale },
  itemIcono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: COLORS.primarySoft,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  itemIconoActivo: { background: `linear-gradient(135deg, ${COLORS.gradA}, ${COLORS.gradB})` },
  itemTitulo: {
    display: 'block',
    fontFamily: FUENTES.dm,
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.inkItem,
  },
  itemMeta: { display: 'block', fontFamily: FUENTES.dm, fontSize: 11, color: COLORS.mut, marginTop: 2 },
  detalle: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  dato: {
    background: COLORS.bgTop,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: RADIOS.md,
    padding: 15,
  },
  datoEtiqueta: {
    display: 'block',
    fontFamily: FUENTES.dm,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.mut,
    marginBottom: 6,
  },
  datoValor: { fontFamily: FUENTES.dm, fontSize: 13.5, fontWeight: 600, color: COLORS.inkItem },
  campanas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  campana: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: 12,
    background: COLORS.bgTop,
  },
  campanaIcono: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: COLORS.primarySoft,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  campanaTitulo: {
    fontFamily: FUENTES.dm,
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.inkItem,
    margin: 0,
  },
  campanaMeta: { fontFamily: FUENTES.dm, fontSize: 11, color: COLORS.mut, margin: '3px 0 0' },
  campanaEstado: {
    marginLeft: 'auto',
    fontFamily: FUENTES.dm,
    fontSize: 10.5,
    fontWeight: 700,
    color: COLORS.primaryText,
    background: COLORS.primarySoft2,
    padding: '4px 9px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
};
