import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import { listarEntregas, listarMunicipalidades } from '../../api/panel';
import type { Entrega, Municipalidad } from '../../types';
import {
  formatearConfianza,
  formatearFechaHora,
  iconoRaee,
  obtenerMensajeError,
} from '../../utils/formato';

interface EntregaConMunicipalidad {
  entrega: Entrega;
  municipalidad: Municipalidad;
}

function confianzaNormalizada(valor: number): number {
  return valor <= 1 ? valor * 100 : valor;
}

export default function CalidadIaPage() {
  const [entregas, setEntregas] = useState<EntregaConMunicipalidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const municipalidades = await listarMunicipalidades();
      const resultados = await Promise.allSettled(
        municipalidades.map((municipalidad) => listarEntregas(municipalidad.id)),
      );
      const consolidado: EntregaConMunicipalidad[] = [];
      municipalidades.forEach((municipalidad, indice) => {
        const resultado = resultados[indice];
        if (resultado.status === 'fulfilled') {
          resultado.value.forEach((entrega) => {
            consolidado.push({ entrega, municipalidad });
          });
        }
      });
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

  const corregidas = entregas.filter(({ entrega }) => entrega.clasificacionCorregida).length;
  const bajaConfianza = entregas.filter(
    ({ entrega }) => confianzaNormalizada(entrega.confianzaIa) < 70,
  ).length;
  const promedio = entregas.length
    ? Math.round(
        entregas.reduce(
          (total, { entrega }) => total + confianzaNormalizada(entrega.confianzaIa),
          0,
        ) / entregas.length,
      )
    : 0;
  const tasaCorreccion = entregas.length
    ? Math.round((corregidas / entregas.length) * 100)
    : 0;

  const porCategoria = useMemo(() => {
    const mapa = new Map<
      string,
      {
        nombre: string;
        icono: string;
        total: number;
        confianza: number;
        corregidas: number;
      }
    >();
    entregas.forEach(({ entrega }) => {
      const actual = mapa.get(entrega.tipoRaee) ?? {
        nombre: entrega.nombreCategoriaVisible,
        icono: iconoRaee(entrega.tipoRaee),
        total: 0,
        confianza: 0,
        corregidas: 0,
      };
      actual.total += 1;
      actual.confianza += confianzaNormalizada(entrega.confianzaIa);
      if (entrega.clasificacionCorregida) actual.corregidas += 1;
      mapa.set(entrega.tipoRaee, actual);
    });
    return [...mapa.values()]
      .map((item) => ({
        ...item,
        promedio: Math.round(item.confianza / item.total),
        tasa: Math.round((item.corregidas / item.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [entregas]);

  const recientesCorregidas = useMemo(
    () =>
      entregas
        .filter(({ entrega }) => entrega.clasificacionCorregida)
        .sort((a, b) => b.entrega.fechaRegistro.localeCompare(a.entrega.fechaRegistro))
        .slice(0, 8),
    [entregas],
  );

  return (
    <section>
      <PageHeader
        title="Calidad de la IA"
        description="Monitorea la confianza del clasificador y las correcciones realizadas por los ciudadanos."
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
          <span>Cargando indicadores de IA...</span>
        </div>
      ) : !entregas.length ? (
        <EmptyState
          icon="sparkles"
          title="Aún no hay clasificaciones"
          description="Cuando los ciudadanos registren entregas verás aquí la confianza del modelo y las correcciones."
        />
      ) : (
        <>
          <section className="ui-stats">
            <StatCard
              label="Clasificaciones"
              value={entregas.length}
              description="Entregas procesadas por IA"
              icon="sparkles"
            />
            <StatCard
              label="Confianza promedio"
              value={`${promedio}%`}
              description="Sobre las clasificaciones"
              icon="chart"
              tone={promedio >= 80 ? 'success' : 'warning'}
            />
            <StatCard
              label="Correcciones"
              value={`${tasaCorreccion}%`}
              description={`${corregidas} categorías corregidas`}
              icon="edit"
              tone={tasaCorreccion <= 15 ? 'success' : 'warning'}
            />
            <StatCard
              label="Baja confianza"
              value={bajaConfianza}
              description="Menos de 70% de confianza"
              icon="alert"
              tone={bajaConfianza ? 'warning' : 'success'}
            />
          </section>

          <div className="analytics-grid">
            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Calidad por categoría</h3>
                  <p>Confianza promedio y tasa de corrección.</p>
                </div>
              </header>
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Entregas</th>
                      <th>Confianza</th>
                      <th>Corrección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porCategoria.map((item) => (
                      <tr key={item.nombre}>
                        <td>
                          <span className="calidad-categoria">
                            <span className="calidad-categoria__icono">
                              <Icon name={item.icono} size={15} />
                            </span>
                            <span className="calidad-categoria__nombre">{item.nombre}</span>
                          </span>
                        </td>
                        <td className="ui-table__muted">{item.total}</td>
                        <td>
                          <StatusDot
                            tone={item.promedio >= 80 ? 'success' : item.promedio >= 65 ? 'warning' : 'danger'}
                            label={`${item.promedio}%`}
                          />
                        </td>
                        <td className="ui-table__muted">{item.tasa}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <header className="ui-card__header">
                <div>
                  <h3>Correcciones recientes</h3>
                  <p>Entregas donde el ciudadano ajustó la categoría.</p>
                </div>
              </header>
              {recientesCorregidas.length ? (
                <ul className="info-list">
                  {recientesCorregidas.map(({ entrega, municipalidad }) => (
                    <li key={`${municipalidad.id}-${entrega.id}`}>
                      <span className="info-list__icon">
                        <Icon name={iconoRaee(entrega.tipoRaee)} size={16} />
                      </span>
                      <div>
                        <strong>{entrega.nombreCategoriaVisible}</strong>
                        <small>
                          {municipalidad.nombre} · {formatearFechaHora(entrega.fechaRegistro)}
                        </small>
                      </div>
                      <span className="info-list__meta">
                        {formatearConfianza(entrega.confianzaIa)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="checkCircle"
                  title="Sin correcciones registradas"
                  description="Las clasificaciones aceptadas sin cambios aparecerán como casos exitosos."
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
