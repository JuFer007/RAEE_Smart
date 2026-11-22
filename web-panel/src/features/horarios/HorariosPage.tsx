import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import HorarioEditor from '../../components/HorarioEditor';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PanelAlert from '../../components/PanelAlert';
import Button, { buttonClass } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { actualizarPunto, listarPuntos } from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Punto } from '../../types';
import { obtenerMensajeError, pluralizar } from '../../utils/formato';
import {
  formatearHorario,
  horarioVacio,
  parsearHorario,
  validarHorario,
  type HorarioValor,
} from '../../utils/horario';

export default function HorariosPage() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [puntoEditando, setPuntoEditando] = useState<Punto | null>(null);
  const [horario, setHorario] = useState<HorarioValor>(horarioVacio());
  const [errorHorario, setErrorHorario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setPuntos(await listarPuntos());
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    if (!texto) return puntos;
    return puntos.filter((punto) =>
      `${punto.nombre} ${punto.direccion ?? ''} ${punto.horarioAtencion ?? ''}`
        .toLocaleLowerCase('es')
        .includes(texto),
    );
  }, [busqueda, puntos]);

  const conHorario = puntos.filter((punto) => punto.horarioAtencion).length;
  const sinHorario = puntos.length - conHorario;

  const abrirEdicion = (punto: Punto) => {
    setPuntoEditando(punto);
    setHorario(parsearHorario(punto.horarioAtencion) ?? horarioVacio());
    setErrorHorario('');
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!puntoEditando) return;
    const errorHorario = validarHorario(horario, {
      obligatorio: true,
      permitirSinHorario: true,
    });
    if (errorHorario) {
      setErrorHorario(errorHorario);
      return;
    }
    if (!usuario?.municipalidadId) {
      setErrorHorario('No se pudo identificar tu municipalidad.');
      return;
    }

    setGuardando(true);
    setErrorHorario('');
    try {
      const actualizado = await actualizarPunto(puntoEditando.id, {
        municipalidadId: usuario.municipalidadId,
        nombre: puntoEditando.nombre,
        direccion: puntoEditando.direccion ?? '',
        latitud: puntoEditando.latitud,
        longitud: puntoEditando.longitud,
        horarioAtencion: formatearHorario(horario),
        capacidadDiaria: puntoEditando.capacidadDiaria ?? null,
      });
      setPuntos((actuales) =>
        actuales.map((punto) => (punto.id === actualizado.id ? actualizado : punto)),
      );
      setPuntoEditando(null);
      showToast('Horario actualizado. Los ciudadanos serán notificados del cambio.');
    } catch (err) {
      setErrorHorario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="horarios">
      <PageHeader
        title="Horarios de atención"
        description="Mantén actualizada la disponibilidad de cada punto para que los ciudadanos planifiquen su entrega."
      />

      {error ? (
        <PanelAlert onCerrar={() => setError('')}>
          {error}{' '}
          <button type="button" className="panel-alert__link" onClick={() => void cargar()}>
            Reintentar
          </button>
        </PanelAlert>
      ) : null}

      <section className="ui-stats">
        <StatCard
          label="Puntos registrados"
          value={puntos.length}
          description={pluralizar(puntos.length, 'punto en total', 'puntos en total')}
          icon="location"
        />
        <StatCard
          label="Con horario"
          value={conHorario}
          description="Visibles con disponibilidad"
          icon="clock"
          tone="success"
        />
        <StatCard
          label="Por completar"
          value={sinHorario}
          description="Sin horario definido"
          icon="alert"
          tone={sinHorario ? 'warning' : 'neutral'}
        />
      </section>

      <Card>
        <div className="filter-bar">
          <div className="ui-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar punto, dirección u horario"
              aria-label="Buscar horarios"
            />
          </div>
          <span className="filter-bar__count">
            {pluralizar(filtrados.length, 'punto', 'puntos')}
          </span>
        </div>

        {cargando ? (
          <div className="panel-loading">
            <span className="panel-spinner" />
            <span>Cargando horarios...</span>
          </div>
        ) : filtrados.length ? (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Punto</th>
                  <th>Horario actual</th>
                  <th>Capacidad</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((punto) => (
                  <tr key={punto.id}>
                    <td>
                      <span className="ui-table__main">{punto.nombre}</span>
                      <span className="ui-table__sub">
                        {punto.direccion || 'Sin dirección registrada'}
                      </span>
                    </td>
                    <td>
                      {punto.horarioAtencion ? (
                        <span className="ui-table__main">{punto.horarioAtencion}</span>
                      ) : (
                        <span className="ui-inline-warning">Sin horario definido</span>
                      )}
                    </td>
                    <td className="ui-table__muted">
                      {punto.capacidadDiaria
                        ? `${punto.capacidadDiaria} equipos/día`
                        : 'No definida'}
                    </td>
                    <td className="ui-table__actions">
                      <button
                        type="button"
                        className={buttonClass('ghost')}
                        onClick={() => abrirEdicion(punto)}
                      >
                        <Icon name="edit" size={15} />
                        Editar horario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={busqueda ? 'search' : 'clock'}
            title={busqueda ? 'Sin resultados' : 'Aún no hay puntos'}
            description={
              busqueda
                ? 'Prueba con otro nombre o dirección.'
                : 'Registra puntos de acopio para definir sus horarios.'
            }
            compact
          />
        )}
      </Card>

      <Modal
        abierto={Boolean(puntoEditando)}
        titulo="Editar horario de atención"
        descripcion={puntoEditando?.nombre}
        ancho={460}
        onCerrar={() => {
          if (!guardando) setPuntoEditando(null);
        }}
      >
        <form className="panel-form" onSubmit={guardar} noValidate>
          {errorHorario ? <PanelAlert>{errorHorario}</PanelAlert> : null}
          <HorarioEditor
            id="horario-punto"
            valor={horario}
            onChange={(valor) => {
              setHorario(valor);
              setErrorHorario('');
            }}
            error={errorHorario}
            ayuda="Al guardar se notificará a los ciudadanos sobre el cambio de horario."
            obligatorio
          />
          <div className="panel-form__acciones">
            <Button
              variant="secondary"
              onClick={() => setPuntoEditando(null)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar horario'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
