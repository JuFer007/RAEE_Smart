import React from 'react';
import Topbar from '../components/Topbar';
import StatsCard from '../components/StatsCard';
import { Card } from '../components/Card';
import { BarChart, BarList, Donut } from '../components/Charts';
import ExportButton from '../components/ExportButton';
import { COLORS, ESTADOS_ENTREGA } from '../theme';
import {
  ENTREGAS,
  calcularResumen,
  contarPorTipo,
  contarPorEstado,
  contarPorMes,
  contarPorMunicipalidad,
} from '../data/mockData';

export default function Estadisticas() {
  const resumen = calcularResumen(ENTREGAS);
  const porTipo = contarPorTipo(ENTREGAS);
  const porEstado = contarPorEstado(ENTREGAS).map((e) => ({
    label: e.label,
    total: e.total,
    color: ESTADOS_ENTREGA[e.estado].color,
  }));
  const porMes = contarPorMes(ENTREGAS);
  const porMuni = contarPorMunicipalidad(ENTREGAS);

  const tasaCertificacion = resumen.total ? Math.round((resumen.certificadas / resumen.total) * 100) : 0;
  const confianzaPromedio = (
    ENTREGAS.reduce((acc, e) => acc + (e.confianzaIa || 0), 0) / (ENTREGAS.length || 1)
  ).toFixed(2);
  const corregidas = resumen.pendientesRevision;

  return (
    <>
      <Topbar
        titulo="Estadísticas"
        subtitulo="Indicadores de gestión de RAEE por categoría, estado y distrito"
        acciones={<ExportButton datos={ENTREGAS} nombreArchivo="estadisticas-raee.csv" />}
      />

      <div className="panel-content fade-in">
        <div style={styles.gridStats}>
          <StatsCard
            titulo="Tasa de certificación"
            valor={`${tasaCertificacion}%`}
            icono="check"
            tono="primary"
            detalle={`${resumen.certificadas} de ${resumen.total} entregas`}
          />
          <StatsCard
            titulo="Peso recolectado"
            valor={`${resumen.pesoTotal.toFixed(0)} kg`}
            icono="leaf"
            tono="info"
            detalle="total del periodo"
          />
          <StatsCard
            titulo="CO₂ evitado"
            valor={`${resumen.co2Evitado.toFixed(0)} kg`}
            icono="snow"
            tono="primary"
            detalle="impacto ambiental estimado"
          />
          <StatsCard
            titulo="Confianza IA promedio"
            valor={confianzaPromedio}
            icono="scan"
            tono="warning"
            detalle={`${corregidas} clasificaciones corregidas`}
          />
        </div>

        <Card
          titulo="Tendencia mensual de entregas"
          subtitulo="Entregas registradas por mes (2026)"
          style={{ marginTop: 16 }}
        >
          <BarChart datos={porMes} alto={220} />
        </Card>

        <div style={styles.gridDos}>
          <Card titulo="Entregas por categoría RAEE" subtitulo="Ranking de aparatos recolectados">
            <BarList datos={porTipo.map((t) => ({ label: t.nombre, total: t.total, icono: t.icono }))} />
          </Card>

          <Card titulo="Distribución por estado" subtitulo="Situación del flujo de entregas">
            <Donut datos={porEstado} />
          </Card>
        </div>

        <Card
          titulo="Entregas por distrito"
          subtitulo="Participación de cada municipalidad"
          style={{ marginTop: 16 }}
        >
          <BarList
            datos={porMuni.map((m) => ({ label: m.distrito, total: m.total, icono: 'building' }))}
          />
        </Card>
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
};
