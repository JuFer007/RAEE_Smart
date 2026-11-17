import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import { buttonClass } from '../../components/ui/Button';
import { listarCampanas, listarEntregas, listarPuntos } from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import type { Campana, Entrega, EstadoEntrega, Punto } from '../../types';
import {
  formatearFechaHora,
  formatearRango,
  iconoRaee,
  obtenerMensajeError,
  pluralizar,
} from '../../utils/formato';

const ESTADOS: Record<
  EstadoEntrega,
  { etiqueta: string; tone: 'info' | 'warning' | 'success' | 'danger' }
> = {
  REGISTRADA: { etiqueta: 'Registrada', tone: 'info' },
  EN_PROCESO: { etiqueta: 'En proceso', tone: 'warning' },
  CONFIRMADA: { etiqueta: 'Confirmada', tone: 'success' },
  RECHAZADA: { etiqueta: 'Rechazada', tone: 'danger' },
};

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const municipalidadId = usuario?.municipalidadId;

  const cargar = useCallback(async () => {
    if (!municipalidadId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError('');
    try {
      const [puntosData, campanasData, entregasData] = await Promise.all([
        listarPuntos(),
        listarCampanas(),
        listarEntregas(municipalidadId),
      ]);
      setPuntos(puntosData);
      setCampanas(campanasData);
      setEntregas(entregasData);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, [municipalidadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || 'bienvenido';
  const campanasActivas = campanas.filter((campana) => campana.activa).length;
  const entregasPendientes = entregas.filter(
    (entrega) => entrega.estado === 'REGISTRADA' || entrega.estado === 'EN_PROCESO',
  ).length;
  const entregasConfirmadas = entregas.filter(
    (entrega) => entrega.estado === 'CONFIRMADA',
  ).length;
  const entregasRechazadas = entregas.filter(
    (entrega) => entrega.estado === 'RECHAZADA',
  ).length;
  const entregasRecientes = [...entregas]
    .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
    .slice(0, 6);
  const proximasCampanas = campanas
    .filter((campana) => campana.activa && campana.estado !== 'FINALIZADA')
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .slice(0, 3);
  const puntosDestacados = puntos.slice(0, 3);

  return (
    <div className="dashboard">
      <PageHeader
        eyebrow="Panel municipal"
        title={`Hola, ${nombre}`}
        description={`Resumen operativo de ${usuario?.municipalidadNombre || 'tu municipalidad'}.`}
        actions={
          <>
            <Link to="/panel/municipal/recepcion" className={buttonClass('primary')}>
              <Icon name="scan" size={16} />
              Revisar entregas
            </Link>
            <Link to="/panel/municipal/puntos" className={buttonClass('secondary')}>
              <Icon name="location" size={16} />
              Gestionar puntos
            </Link>
            <Link to="/panel/municipal/campanas" className={buttonClass('secondary')}>
              <Icon name="calendar" size={16} />
              Gestionar campañas
            </Link>
          </>
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
          <section className="ui-stats" aria-label="Indicadores del panel">
            <StatCard
              label="Entregas recibidas"
              value={entregas.length}
              description={pluralizar(entregas.length, 'registro total', 'registros totales')}
              icon="scan"
            />
            <StatCard
              label="Pendientes"
              value={entregasPendientes}
              description="Requieren confirmación municipal"
              icon="clock"
              tone="warning"
            />
            <StatCard
              label="Confirmadas"
              value={entregasConfirmadas}
              description="Con certificado digital emitido"
              icon="checkCircle"
              tone="success"
            />
            <StatCard
              label="Rechazadas"
              value={entregasRechazadas}
              description="Ciudadano notificado"
              icon="x"
              tone="danger"
            />
          </section>

          <div className="dashboard-grid">
            <Card className="dashboard-main">
              <header className="ui-card__header">
                <div>
                  <h3>Entregas recientes</h3>
                  <p>Últimos registros recibidos desde la app móvil.</p>
                </div>
                <Link to="/panel/municipal/entregas" className="ui-link">
                  Ver todas
                </Link>
              </header>

              {entregasRecientes.length ? (
                <div className="ui-table-wrap">
                  <table className="ui-table ui-table--compact">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Punto</th>
                        <th>Registro</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregasRecientes.map((entrega) => {
                        const estado = ESTADOS[entrega.estado];
                        return (
                          <tr key={entrega.id}>
                            <td>
                              <span className="ui-table__main">
                                <Icon name={iconoRaee(entrega.tipoRaee)} size={15} />
                                {entrega.nombreCategoriaVisible}
                              </span>
                            </td>
                            <td className="ui-table__muted">
                              {entrega.puntoRecoleccionNombre}
                            </td>
                            <td className="ui-table__muted">
                              {formatearFechaHora(entrega.fechaRegistro)}
                            </td>
                            <td>
                              <StatusDot tone={estado.tone} label={estado.etiqueta} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon="scan"
                  title="Aún no hay entregas"
                  description="Los registros de la app móvil aparecerán aquí."
                  compact
                  action={
                    <Link to="/panel/municipal/recepcion" className={buttonClass('secondary')}>
                      Revisar recepción
                    </Link>
                  }
                />
              )}
            </Card>

            <div className="dashboard-side">
              <Card>
                <header className="ui-card__header">
                  <div>
                    <h3>Campañas próximas</h3>
                    <p>{pluralizar(campanasActivas, 'campaña activa', 'campañas activas')}</p>
                  </div>
                  <Link to="/panel/municipal/campanas" className="ui-link">
                    Ver todas
                  </Link>
                </header>
                {proximasCampanas.length ? (
                  <ul className="ui-list">
                    {proximasCampanas.map((campana) => (
                      <li key={campana.id}>
                        <div>
                          <strong>{campana.titulo}</strong>
                          <span>{formatearRango(campana.fechaInicio, campana.fechaFin)}</span>
                          <small>{campana.puntoRecoleccionNombre || 'Sin punto asignado'}</small>
                        </div>
                        <StatusDot
                          tone={campana.estado === 'PROXIMA' ? 'info' : 'success'}
                          label={campana.estado === 'PROXIMA' ? 'Próxima' : 'En curso'}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon="calendar"
                    title="Sin campañas activas"
                    description="Programa una jornada para mostrarla a los ciudadanos."
                    compact
                  />
                )}
              </Card>

              <Card>
                <header className="ui-card__header">
                  <div>
                    <h3>Puntos de entrega</h3>
                    <p>{pluralizar(puntos.length, 'punto registrado', 'puntos registrados')}</p>
                  </div>
                  <Link to="/panel/municipal/puntos" className="ui-link">
                    Ver todos
                  </Link>
                </header>
                {puntosDestacados.length ? (
                  <ul className="ui-list">
                    {puntosDestacados.map((punto) => (
                      <li key={punto.id}>
                        <div>
                          <strong>{punto.nombre}</strong>
                          <span>{punto.direccion || 'Sin dirección registrada'}</span>
                          <small>{punto.horarioAtencion || 'Horario por confirmar'}</small>
                        </div>
                        <Icon name="chevronRight" size={16} className="ui-list__chevron" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon="location"
                    title="Sin puntos registrados"
                    description="Registra el primer punto de entrega para aparecer en el mapa."
                    compact
                  />
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
