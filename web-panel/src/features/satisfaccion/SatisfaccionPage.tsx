import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { listarMunicipalidades, obtenerSatisfaccion } from '../../api/panel';
import type { Municipalidad, ResumenSatisfaccion } from '../../types';
import { obtenerMensajeError, pluralizar } from '../../utils/formato';

const CALIFICACIONES = [1, 2, 3, 4, 5];

function fechaLocal(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '—';
  return valor.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function colorBarra(calificacion: number): string {
  if (calificacion >= 5) return 'bar-fill--success';
  if (calificacion === 4) return 'bar-fill--info';
  if (calificacion === 3) return 'bar-fill--warning';
  return 'bar-fill--danger';
}

export default function SatisfaccionPage() {
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [municipalidadSeleccionada, setMunicipalidadSeleccionada] = useState('TODAS');
  const [datos, setDatos] = useState<ResumenSatisfaccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorMunicipalidades, setErrorMunicipalidades] = useState('');

  const cargar = useCallback(async () => {
    const id =
      municipalidadSeleccionada === 'TODAS' ? undefined : Number(municipalidadSeleccionada);
    setCargando(true);
    setError('');
    try {
      setDatos(await obtenerSatisfaccion(id));
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, [municipalidadSeleccionada]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    let activo = true;
    listarMunicipalidades()
      .then((respuesta) => {
        if (activo) setMunicipalidades(respuesta);
      })
      .catch((err: unknown) => {
        if (activo) setErrorMunicipalidades(obtenerMensajeError(err));
      });
    return () => {
      activo = false;
    };
  }, []);

  const distribucion = useMemo(() => {
    const totales = new Map(
      datos?.distribucion.map((item) => [item.calificacion, item.total]) ?? [],
    );
    return CALIFICACIONES.map((calificacion) => ({
      calificacion,
      total: totales.get(calificacion) ?? 0,
    }));
  }, [datos]);

  const sinDatos = !datos || datos.total === 0;
  const maximoDistribucion = Math.max(1, ...distribucion.map((item) => item.total));
  const total = sinDatos ? '—' : datos.total;
  const promedio =
    !sinDatos && datos.promedio !== null && datos.promedio !== undefined
      ? datos.promedio.toFixed(1)
      : '—';
  const recientes = datos?.recientes ?? [];

  return (
    <section className="satisfaccion">
      <PageHeader
        title="Satisfacción ciudadana"
        description="Valoraciones que los ciudadanos registran sobre la aplicación móvil."
        actions={
          <Button icon="refresh" variant="secondary" onClick={() => void cargar()} disabled={cargando}>
            Actualizar
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

      {errorMunicipalidades ? (
        <PanelAlert onCerrar={() => setErrorMunicipalidades('')}>
          No se pudieron cargar las municipalidades: {errorMunicipalidades}
        </PanelAlert>
      ) : null}

      <Card>
        <div className="filter-bar satisfaccion-filtros">
          <label className="ui-field">
            <span>Municipalidad</span>
            <select
              className="ui-select"
              value={municipalidadSeleccionada}
              onChange={(evento) => setMunicipalidadSeleccionada(evento.target.value)}
            >
              <option value="TODAS">Todas</option>
              {municipalidades.map((municipalidad) => (
                <option key={municipalidad.id} value={municipalidad.id}>
                  {municipalidad.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {cargando ? (
        <div className="panel-loading">
          <span className="panel-spinner" />
          <span>Cargando indicadores de satisfacción...</span>
        </div>
      ) : (
        <>
          <section className="ui-stats">
            <StatCard
              label="Evaluaciones"
              value={total}
              description={sinDatos ? 'Sin datos disponibles' : pluralizar(datos.total, 'registro', 'registros')}
              icon="inbox"
            />
            <StatCard
              label="Promedio general"
              value={promedio}
              description={sinDatos ? 'Sin datos disponibles' : 'Calificación promedio de 1 a 5'}
              icon="star"
              tone={!sinDatos && datos.promedio !== null && datos.promedio >= 4 ? 'success' : 'neutral'}
            />
          </section>

          <div className="satisfaction-grid">
            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Distribución de calificaciones</h3>
                  <p>Cantidad de evaluaciones por puntaje.</p>
                </div>
              </header>
              <div className="metric-list">
                {distribucion.map((item) => {
                  const porcentaje = sinDatos
                    ? 0
                    : Math.round((item.total / maximoDistribucion) * 100);
                  return (
                    <div className="metric-row" key={item.calificacion}>
                      <div className="metric-row__head">
                        <span className="metric-row__label">
                          <Icon name="star" size={14} />
                          {item.calificacion} {item.calificacion === 1 ? 'estrella' : 'estrellas'}
                        </span>
                        <strong>{sinDatos ? '—' : item.total}</strong>
                      </div>
                      <span className="bar-track">
                        <span
                          className={`bar-fill ${colorBarra(item.calificacion)}${sinDatos ? ' is-vacio' : ''}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="table-footnote">
                {sinDatos ? '—' : `Basado en ${pluralizar(datos.total, 'evaluación', 'evaluaciones')}.`}
              </p>
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Comentarios recientes</h3>
                  <p>Opiniones registradas por los ciudadanos.</p>
                </div>
              </header>
              {recientes.length ? (
                <ul className="info-list">
                  {recientes.map((item) => (
                    <li key={item.id}>
                      <span className="info-list__icon">
                        <Icon name="star" size={16} />
                      </span>
                      <div>
                        <strong>{item.ciudadanoNombre}</strong>
                        <small>
                          {item.municipalidadNombre || 'Sin municipalidad'} ·{' '}
                          {fechaLocal(item.fechaActualizacion || item.fechaRegistro)}
                        </small>
                        <span className="satisfaccion-comentario">
                          {item.comentario?.trim() || 'Sin comentario'}
                        </span>
                      </div>
                      <span className="info-list__meta">{item.calificacion}/5</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="star"
                  title="Sin comentarios registrados"
                  description="Las valoraciones de la app aparecerán aquí cuando los ciudadanos las registren."
                  compact
                />
              )}
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
