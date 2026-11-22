import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PanelAlert from '../../components/PanelAlert';
import Button, { buttonClass } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  cambiarPasswordUsuario,
  crearUsuario,
  listarMunicipalidades,
  listarUsuarios,
  type CrearUsuarioPayload,
  type FiltrosUsuarios,
  type UsuarioPayload,
} from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Municipalidad, RolUsuario, UsuarioAdmin } from '../../types';
import { formatearFechaHora, obtenerMensajeError, pluralizar } from '../../utils/formato';

interface FiltrosFormulario {
  q: string;
  rol: '' | RolUsuario;
  activo: '' | 'true' | 'false';
  municipalidadId: string;
}

interface FormularioUsuario {
  nombre: string;
  email: string;
  password: string;
  dni: string;
  telefono: string;
  rol: RolUsuario;
  municipalidadId: string;
  activo: boolean;
}

type ModalAbierto = 'datos' | 'password' | null;

const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  CIUDADANO: 'Ciudadano',
  MUNICIPALIDAD: 'Municipalidad',
  ADMIN: 'Administrador',
};

const TONO_ROL: Record<RolUsuario, string> = {
  CIUDADANO: 'neutro',
  MUNICIPALIDAD: 'exito',
  ADMIN: 'info',
};

const FORMULARIO_VACIO: FormularioUsuario = {
  nombre: '',
  email: '',
  password: '',
  dni: '',
  telefono: '',
  rol: 'CIUDADANO',
  municipalidadId: '',
  activo: true,
};

function fechaOGuion(fecha: string | null | undefined): string {
  return fecha ? formatearFechaHora(fecha) : '—';
}

function textoOGuion(texto: string | null | undefined): string {
  return texto?.trim() || '—';
}

