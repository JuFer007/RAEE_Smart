import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import EntregasPorMesChart from '../../components/charts/EntregasPorMesChart';
import { buttonClass } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import {
  listarCampanas,
  listarEntregas,
  listarMunicipalidades,
  listarPuntos,
} from '../../api/panel';
import type { Campana, Entrega, Municipalidad, Punto } from '../../types';
import {
  fechaHoyISO,
  formatearConfianza,
  formatearFechaHora,
  obtenerMensajeError,
  pluralizar,
  sumarDias,
} from '../../utils/formato';

interface FilaResumen {
  municipalidad: Municipalidad;
  puntos: number;
  campanasActivas: number;
  entregas: number;
  confirmadas: number;
  ultimaEntrega: string | null;
}

type CampoOrden = 'municipalidad' | 'puntos' | 'campanas' | 'entregas' | 'confirmacion';

interface Alerta {
  id: string;
  icono: string;
  titulo: string;
  detalle: string;
  to: string;
  accion: string;
}

function confianzaNormalizada(valor: number): number {
  return valor <= 1 ? valor * 100 : valor;
}

function tasaConfirmacion(fila: FilaResumen): number {
  return fila.entregas ? Math.round((fila.confirmadas / fila.entregas) * 100) : 0;
}

function valorOrden(fila: FilaResumen, campo: CampoOrden): string | number {
  if (campo === 'municipalidad') return fila.municipalidad.nombre.toLowerCase();
  if (campo === 'puntos') return fila.puntos;
  if (campo === 'campanas') return fila.campanasActivas;
  if (campo === 'entregas') return fila.entregas;
  return tasaConfirmacion(fila);
}

