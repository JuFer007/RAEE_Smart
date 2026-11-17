import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import {
  listarEntregas,
  listarMunicipalidades,
} from '../../api/panel';
import { useToast } from '../../context/ToastContext';
import type { Entrega, EstadoEntrega, Municipalidad } from '../../types';
import {
  fechaHoyISO,
  formatearFechaHora,
  obtenerMensajeError,
  pluralizar,
  sumarDias,
} from '../../utils/formato';

interface EntregaConsolidada {
  entrega: Entrega;
  municipalidad: Municipalidad;
}

const ESTADOS: Record<EstadoEntrega, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  REGISTRADA: { label: 'Registrada', tone: 'info' },
  EN_PROCESO: { label: 'En proceso', tone: 'warning' },
  CONFIRMADA: { label: 'Confirmada', tone: 'success' },
  RECHAZADA: { label: 'Rechazada', tone: 'danger' },
};

function escaparCsv(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export default function AdminReportesPage() {
  const { showToast } = useToast();
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [entregas, setEntregas] = useState<EntregaConsolidada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [desde, setDesde] = useState(sumarDias(fechaHoyISO(), -30));
  const [hasta, setHasta] = useState(fechaHoyISO());
  const [municipalidadId, setMunicipalidadId] = useState('TODAS');
  const [estado, setEstado] = useState<'TODOS' | EstadoEntrega>('TODOS');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const municipalidadesData = await listarMunicipalidades();
      const resultados = await Promise.allSettled(
        municipalidadesData.map((municipalidad) => listarEntregas(municipalidad.id)),
      );
      const consolidado: EntregaConsolidada[] = [];
      municipalidadesData.forEach((municipalidad, indice) => {
        const resultado = resultados[indice];
        if (resultado.status === 'fulfilled') {
          resultado.value.forEach((entrega) => {
            consolidado.push({ entrega, municipalidad });
          });
        }
      });
      setMunicipalidades(municipalidadesData);
      setEntregas(consolidado);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtradas = useMemo(
    () =>
      entregas.filter(({ entrega, municipalidad }) => {
        const fecha = entrega.fechaRegistro.slice(0, 10);
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        if (municipalidadId !== 'TODAS' && String(municipalidad.id) !== municipalidadId) {
          return false;
        }
        if (estado !== 'TODOS' && entrega.estado !== estado) return false;
        return true;
      }),
    [desde, entregas, estado, hasta, municipalidadId],
  );

  const resumen = useMemo(() => {
    const mapa = new Map<
      number,
      { municipalidad: Municipalidad; total: number; confirmadas: number; pendientes: number; rechazadas: number }
    >();
    filtradas.forEach(({ entrega, municipalidad }) => {
      const actual = mapa.get(municipalidad.id) ?? {
        municipalidad,
        total: 0,
        confirmadas: 0,
        pendientes: 0,
        rechazadas: 0,
      };
      actual.total += 1;
      if (entrega.estado === 'CONFIRMADA') actual.confirmadas += 1;
      if (entrega.estado === 'REGISTRADA' || entrega.estado === 'EN_PROCESO') {
        actual.pendientes += 1;
      }
      if (entrega.estado === 'RECHAZADA') actual.rechazadas += 1;
      mapa.set(municipalidad.id, actual);
    });
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }, [filtradas]);

  const confirmadas = filtradas.filter(
    ({ entrega }) => entrega.estado === 'CONFIRMADA',
  ).length;
  const pendientes = filtradas.filter(
    ({ entrega }) => entrega.estado === 'REGISTRADA' || entrega.estado === 'EN_PROCESO',
  ).length;
  const tasa = filtradas.length ? Math.round((confirmadas / filtradas.length) * 100) : 0;

  const exportar = () => {
    if (!filtradas.length) {
      showToast('No hay entregas para exportar con los filtros actuales.', 'info');
      return;
    }
    const filas = [
      ['ID', 'Municipalidad', 'Distrito', 'Categoría', 'Punto', 'Registro', 'Estado'],
      ...filtradas.map(({ entrega, municipalidad }) => [
        String(entrega.id),
        municipalidad.nombre,
        municipalidad.distrito,
        entrega.nombreCategoriaVisible,
        entrega.puntoRecoleccionNombre,
        formatearFechaHora(entrega.fechaRegistro),
        ESTADOS[entrega.estado].label,
      ]),
    ];
    const contenido = filas.map((fila) => fila.map(escaparCsv).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `reporte-consolidado-${desde}-a-${hasta}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
    showToast('Reporte consolidado exportado en formato CSV.');
  };

  return (
    <section>
      <PageHeader
        title="Reportes consolidados"
        description="Compara la operación de todas las municipalidades y descarga el detalle consolidado."
        actions={
          <Button icon="download" variant="secondary" onClick={exportar}>
            Exportar CSV
          </Button>
        }
      />

      {error ? (
        <PanelAlert onCerrar={() => setError('')}>
          {error}{' '}
          <button type="button" className="panel-alert__link" onClick={() => void cargar()}>
            Reintentar
          </button>
        </PanelAlert>
      ) : null}

      <Card>
        <div className="report-filters">
          <label className="ui-field">
            <span>Desde</span>
            <input type="date" value={desde} onChange={(evento) => setDesde(evento.target.value)} />
          </label>
          <label className="ui-field">
            <span>Hasta</span>
            <input type="date" value={hasta} onChange={(evento) => setHasta(evento.target.value)} />
          </label>
          <label className="ui-field">
            <span>Municipalidad</span>
            <select
              value={municipalidadId}
              onChange={(evento) => setMunicipalidadId(evento.target.value)}
            >
              <option value="TODAS">Todas</option>
              {municipalidades.map((municipalidad) => (
                <option key={municipalidad.id} value={municipalidad.id}>
                  {municipalidad.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span>Estado</span>
            <select
              value={estado}
              onChange={(evento) => setEstado(evento.target.value as 'TODOS' | EstadoEntrega)}
            >
              <option value="TODOS">Todos</option>
              {(Object.keys(ESTADOS) as EstadoEntrega[]).map((clave) => (
                <option key={clave} value={clave}>
                  {ESTADOS[clave].label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {cargando ? (
        <div className="panel-loading">
          <span className="panel-spinner" />
          <span>Cargando reporte consolidado...</span>
        </div>
      ) : (
        <>
          <section className="ui-stats">
            <StatCard
              label="Entregas en el rango"
              value={filtradas.length}
              description={`${desde || 'Sin inicio'} a ${hasta || 'Sin fin'}`}
              icon="scan"
            />
            <StatCard
              label="Confirmadas"
              value={confirmadas}
              description="Certificados emitidos"
              icon="checkCircle"
              tone="success"
            />
            <StatCard
              label="Pendientes"
              value={pendientes}
              description="En revisión"
              icon="clock"
              tone="warning"
            />
            <StatCard
              label="Tasa global"
              value={`${tasa}%`}
              description="Sobre entregas filtradas"
              icon="chart"
            />
          </section>

          <Card>
            <header className="ui-card__header">
              <div>
                <h3>Resumen por municipalidad</h3>
                <p>{pluralizar(resumen.length, 'municipalidad con actividad', 'municipalidades con actividad')}</p>
              </div>
            </header>

            {resumen.length ? (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Municipalidad</th>
                      <th>Total</th>
                      <th>Confirmadas</th>
                      <th>Pendientes</th>
                      <th>Rechazadas</th>
                      <th>Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.map((fila) => (
                      <tr key={fila.municipalidad.id}>
                        <td>
                          <span className="ui-table__main">{fila.municipalidad.nombre}</span>
                          <span className="ui-table__sub">{fila.municipalidad.distrito}</span>
                        </td>
                        <td className="ui-table__muted">{fila.total}</td>
                        <td>
                          <StatusDot tone="success" label={String(fila.confirmadas)} />
                        </td>
                        <td>
                          <StatusDot tone="warning" label={String(fila.pendientes)} />
                        </td>
                        <td>
                          <StatusDot tone="danger" label={String(fila.rechazadas)} />
                        </td>
                        <td>
                          <span className="ui-table__metric">
                            {fila.total ? Math.round((fila.confirmadas / fila.total) * 100) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon="file"
                title="Sin datos en este rango"
                description="Ajusta las fechas, la municipalidad o el estado para ver resultados."
                compact
              />
            )}
          </Card>

          {filtradas.length ? (
            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Detalle consolidado</h3>
                  <p>Últimas entregas incluidas en el reporte.</p>
                </div>
                <Icon name="file" size={16} />
              </header>
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Municipalidad</th>
                      <th>Categoría</th>
                      <th>Punto</th>
                      <th>Registro</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas
                      .slice()
                      .sort((a, b) => b.entrega.fechaRegistro.localeCompare(a.entrega.fechaRegistro))
                      .slice(0, 12)
                      .map(({ entrega, municipalidad }) => (
                        <tr key={`${municipalidad.id}-${entrega.id}`}>
                          <td>
                            <span className="ui-table__main">{municipalidad.nombre}</span>
                            <span className="ui-table__sub">{municipalidad.distrito}</span>
                          </td>
                          <td className="ui-table__muted">{entrega.nombreCategoriaVisible}</td>
                          <td className="ui-table__muted">{entrega.puntoRecoleccionNombre}</td>
                          <td className="ui-table__muted">
                            {formatearFechaHora(entrega.fechaRegistro)}
                          </td>
                          <td>
                            <StatusDot
                              tone={ESTADOS[entrega.estado].tone}
                              label={ESTADOS[entrega.estado].label}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {filtradas.length > 12 ? (
                <p className="table-footnote">
                  Mostrando las 12 entregas más recientes. Exporta el CSV para ver el detalle completo.
                </p>
              ) : null}
            </Card>
          ) : null}
        </>
      )}
    </section>
  );
}
