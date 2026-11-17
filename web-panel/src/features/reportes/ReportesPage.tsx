import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatusDot from '../../components/ui/StatusDot';
import { listarEntregas, listarPuntos } from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Entrega, EstadoEntrega, Punto } from '../../types';
import {
  fechaHoyISO,
  formatearFechaHora,
  iconoRaee,
  obtenerMensajeError,
  pluralizar,
  sumarDias,
} from '../../utils/formato';

const ESTADOS: Record<EstadoEntrega, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  REGISTRADA: { label: 'Registrada', tone: 'info' },
  EN_PROCESO: { label: 'En proceso', tone: 'warning' },
  CONFIRMADA: { label: 'Confirmada', tone: 'success' },
  RECHAZADA: { label: 'Rechazada', tone: 'danger' },
};

function escaparCsv(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export default function ReportesPage() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [desde, setDesde] = useState(sumarDias(fechaHoyISO(), -30));
  const [hasta, setHasta] = useState(fechaHoyISO());
  const [estado, setEstado] = useState<'TODOS' | EstadoEntrega>('TODOS');
  const [categoria, setCategoria] = useState('TODAS');
  const [puntoId, setPuntoId] = useState('TODOS');

  const municipalidadId = usuario?.municipalidadId;

  const cargar = useCallback(async () => {
    if (!municipalidadId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    setError('');
    try {
      const [entregasData, puntosData] = await Promise.all([
        listarEntregas(municipalidadId),
        listarPuntos(),
      ]);
      setEntregas(entregasData);
      setPuntos(puntosData);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, [municipalidadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const categorias = useMemo(
    () => [...new Set(entregas.map((entrega) => entrega.tipoRaee))].sort(),
    [entregas],
  );

  const filtradas = useMemo(() => {
    return entregas
      .filter((entrega) => {
        const fecha = entrega.fechaRegistro.slice(0, 10);
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        if (estado !== 'TODOS' && entrega.estado !== estado) return false;
        if (categoria !== 'TODAS' && entrega.tipoRaee !== categoria) return false;
        if (puntoId !== 'TODOS' && String(entrega.puntoRecoleccionId) !== puntoId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro));
  }, [categoria, desde, entregas, estado, hasta, puntoId]);

  const exportar = () => {
    if (!filtradas.length) {
      showToast('No hay entregas para exportar con los filtros actuales.', 'info');
      return;
    }
    const filas = [
      ['ID', 'Categoría', 'Punto', 'Registro', 'Estado', 'Confianza IA', 'Corregida'],
      ...filtradas.map((entrega) => [
        String(entrega.id),
        entrega.nombreCategoriaVisible,
        entrega.puntoRecoleccionNombre,
        formatearFechaHora(entrega.fechaRegistro),
        ESTADOS[entrega.estado].label,
        `${Math.round(
          (entrega.confianzaIa <= 1 ? entrega.confianzaIa * 100 : entrega.confianzaIa) || 0,
        )}%`,
        entrega.clasificacionCorregida ? 'Sí' : 'No',
      ]),
    ];
    const contenido = filas.map((fila) => fila.map(escaparCsv).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `reporte-entregas-${desde}-a-${hasta}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
    showToast('Reporte exportado en formato CSV.');
  };

  return (
    <section>
      <PageHeader
        title="Reportes"
        description="Filtra y exporta el detalle de entregas para tus informes de gestión."
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
          <label className="ui-field">
            <span>Categoría</span>
            <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
              <option value="TODAS">Todas</option>
              {categorias.map((clave) => (
                <option key={clave} value={clave}>
                  {clave.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span>Punto</span>
            <select value={puntoId} onChange={(evento) => setPuntoId(evento.target.value)}>
              <option value="TODOS">Todos</option>
              {puntos.map((punto) => (
                <option key={punto.id} value={punto.id}>
                  {punto.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="report-summary">
          {pluralizar(filtradas.length, 'entrega encontrada', 'entregas encontradas')}
          {' · '}
          {desde || 'Sin inicio'} a {hasta || 'Sin fin'}
        </p>

        {cargando ? (
          <div className="panel-loading">
            <span className="panel-spinner" />
            <span>Cargando reportes...</span>
          </div>
        ) : filtradas.length ? (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Punto</th>
                  <th>Registro</th>
                  <th>Confianza IA</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((entrega) => (
                  <tr key={entrega.id}>
                    <td>
                      <span className="ui-table__main">
                        <Icon name={iconoRaee(entrega.tipoRaee)} size={15} />
                        {entrega.nombreCategoriaVisible}
                      </span>
                      <span className="ui-table__sub">#{String(entrega.id).padStart(4, '0')}</span>
                    </td>
                    <td>
                      <span className="ui-table__main">{entrega.puntoRecoleccionNombre}</span>
                      <span className="ui-table__sub">
                        {entrega.puntoRecoleccionDireccion || 'Sin dirección'}
                      </span>
                    </td>
                    <td className="ui-table__muted">
                      {formatearFechaHora(entrega.fechaRegistro)}
                    </td>
                    <td className="ui-table__muted">
                      {Math.round(
                        (entrega.confianzaIa <= 1 ? entrega.confianzaIa * 100 : entrega.confianzaIa) ||
                          0,
                      )}
                      %
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
        ) : (
          <EmptyState
            icon="file"
            title="Sin entregas en este rango"
            description="Ajusta las fechas o los filtros para encontrar resultados."
            compact
          />
        )}
      </Card>
    </section>
  );
}