export default function AdministradoresPage() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const municipalidadActor = usuario?.municipalidadId ?? null;
  const puedeGestionar = usuario?.rol === 'ADMIN' && !municipalidadActor;

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorMunicipalidades, setErrorMunicipalidades] = useState('');

  const [filtrosFormulario, setFiltrosFormulario] = useState<FiltrosFormulario>({
    q: '',
    rol: '',
    activo: '',
    municipalidadId: municipalidadActor ? String(municipalidadActor) : '',
  });
  const [filtros, setFiltros] = useState<FiltrosUsuarios>(
    municipalidadActor ? { municipalidadId: municipalidadActor } : {},
  );

  const [modal, setModal] = useState<ModalAbierto>(null);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [formulario, setFormulario] = useState<FormularioUsuario>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [usuarioPassword, setUsuarioPassword] = useState<UsuarioAdmin | null>(null);
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacionPassword, setConfirmacionPassword] = useState('');
  const [erroresPassword, setErroresPassword] = useState<Record<string, string>>({});

  const [confirmacion, setConfirmacion] = useState<UsuarioAdmin | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const cargar = useCallback(
    async (filtrosActuales: FiltrosUsuarios = filtros) => {
      setCargando(true);
      setError('');
      try {
        setUsuarios(await listarUsuarios(filtrosActuales));
      } catch (err) {
        setError(obtenerMensajeError(err));
      } finally {
        setCargando(false);
      }
    },
    [filtros],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    let activo = true;
    listarMunicipalidades()
      .then((datos) => {
        if (activo) setMunicipalidades(datos);
      })
      .catch((err: unknown) => {
        if (activo) setErrorMunicipalidades(obtenerMensajeError(err));
      });
    return () => {
      activo = false;
    };
  }, []);

  const aplicarFiltros = (evento?: FormEvent) => {
    evento?.preventDefault();
    setFiltros({
      q: filtrosFormulario.q.trim() || undefined,
      rol: filtrosFormulario.rol || undefined,
      activo: filtrosFormulario.activo === '' ? undefined : filtrosFormulario.activo === 'true',
      municipalidadId:
        municipalidadActor ??
        (filtrosFormulario.municipalidadId ? Number(filtrosFormulario.municipalidadId) : undefined),
    });
  };

  const limpiarFiltros = () => {
    setFiltrosFormulario({
      q: '',
      rol: '',
      activo: '',
      municipalidadId: municipalidadActor ? String(municipalidadActor) : '',
    });
    setFiltros(municipalidadActor ? { municipalidadId: municipalidadActor } : {});
  };

  const activos = usuarios.filter((item) => item.activo).length;
  const inactivos = usuarios.length - activos;
  const administradores = usuarios.filter((item) => item.rol === 'ADMIN').length;

  const abrirNuevo = () => {
    if (!puedeGestionar) return;
    setEditando(null);
    setFormulario({
      ...FORMULARIO_VACIO,
      municipalidadId: municipalidadActor ? String(municipalidadActor) : '',
    });
    setErrores({});
    setErrorFormulario('');
    setModal('datos');
  };

  const abrirEdicion = (item: UsuarioAdmin) => {
    if (!puedeGestionar) return;
    setEditando(item);
    setFormulario({
      nombre: item.nombre,
      email: item.email,
      password: '',
      dni: item.dni ?? '',
      telefono: item.telefono ?? '',
      rol: item.rol,
      municipalidadId: item.municipalidadId ? String(item.municipalidadId) : '',
      activo: item.activo,
    });
    setErrores({});
    setErrorFormulario('');
    setModal('datos');
  };

  const abrirPassword = (item: UsuarioAdmin) => {
    if (!puedeGestionar) return;
    setUsuarioPassword(item);
    setPasswordNueva('');
    setConfirmacionPassword('');
    setErroresPassword({});
    setModal('password');
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModal(null);
    setEditando(null);
    setUsuarioPassword(null);
    setErrorFormulario('');
  };

  const cambiarCampo = <K extends keyof FormularioUsuario>(
    campo: K,
    valor: FormularioUsuario[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: '' }));
  };

  const validar = (): UsuarioPayload | CrearUsuarioPayload | null => {
    const nuevos: Record<string, string> = {};
    const nombre = formulario.nombre.trim();
    const email = formulario.email.trim();
    const municipalidadId = formulario.municipalidadId
      ? Number(formulario.municipalidadId)
      : null;

    if (!nombre) nuevos.nombre = 'El nombre es obligatorio.';
    else if (nombre.length > 150) nuevos.nombre = 'El nombre no debe superar los 150 caracteres.';

    if (!email) nuevos.email = 'El correo es obligatorio.';
    else if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevos.email = 'Ingresa un correo válido.';
    }

    if (!editando && formulario.password.length < 8) {
      nuevos.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (formulario.rol === 'MUNICIPALIDAD' && !municipalidadId) {
      nuevos.municipalidadId = 'Selecciona la municipalidad del usuario.';
    }

    if (municipalidadId !== null && (!Number.isInteger(municipalidadId) || municipalidadId <= 0)) {
      nuevos.municipalidadId = 'Selecciona una municipalidad válida.';
    }

    setErrores(nuevos);
    if (Object.keys(nuevos).length) return null;

    const comun: UsuarioPayload = {
      nombre,
      email,
      dni: formulario.dni.trim() || null,
      telefono: formulario.telefono.trim() || null,
      rol: formulario.rol,
      municipalidadId,
      activo: formulario.activo,
    };

    return editando ? comun : { ...comun, password: formulario.password };
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!puedeGestionar) return;
    setErrorFormulario('');
    const payload = validar();
    if (!payload) return;

    setGuardando(true);
    try {
      if (editando) {
        await actualizarUsuario(editando.id, payload as UsuarioPayload);
        showToast('Usuario actualizado correctamente.');
      } else {
        await crearUsuario(payload as CrearUsuarioPayload);
        showToast('Usuario registrado correctamente.');
      }
      setModal(null);
      setEditando(null);
      await cargar();
    } catch (err) {
      setErrorFormulario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const guardarPassword = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!puedeGestionar || !usuarioPassword) return;

    const nuevos: Record<string, string> = {};
    if (passwordNueva.length < 8) {
      nuevos.passwordNueva = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (passwordNueva !== confirmacionPassword) {
      nuevos.confirmacionPassword = 'Las contraseñas no coinciden.';
    }
    setErroresPassword(nuevos);
    if (Object.keys(nuevos).length) return;

    setGuardando(true);
    setErrorFormulario('');
    try {
      await cambiarPasswordUsuario(usuarioPassword.id, passwordNueva);
      showToast('Contraseña actualizada correctamente.');
      setModal(null);
      setUsuarioPassword(null);
      setPasswordNueva('');
      setConfirmacionPassword('');
    } catch (err) {
      setErrorFormulario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarCambioEstado = async (item: UsuarioAdmin) => {
    if (!puedeGestionar) return;
    setCambiandoEstado(item.id);
    try {
      const actualizado = await cambiarEstadoUsuario(item.id, !item.activo);
      showToast(
        actualizado.activo
          ? 'Usuario activado. Ya puede acceder al sistema.'
          : 'Usuario desactivado. No podrá iniciar sesión.',
      );
      setConfirmacion(null);
      await cargar();
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
    } finally {
      setCambiandoEstado(null);
    }
  };

  return (
    <section className="usuarios">
      <PageHeader
        title="Usuarios"
        description="Gestiona las cuentas de la plataforma, sus roles, municipalidades asignadas y estado de acceso."
        actions={
          puedeGestionar ? (
            <Button icon="plus" onClick={abrirNuevo}>
              Nuevo usuario
            </Button>
          ) : undefined
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

      <section className="ui-stats">
        <StatCard
          label="Usuarios"
          value={usuarios.length}
          description="Registrados en la plataforma"
          icon="users"
        />
        <StatCard
          label="Activos"
          value={activos}
          description="Pueden iniciar sesión"
          icon="checkCircle"
          tone="success"
        />
        <StatCard
          label="Inactivos"
          value={inactivos}
          description="Acceso deshabilitado"
          icon="x"
          tone={inactivos ? 'warning' : 'neutral'}
        />
        <StatCard
          label="Administradores"
          value={administradores}
          description="Cuentas con rol ADMIN"
          icon="shield"
        />
      </section>

      <Card>
        <form className="report-filters" onSubmit={aplicarFiltros}>
          <label className="ui-field">
            <span>Buscar</span>
            <span className="ui-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={filtrosFormulario.q}
                onChange={(evento) =>
                  setFiltrosFormulario((actual) => ({ ...actual, q: evento.target.value }))
                }
                placeholder="Nombre, correo o DNI"
                aria-label="Buscar usuarios"
              />
            </span>
          </label>
          <label className="ui-field">
            <span>Rol</span>
            <select
              className="ui-select"
              value={filtrosFormulario.rol}
              onChange={(evento) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  rol: evento.target.value as '' | RolUsuario,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="CIUDADANO">Ciudadano</option>
              <option value="MUNICIPALIDAD">Municipalidad</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>
          <label className="ui-field">
            <span>Estado</span>
            <select
              className="ui-select"
              value={filtrosFormulario.activo}
              onChange={(evento) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  activo: evento.target.value as '' | 'true' | 'false',
                }))
              }
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <label className="ui-field">
            <span>Municipalidad</span>
            <select
              className="ui-select"
              value={filtrosFormulario.municipalidadId}
              onChange={(evento) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  municipalidadId: evento.target.value,
                }))
              }
              disabled={Boolean(municipalidadActor)}
            >
              <option value="">Todas</option>
              {municipalidadActor && usuario?.municipalidadNombre &&
              !municipalidades.some((item) => item.id === municipalidadActor) ? (
                <option value={municipalidadActor}>{usuario.municipalidadNombre}</option>
              ) : null}
              {municipalidades.map((municipalidad) => (
                <option key={municipalidad.id} value={municipalidad.id}>
                  {municipalidad.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="ui-field filtros-acciones">
            <span aria-hidden="true">&nbsp;</span>
            <div className="filtros-acciones__botones">
              <Button type="submit" icon="search">
                Aplicar
              </Button>
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <div className="filter-bar">
          <span className="filter-bar__count">
            {pluralizar(usuarios.length, 'usuario', 'usuarios')}
          </span>
        </div>

        {cargando ? (
          <div className="panel-loading">
            <span className="panel-spinner" />
            <span>Cargando usuarios...</span>
          </div>
        ) : usuarios.length ? (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Municipalidad</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th>Registro</th>
                  {puedeGestionar ? <th>Acciones</th> : null}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="ui-table__main">{item.nombre}</span>
                      <span className="ui-table__sub">
                        {item.email}
                        {item.dni ? ` · DNI ${item.dni}` : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`panel-badge ${TONO_ROL[item.rol]}`}>
                        {ETIQUETAS_ROL[item.rol]}
                      </span>
                    </td>
                    <td className="ui-table__muted">
                      {textoOGuion(item.municipalidadNombre)}
                    </td>
                    <td>
                      <StatusDot
                        tone={item.activo ? 'success' : 'neutral'}
                        label={item.activo ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                    <td className="ui-table__muted">{fechaOGuion(item.ultimoAcceso)}</td>
                    <td className="ui-table__muted">{fechaOGuion(item.fechaRegistro)}</td>
                    {puedeGestionar ? (
                      <td className="ui-table__actions usuarios-acciones">
                        <button
                          type="button"
                          className={buttonClass('ghost')}
                          onClick={() => abrirEdicion(item)}
                          title="Editar usuario"
                          aria-label={`Editar usuario ${item.nombre}`}
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className={buttonClass('ghost')}
                          onClick={() => setConfirmacion(item)}
                          disabled={cambiandoEstado === item.id}
                          title={item.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          aria-label={`${item.activo ? 'Desactivar' : 'Activar'} usuario ${item.nombre}`}
                        >
                          <Icon name={item.activo ? 'x' : 'check'} size={15} />
                        </button>
                        <button
                          type="button"
                          className={buttonClass('ghost')}
                          onClick={() => abrirPassword(item)}
                          title="Cambiar contraseña"
                          aria-label={`Cambiar contraseña de ${item.nombre}`}
                        >
                          <Icon name="shield" size={15} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="users"
            title="Sin usuarios"
            description="No hay cuentas que coincidan con los filtros seleccionados."
            compact
          />
        )}
      </Card>

      <Modal
        abierto={modal === 'datos'}
        titulo={editando ? 'Editar usuario' : 'Nuevo usuario'}
        descripcion={
          editando
            ? 'Actualiza los datos de acceso y la configuración de la cuenta.'
            : 'Crea una cuenta y asígnale el rol y la municipalidad correspondientes.'
        }
        ancho={620}
        onCerrar={cerrarModal}
      >
        <form className="panel-form" onSubmit={(evento) => void guardar(evento)} noValidate>
          {errorFormulario ? <PanelAlert>{errorFormulario}</PanelAlert> : null}

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="usuario-nombre">Nombre completo</label>
              <input
                id="usuario-nombre"
                value={formulario.nombre}
                onChange={(evento) => cambiarCampo('nombre', evento.target.value)}
                placeholder="Nombre y apellido"
                maxLength={150}
                autoFocus
              />
              {errores.nombre ? <small className="panel-field__error">{errores.nombre}</small> : null}
            </div>
            <div className="panel-field">
              <label htmlFor="usuario-email">Correo electrónico</label>
              <input
                id="usuario-email"
                type="email"
                value={formulario.email}
                onChange={(evento) => cambiarCampo('email', evento.target.value)}
                placeholder="usuario@correo.com"
                maxLength={150}
              />
              {errores.email ? <small className="panel-field__error">{errores.email}</small> : null}
            </div>
          </div>

          {!editando ? (
            <div className="panel-field">
              <label htmlFor="usuario-password">Contraseña</label>
              <input
                id="usuario-password"
                type="password"
                autoComplete="new-password"
                value={formulario.password}
                onChange={(evento) => cambiarCampo('password', evento.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              {errores.password ? (
                <small className="panel-field__error">{errores.password}</small>
              ) : null}
            </div>
          ) : null}

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="usuario-dni">DNI</label>
              <input
                id="usuario-dni"
                value={formulario.dni}
                onChange={(evento) => cambiarCampo('dni', evento.target.value)}
                placeholder="Opcional"
                maxLength={20}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="usuario-telefono">Teléfono</label>
              <input
                id="usuario-telefono"
                value={formulario.telefono}
                onChange={(evento) => cambiarCampo('telefono', evento.target.value)}
                placeholder="Opcional"
                maxLength={20}
              />
            </div>
          </div>

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="usuario-rol">Rol</label>
              <select
                id="usuario-rol"
                value={formulario.rol}
                onChange={(evento) => cambiarCampo('rol', evento.target.value as RolUsuario)}
              >
                <option value="CIUDADANO">Ciudadano</option>
                <option value="MUNICIPALIDAD">Municipalidad</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="panel-field">
              <label htmlFor="usuario-municipalidad">Municipalidad</label>
              <select
                id="usuario-municipalidad"
                value={formulario.municipalidadId}
                onChange={(evento) => cambiarCampo('municipalidadId', evento.target.value)}
                disabled={Boolean(municipalidadActor)}
              >
                <option value="">Sin municipalidad</option>
                {municipalidadActor && usuario?.municipalidadNombre &&
                !municipalidades.some((item) => item.id === municipalidadActor) ? (
                  <option value={municipalidadActor}>{usuario.municipalidadNombre}</option>
                ) : null}
                {municipalidades.map((municipalidad) => (
                  <option key={municipalidad.id} value={municipalidad.id}>
                    {municipalidad.nombre}
                  </option>
                ))}
              </select>
              {errores.municipalidadId ? (
                <small className="panel-field__error">{errores.municipalidadId}</small>
              ) : null}
            </div>
          </div>

          <label className="panel-check">
            <input
              type="checkbox"
              checked={formulario.activo}
              onChange={(evento) => cambiarCampo('activo', evento.target.checked)}
            />
            <span>
              <b>Cuenta activa</b>
              <small>Permite iniciar sesión en la plataforma.</small>
            </span>
          </label>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarModal} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar usuario'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={modal === 'password'}
        titulo="Cambiar contraseña"
        descripcion={
          usuarioPassword
            ? `Define una nueva contraseña para ${usuarioPassword.nombre}.`
            : undefined
        }
        ancho={460}
        onCerrar={cerrarModal}
      >
        <form className="panel-form" onSubmit={(evento) => void guardarPassword(evento)} noValidate>
          {errorFormulario ? <PanelAlert>{errorFormulario}</PanelAlert> : null}

          <div className="panel-field">
            <label htmlFor="usuario-password-nueva">Nueva contraseña</label>
            <input
              id="usuario-password-nueva"
              type="password"
              autoComplete="new-password"
              value={passwordNueva}
              onChange={(evento) => {
                setPasswordNueva(evento.target.value);
                setErroresPassword((actual) => ({ ...actual, passwordNueva: '' }));
              }}
              placeholder="Mínimo 8 caracteres"
              autoFocus
            />
            {erroresPassword.passwordNueva ? (
              <small className="panel-field__error">{erroresPassword.passwordNueva}</small>
            ) : null}
          </div>

          <div className="panel-field">
            <label htmlFor="usuario-password-confirmar">Confirmar contraseña</label>
            <input
              id="usuario-password-confirmar"
              type="password"
              autoComplete="new-password"
              value={confirmacionPassword}
              onChange={(evento) => {
                setConfirmacionPassword(evento.target.value);
                setErroresPassword((actual) => ({ ...actual, confirmacionPassword: '' }));
              }}
              placeholder="Repite la contraseña"
            />
            {erroresPassword.confirmacionPassword ? (
              <small className="panel-field__error">{erroresPassword.confirmacionPassword}</small>
            ) : null}
          </div>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarModal} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        mensaje={
          confirmacion
            ? confirmacion.activo
              ? `¿Desactivar la cuenta de ${confirmacion.nombre}? No podrá iniciar sesión hasta que vuelva a activarse.`
              : `¿Activar la cuenta de ${confirmacion.nombre}? Podrá acceder nuevamente al sistema.`
            : ''
        }
        textoConfirmar={confirmacion?.activo ? 'Desactivar' : 'Activar'}
        textoCargando="Guardando..."
        variante={confirmacion?.activo ? 'peligro' : 'exito'}
        icono={confirmacion?.activo ? 'alert' : 'check'}
        cargando={cambiandoEstado !== null}
        onConfirmar={() => {
          if (confirmacion) void ejecutarCambioEstado(confirmacion);
        }}
        onCerrar={() => {
          if (cambiandoEstado === null) setConfirmacion(null);
        }}
      />
    </section>
  );
}
