import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
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
import { obtenerMensajeError, pluralizar } from '../../utils/formato';

interface FilaResumen {
  municipalidad: Municipalidad;
  puntos: number;
  campanasActivas: number;
  entregas: number;
  confirmadas: number;
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
            (campana) => campana.municipalidadId === municipalidad.id && campana.activa,
          ).length,
          entregas: entregas.length,
          confirmadas: entregas.filter((entrega) => entrega.estado === 'CONFIRMADA').length,
        };
      }),
    [campanas, entregasPorMunicipalidad, municipalidades, puntos],
  );

  const totalEntregas = filas.reduce((total, fila) => total + fila.entregas, 0);
  const totalConfirmadas = filas.reduce((total, fila) => total + fila.confirmadas, 0);
  const activas = municipalidades.filter((municipalidad) => municipalidad.activo).length;
  const campanasActivas = campanas.filter((campana) => campana.activa).length;
  const tasaGlobal = totalEntregas ? Math.round((totalConfirmadas / totalEntregas) * 100) : 0;

  return (
    <section>
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
              description={`${tasaGlobal}% confirmadas`}
              icon="scan"
            />
          </section>

          <Card>
            <header className="ui-card__header">
              <div>
                <h3>Actividad por municipalidad</h3>
                <p>Indicadores operativos de cada gobierno local.</p>
              </div>
            </header>

            {filas.length ? (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Municipalidad</th>
                      <th>Estado</th>
                      <th>Puntos</th>
                      <th>Campañas activas</th>
                      <th>Entregas</th>
                      <th>Confirmación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((fila) => {
                      const tasa = fila.entregas
                        ? Math.round((fila.confirmadas / fila.entregas) * 100)
                        : 0;
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
                            <span className="ui-table__metric">{tasa}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
