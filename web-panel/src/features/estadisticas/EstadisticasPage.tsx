import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import { listarEntregas } from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import type { Entrega, EstadoEntrega } from '../../types';
import {
  fechaHoyISO,
  iconoRaee,
  obtenerMensajeError,
  pluralizar,
  sumarDias,
} from '../../utils/formato';

const ESTADOS: Record<EstadoEntrega, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  REGISTRADA: { label: 'Registradas', tone: 'info' },
  EN_PROCESO: { label: 'En proceso', tone: 'warning' },
  CONFIRMADA: { label: 'Confirmadas', tone: 'success' },
  RECHAZADA: { label: 'Rechazadas', tone: 'danger' },
};

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function EstadisticasPage() {
  const { usuario } = useAuth();
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
      setEntregas(await listarEntregas(municipalidadId));
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, [municipalidadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const confirmadas = entregas.filter((entrega) => entrega.estado === 'CONFIRMADA').length;
  const pendientes = entregas.filter(
    (entrega) => entrega.estado === 'REGISTRADA' || entrega.estado === 'EN_PROCESO',
  ).length;
  const tasaConfirmacion = entregas.length
    ? Math.round((confirmadas / entregas.length) * 100)
    : 0;

  const porEstado = useMemo(
    () =>
      (Object.keys(ESTADOS) as EstadoEntrega[]).map((estado) => ({
        estado,
        ...ESTADOS[estado],
        total: entregas.filter((entrega) => entrega.estado === estado).length,
      })),
    [entregas],
  );

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, { nombre: string; icono: string; total: number }>();
    entregas.forEach((entrega) => {
      const actual = mapa.get(entrega.tipoRaee);
      if (actual) {
        actual.total += 1;
      } else {
        mapa.set(entrega.tipoRaee, {
          nombre: entrega.nombreCategoriaVisible,
          icono: iconoRaee(entrega.tipoRaee),
          total: 1,
        });
      }
    });
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }, [entregas]);

  const porPunto = useMemo(() => {
    const mapa = new Map<string, number>();
    entregas.forEach((entrega) => {
      mapa.set(
        entrega.puntoRecoleccionNombre,
        (mapa.get(entrega.puntoRecoleccionNombre) ?? 0) + 1,
      );
    });
    return [...mapa.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [entregas]);

  const ultimosDias = useMemo(() => {
    const hoy = fechaHoyISO();
    return Array.from({ length: 7 }, (_, indice) => {
      const fecha = sumarDias(hoy, indice - 6);
      const [anio, mes, dia] = fecha.split('-').map(Number);
      const fechaObj = new Date(anio, mes - 1, dia);
      return {
        fecha,
        etiqueta: DIAS[(fechaObj.getDay() + 6) % 7],
        total: entregas.filter((entrega) => entrega.fechaRegistro.slice(0, 10) === fecha)
          .length,
      };
    });
  }, [entregas]);

  const maxCategoria = Math.max(...porCategoria.map((item) => item.total), 1);
  const maxPunto = Math.max(...porPunto.map((item) => item.total), 1);
  const maxDia = Math.max(...ultimosDias.map((item) => item.total), 1);

  return (
    <section>
      <PageHeader
        title="Estadísticas"
        description="Lectura rápida del comportamiento de las entregas registradas en tu municipalidad."
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
          <span>Cargando estadísticas...</span>
        </div>
      ) : !entregas.length ? (
        <EmptyState
          icon="chart"
          title="Aún no hay datos para analizar"
          description="Cuando se registren entregas desde la app móvil verás aquí su distribución y evolución."
        />
      ) : (
        <>
          <section className="ui-stats">
            <StatCard
              label="Entregas totales"
              value={entregas.length}
              description={pluralizar(entregas.length, 'registro acumulado', 'registros acumulados')}
              icon="scan"
            />
            <StatCard
              label="Confirmadas"
              value={confirmadas}
              description="Recepciones certificadas"
              icon="checkCircle"
              tone="success"
            />
            <StatCard
              label="Pendientes"
              value={pendientes}
              description="En cola de revisión"
              icon="clock"
              tone="warning"
            />
            <StatCard
              label="Tasa de confirmación"
              value={`${tasaConfirmacion}%`}
              description="Sobre el total recibido"
              icon="chart"
              tone={tasaConfirmacion >= 70 ? 'success' : 'neutral'}
            />
          </section>

          <div className="analytics-grid">
            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Distribución por estado</h3>
                  <p>Cómo se encuentra el flujo de recepción.</p>
                </div>
              </header>
              <div className="metric-list">
                {porEstado.map((item) => (
                  <div key={item.estado} className="metric-row">
                    <div className="metric-row__head">
                      <StatusDot tone={item.tone} label={item.label} />
                      <strong>{item.total}</strong>
                    </div>
                    <div className="bar-track">
                      <span
                        className={`bar-fill bar-fill--${item.tone}`}
                        style={{ width: `${(item.total / entregas.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Entregas por categoría</h3>
                  <p>Tipos de RAEE con mayor volumen.</p>
                </div>
              </header>
              <div className="metric-list">
                {porCategoria.slice(0, 6).map((item) => (
                  <div key={item.nombre} className="metric-row">
                    <div className="metric-row__head">
                      <span className="metric-row__label">
                        <Icon name={item.icono} size={15} />
                        {item.nombre}
                      </span>
                      <strong>{item.total}</strong>
                    </div>
                    <div className="bar-track">
                      <span
                        className="bar-fill"
                        style={{ width: `${(item.total / maxCategoria) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Actividad de los últimos 7 días</h3>
                  <p>Entregas registradas por día.</p>
                </div>
              </header>
              <div className="week-chart">
                {ultimosDias.map((dia) => (
                  <div key={dia.fecha} className="week-chart__item">
                    <span className="week-chart__value">{dia.total}</span>
                    <div className="week-chart__track">
                      <span
                        className="week-chart__bar"
                        style={{ height: `${Math.max((dia.total / maxDia) * 100, 4)}%` }}
                      />
                    </div>
                    <span className="week-chart__label">{dia.etiqueta}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Puntos con más actividad</h3>
                  <p>Ranking por entregas recibidas.</p>
                </div>
              </header>
              <div className="metric-list">
                {porPunto.map((item) => (
                  <div key={item.nombre} className="metric-row">
                    <div className="metric-row__head">
                      <span className="metric-row__label">
                        <Icon name="location" size={15} />
                        {item.nombre}
                      </span>
                      <strong>{item.total}</strong>
                    </div>
                    <div className="bar-track">
                      <span
                        className="bar-fill"
                        style={{ width: `${(item.total / maxPunto) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
