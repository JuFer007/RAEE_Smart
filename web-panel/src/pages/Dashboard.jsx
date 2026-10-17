import React from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import StatsCard from '../components/StatsCard';
import { Card } from '../components/Card';
import EntregaTable from '../components/EntregaTable';
import MapView from '../components/MapView';
import ExportButton from '../components/ExportButton';
import { BarList, Donut } from '../components/Charts';
import Icon from '../components/Icon';
import { COLORS, FUENTES, ESTADOS_ENTREGA } from '../theme';
import {
  ENTREGAS,
  PUNTOS,
  CAMPANAS,
  calcularResumen,
  contarPorTipo,
  contarPorEstado,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();
  const resumen = calcularResumen(ENTREGAS);
  const porTipo = contarPorTipo(ENTREGAS);
  const porEstado = contarPorEstado(ENTREGAS).map((e) => ({
    label: e.label,
    total: e.total,
    color: ESTADOS_ENTREGA[e.estado].color,
  }));
  const recientes = [...ENTREGAS].sort(
    (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro),
  );

  return (
    <>
      <Topbar
        titulo="Resumen general"
        subtitulo={`${usuario?.municipalidadNombre || 'Municipalidad'} · Seguimiento de entregas de RAEE`}
        acciones={<ExportButton datos={ENTREGAS} nombreArchivo="entregas-raee.csv" />}
      />

      <div className="panel-content fade-in">
        <div style={styles.gridStats}>
          <StatsCard
            titulo="Entregas totales"
            valor={resumen.total}
            icono="list"
            tono="primary"
            detalle="registradas en el periodo"
            tendencia={{ sube: true, texto: '+12%' }}
          />
          <StatsCard
            titulo="Certificadas"
            valor={resumen.certificadas}
            icono="check"
            tono="info"
            detalle="con certificado digital"
            tendencia={{ sube: true, texto: '+8%' }}
          />
          <StatsCard
            titulo="En proceso"
            valor={resumen.enProceso}
            icono="clock"
            tono="warning"
            detalle="pendientes de validación"
          />
          <StatsCard
            titulo="Peso recolectado"
            valor={`${resumen.pesoTotal.toFixed(0)} kg`}
            icono="leaf"
            tono="primary"
            detalle={`${resumen.co2Evitado.toFixed(0)} kg de CO₂ evitado`}
            tendencia={{ sube: true, texto: '+15%' }}
          />
        </div>

        <div style={styles.gridDos}>
          <Card
            titulo="Entregas por categoría RAEE"
            subtitulo="Distribución según el tipo de aparato recolectado"
          >
            <BarList datos={porTipo.map((t) => ({ label: t.nombre, total: t.total, icono: t.icono }))} />
          </Card>

          <Card titulo="Estado de las entregas" subtitulo="Situación actual del flujo">
            <Donut datos={porEstado} />
          </Card>
        </div>

        <Card
          titulo="Entregas recientes"
          subtitulo="Últimos registros recibidos"
          style={{ marginTop: 16 }}
          accion={
            <Link to="/panel/entregas" style={styles.verTodas}>
              Ver todas <Icon name="chevronRight" size={15} color={COLORS.primaryText} />
            </Link>
          }
        >
          <EntregaTable entregas={recientes} maxFilas={6} />
        </Card>

        <div style={styles.gridDos}>
          <Card
            titulo="Puntos de acopio"
            subtitulo={`${PUNTOS.length} puntos habilitados en la provincia`}
          >
            <MapView puntos={PUNTOS} alto={330} />
          </Card>

          <Card titulo="Campañas activas" subtitulo="Jornadas de acopio vigentes">
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
                  <span style={styles.campanaEstado}>Activa</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

const styles = {
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridDos: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: 16,
    marginTop: 16,
  },
  verTodas: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    fontWeight: 700,
    color: COLORS.primaryText,
  },
  campanas: { display: 'flex', flexDirection: 'column', gap: 12 },
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