export default function AdminResumenPage() {
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [entregasPorMunicipalidad, setEntregasPorMunicipalidad] = useState<
    Record<number, Entrega[]>
  >({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ campo: CampoOrden; direccion: 'asc' | 'desc' }>({
    campo: 'entregas',
    direccion: 'desc',
  });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [municipalidadesData, puntosData, campanasData] = await Promise.all([
        listarMunicipalidades(),
        listarPuntos(),
        listarCampanas(),
      ]);
      const resultados = await Promise.allSettled(
        municipalidadesData.map((municipalidad) => listarEntregas(municipalidad.id)),
      );
      const entregas: Record<number, Entrega[]> = {};
      municipalidadesData.forEach((municipalidad, indice) => {
        const resultado = resultados[indice];
        entregas[municipalidad.id] = resultado.status === 'fulfilled' ? resultado.value : [];
      });
      setMunicipalidades(municipalidadesData);
      setPuntos(puntosData);
      setCampanas(campanasData);
      setEntregasPorMunicipalidad(entregas);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filas = useMemo<FilaResumen[]>(
    () =>
      municipalidades.map((municipalidad) => {
        const entregas = entregasPorMunicipalidad[municipalidad.id] ?? [];
        return {
          municipalidad,
          puntos: puntos.filter((punto) => punto.municipalidadId === municipalidad.id).length,
          campanasActivas: campanas.filter(
            (campana) =>
              campana.municipalidadId === municipalidad.id &&
              campana.activa &&
              campana.estado !== 'FINALIZADA',
          ).length,
          entregas: entregas.length,
          confirmadas: entregas.filter((entrega) => entrega.estado === 'CONFIRMADA').length,
          ultimaEntrega: entregas.reduce<string | null>(
            (maxima, entrega) =>
              !maxima || entrega.fechaRegistro > maxima ? entrega.fechaRegistro : maxima,
            null,
          ),
        };
      }),
    [campanas, entregasPorMunicipalidad, municipalidades, puntos],
  );

  const entregasPlanas = useMemo(
    () => Object.values(entregasPorMunicipalidad).flat(),
    [entregasPorMunicipalidad],
  );

  const totalEntregas = filas.reduce((total, fila) => total + fila.entregas, 0);
  const totalConfirmadas = filas.reduce((total, fila) => total + fila.confirmadas, 0);
  const activas = municipalidades.filter((municipalidad) => municipalidad.activo).length;
  const campanasActivas = campanas.filter(
    (campana) => campana.activa && campana.estado !== 'FINALIZADA',
  ).length;
  const tasaGlobal = totalEntregas ? Math.round((totalConfirmadas / totalEntregas) * 100) : 0;
  const corte7 = sumarDias(fechaHoyISO(), -7);
  const corte30 = sumarDias(fechaHoyISO(), -30);
  const recientes = entregasPlanas.filter(
    (entrega) => entrega.fechaRegistro.slice(0, 10) >= corte7,
  ).length;
  const tendenciaEntregas = recientes
    ? `+${pluralizar(recientes, 'entrega', 'entregas')} esta semana`
    : 'Sin cambios esta semana';
  const confianzaPromedio = entregasPlanas.length
    ? Math.round(
        entregasPlanas.reduce(
          (total, entrega) => total + confianzaNormalizada(entrega.confianzaIa),
          0,
        ) / entregasPlanas.length,
      )
    : 0;

  const alertas = useMemo<Alerta[]>(() => {
    const resultado: Alerta[] = [];
    filas
      .filter((fila) => fila.entregas > 0 && fila.confirmadas === 0)
      .slice(0, 3)
      .forEach((fila) => {
        resultado.push({
          id: `confirmacion-${fila.municipalidad.id}`,
          icono: 'alert',
          titulo: `${fila.municipalidad.nombre} sin entregas confirmadas`,
          detalle: `${pluralizar(fila.entregas, 'entrega registrada', 'entregas registradas')} con 0% de confirmación.`,
          to: `/panel/municipalidades/${fila.municipalidad.id}`,
          accion: 'Revisar',
        });
      });
    filas
      .filter((fila) => !fila.ultimaEntrega || fila.ultimaEntrega.slice(0, 10) < corte30)
      .slice(0, 3)
      .forEach((fila) => {
        resultado.push({
          id: `inactiva-${fila.municipalidad.id}`,
          icono: 'clock',
          titulo: `${fila.municipalidad.nombre} sin actividad reciente`,
          detalle: fila.ultimaEntrega
            ? `Última entrega el ${formatearFechaHora(fila.ultimaEntrega)}.`
            : 'Aún no registra entregas.',
          to: `/panel/municipalidades/${fila.municipalidad.id}`,
          accion: 'Ver detalle',
        });
      });
    resultado.push({
      id: 'confianza-ia',
      icono: 'sparkles',
      titulo: `Confianza media de la IA: ${formatearConfianza(confianzaPromedio)}`,
      detalle: entregasPlanas.length
        ? `Calculada sobre ${pluralizar(entregasPlanas.length, 'clasificación', 'clasificaciones')}.`
        : 'Sin clasificaciones registradas.',
      to: '/panel/calidad-ia',
      accion: 'Ver calidad de la IA',
    });
    return resultado;
  }, [confianzaPromedio, corte30, entregasPlanas.length, filas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const base = filas.filter(
      (fila) =>
        !texto ||
        fila.municipalidad.nombre.toLowerCase().includes(texto) ||
        fila.municipalidad.distrito.toLowerCase().includes(texto),
    );
    return [...base].sort((a, b) => {
      const valorA = valorOrden(a, orden.campo);
      const valorB = valorOrden(b, orden.campo);
      const diferencia =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'es');
      return orden.direccion === 'asc' ? diferencia : -diferencia;
    });
  }, [busqueda, filas, orden]);

  const cambiarOrden = (campo: CampoOrden) => {
    setOrden((actual) =>
      actual.campo === campo
        ? { campo, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
        : { campo, direccion: campo === 'municipalidad' ? 'asc' : 'desc' },
    );
  };

  const encabezado = (campo: CampoOrden, etiqueta: string) => {
    const activo = orden.campo === campo;
    return (
      <th key={campo}>
        <button
          type="button"
          className={`ui-table__sort${activo ? ' is-active' : ''}`}
          onClick={() => cambiarOrden(campo)}
        >
          {etiqueta}
          <Icon name={activo && orden.direccion === 'desc' ? 'arrowDown' : 'arrowUp'} size={13} />
        </button>
      </th>
    );
  };

  return (
    <section className="admin-resumen">
      <PageHeader
        title="Resumen general"
        description="Estado consolidado de municipalidades, puntos de entrega y actividad de la plataforma."
        actions={
          <Link to="/panel/municipalidades" className={buttonClass('secondary')}>
            <Icon name="building" size={16} />
            Gestionar municipalidades
          </Link>
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

      {cargando ? (
        <div className="panel-loading">
          <span className="panel-spinner" />
          <span>Cargando resumen...</span>
        </div>
      ) : (
        <>
          <section className="ui-stats">
            <StatCard
              label="Municipalidades"
              value={municipalidades.length}
              description={`${activas} activas`}
              icon="building"
            />
            <StatCard
              label="Puntos de entrega"
              value={puntos.length}
              description="En toda la plataforma"
              icon="location"
            />
            <StatCard
              label="Campañas activas"
              value={campanasActivas}
              description={pluralizar(campanas.length, 'campaña registrada', 'campañas registradas')}
              icon="calendar"
              tone="success"
            />
            <StatCard
              label="Entregas registradas"
              value={totalEntregas}
              trend={tendenciaEntregas}
              description={`${tasaGlobal}% confirmadas`}
              icon="scan"
            />
          </section>

          <div className="admin-resumen__grid">
            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Entregas por mes</h3>
                  <p>Actividad de los últimos seis meses en toda la plataforma.</p>
                </div>
              </header>
              <EntregasPorMesChart entregas={entregasPlanas} />
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Requieren atención</h3>
                  <p>Municipalidades y calidad que conviene revisar.</p>
                </div>
              </header>
              {alertas.length ? (
                <ul className="admin-alertas">
                  {alertas.map((alerta) => (
                    <li key={alerta.id}>
                      <span className="admin-alertas__icon">
                        <Icon name={alerta.icono} size={15} />
                      </span>
                      <div>
                        <strong>{alerta.titulo}</strong>
                        <small>{alerta.detalle}</small>
                      </div>
                      <Link to={alerta.to}>{alerta.accion}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="checkCircle"
                  title="Sin alertas por ahora"
                  description="La actividad registrada no muestra casos críticos."
                  compact
                />
              )}
            </Card>
          </div>

          <Card>
            <header className="ui-card__header">
              <div>
                <h3>Actividad por municipalidad</h3>
                <p>Indicadores operativos de cada gobierno local.</p>
              </div>
            </header>

            {filas.length ? (
              <>
                <div className="filter-bar">
                  <label className="ui-search">
                    <Icon name="search" size={16} />
                    <input
                      value={busqueda}
                      onChange={(evento) => setBusqueda(evento.target.value)}
                      placeholder="Buscar municipalidad o distrito"
                      aria-label="Buscar municipalidad"
                    />
                  </label>
                  <span className="filter-bar__count">
                    {pluralizar(filtradas.length, 'resultado', 'resultados')}
                  </span>
                </div>
                <div className="ui-table-wrap">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        {encabezado('municipalidad', 'Municipalidad')}
                        <th>Estado</th>
                        {encabezado('puntos', 'Puntos')}
                        {encabezado('campanas', 'Campañas activas')}
                        {encabezado('entregas', 'Entregas')}
                        {encabezado('confirmacion', 'Confirmación')}
                        <th>Satisfacción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((fila) => {
                        const tasa = tasaConfirmacion(fila);
                        return (
                          <tr key={fila.municipalidad.id}>
                            <td>
                              <span className="ui-table__main">{fila.municipalidad.nombre}</span>
                              <span className="ui-table__sub">{fila.municipalidad.distrito}</span>
                            </td>
                            <td>
                              <StatusDot
                                tone={fila.municipalidad.activo ? 'success' : 'neutral'}
                                label={fila.municipalidad.activo ? 'Activa' : 'Inactiva'}
                              />
                            </td>
                            <td className="ui-table__muted">{fila.puntos}</td>
                            <td className="ui-table__muted">{fila.campanasActivas}</td>
                            <td className="ui-table__muted">{fila.entregas}</td>
                            <td>
                              <div className="ui-table__metric">{tasa}%</div>
                              <div className="bar-track">
                                <span
                                  className={`bar-fill${
                                    tasa >= 80 ? ' bar-fill--success' : ' bar-fill--warning'
                                  }`}
                                  style={{ width: `${tasa}%` }}
                                />
                              </div>
                            </td>
                            <td className="ui-table__muted">—</td>
                            <td>
                              <Link
                                to={`/panel/municipalidades/${fila.municipalidad.id}`}
                                className="ui-table__link"
                              >
                                Ver detalle
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {!filtradas.length ? (
                  <EmptyState
                    icon="search"
                    title="Sin municipalidades para la búsqueda"
                    description="Prueba con otro nombre o distrito."
                    compact
                  />
                ) : null}
              </>
            ) : (
              <EmptyState
                icon="building"
                title="Aún no hay municipalidades"
                description="Registra la primera municipalidad para comenzar a operar."
                compact
              />
            )}
          </Card>
        </>
      )}
    </section>
  );
}
