import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import PanelAlert from '../../components/PanelAlert';
import {
  confirmarEntrega,
  listarEntregas,
  obtenerCertificado,
  rechazarEntrega,
} from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Certificado, Entrega, EstadoEntrega } from '../../types';
import {
  formatearConfianza,
  formatearFechaHora,
  iconoRaee,
  obtenerMensajeError,
  pluralizar,
} from '../../utils/formato';

type FiltroEntrega = 'TODAS' | EstadoEntrega;

const FILTROS: { id: FiltroEntrega; etiqueta: string }[] = [
  { id: 'TODAS', etiqueta: 'Todas' },
  { id: 'REGISTRADA', etiqueta: 'Registradas' },
  { id: 'EN_PROCESO', etiqueta: 'En proceso' },
  { id: 'CONFIRMADA', etiqueta: 'Confirmadas' },
  { id: 'RECHAZADA', etiqueta: 'Rechazadas' },
];

const ESTADOS: Record<EstadoEntrega, { etiqueta: string; clase: string }> = {
  REGISTRADA: { etiqueta: 'Registrada', clase: 'aviso' },
  EN_PROCESO: { etiqueta: 'En proceso', clase: 'info' },
  CONFIRMADA: { etiqueta: 'Confirmada', clase: 'exito' },
  RECHAZADA: { etiqueta: 'Rechazada', clase: 'error' },
};

type AccionEntrega = { entrega: Entrega; tipo: 'confirmar' | 'rechazar' };

function idEntrega(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

interface EntregasPageProps {
  vistaRecepcion?: boolean;
}

export default function EntregasPage({ vistaRecepcion = false }: EntregasPageProps) {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEntrega>('TODAS');

  const [detalle, setDetalle] = useState<Entrega | null>(null);
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [cargandoCertificado, setCargandoCertificado] = useState(false);
  const [errorCertificado, setErrorCertificado] = useState('');

  const [accion, setAccion] = useState<AccionEntrega | null>(null);
  const [procesando, setProcesando] = useState(false);

  const municipalidadId = usuario?.municipalidadId;

  const cargar = useCallback(async () => {
    if (!municipalidadId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError('');
    try {
      const data = await listarEntregas(municipalidadId);
      setEntregas(
        [...data].sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro)),
      );
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, [municipalidadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const conteos = useMemo(() => {
    const resultado: Record<FiltroEntrega, number> = {
      TODAS: entregas.length,
      REGISTRADA: 0,
      EN_PROCESO: 0,
      CONFIRMADA: 0,
      RECHAZADA: 0,
    };
    entregas.forEach((entrega) => {
      resultado[entrega.estado] += 1;
    });
    return resultado;
  }, [entregas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    return entregas.filter((entrega) => {
      if (
        vistaRecepcion &&
        entrega.estado !== 'REGISTRADA' &&
        entrega.estado !== 'EN_PROCESO'
      ) {
        return false;
      }
      const coincideEstado = filtro === 'TODAS' || entrega.estado === filtro;
      if (!coincideEstado) return false;
      if (!texto) return true;
      return `${entrega.id} ${entrega.nombreCategoriaVisible} ${entrega.tipoRaee} ${
        entrega.puntoRecoleccionNombre
      } ${entrega.puntoRecoleccionDireccion} ${entrega.certificadoCodigoQr ?? ''}`
        .toLocaleLowerCase('es')
        .includes(texto);
    });
  }, [busqueda, entregas, filtro, vistaRecepcion]);

  const cargarCertificado = async (entregaId: number) => {
    setCargandoCertificado(true);
    setErrorCertificado('');
    setCertificado(null);
    try {
      setCertificado(await obtenerCertificado(entregaId));
    } catch (err) {
      setErrorCertificado(obtenerMensajeError(err));
    } finally {
      setCargandoCertificado(false);
    }
  };

  const abrirDetalle = (entrega: Entrega) => {
    setDetalle(entrega);
    setCertificado(null);
    setErrorCertificado('');
    if (entrega.estado === 'CONFIRMADA') {
      void cargarCertificado(entrega.id);
    }
  };

  const abrirAccion = (entrega: Entrega, tipo: AccionEntrega['tipo']) => {
    setDetalle(null);
    setAccion({ entrega, tipo });
  };

  const ejecutarAccion = async () => {
    if (!accion) return;

    setProcesando(true);
    setError('');
    try {
      const actualizada =
        accion.tipo === 'confirmar'
          ? await confirmarEntrega(accion.entrega.id)
          : await rechazarEntrega(accion.entrega.id);

      setEntregas((actuales) =>
        actuales.map((entrega) =>
          entrega.id === actualizada.id ? actualizada : entrega,
        ),
      );
      showToast(
        accion.tipo === 'confirmar'
          ? 'Recepción confirmada. El certificado digital ya está disponible.'
          : 'Entrega rechazada. Se notificará al ciudadano.',
      );
      setAccion(null);
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
      setAccion(null);
    } finally {
      setProcesando(false);
    }
  };

  const esPendiente = (estado: EstadoEntrega) =>
    estado === 'REGISTRADA' || estado === 'EN_PROCESO';

  return (
    <section>
      <header className="panel-page-head">
        <div>
          <h2>{vistaRecepcion ? 'Recepción' : 'Entregas de RAEE'}</h2>
          <p>
            {vistaRecepcion
              ? 'Aparatos pendientes de revisión. Confirma la recepción para emitir el certificado digital.'
              : 'Revisa las entregas registradas por los ciudadanos y confirma la recepción para generar el certificado digital con QR.'}
          </p>
        </div>
        <button type="button" className="panel-btn secundario" onClick={() => void cargar()}>
          <Icon name="refresh" size={16} />
          Actualizar
        </button>
      </header>

      {error ? (
        <PanelAlert onCerrar={() => setError('')}>
          {error}{' '}
          <button type="button" className="panel-alert__link" onClick={() => void cargar()}>
            Reintentar
          </button>
        </PanelAlert>
      ) : null}

      <div className="panel-toolbar">
        <div className="panel-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por categoría, punto o certificado"
            aria-label="Buscar entregas"
          />
        </div>
        <span className="panel-contador">
          {pluralizar(filtradas.length, 'entrega', 'entregas')}
        </span>
      </div>

      {!vistaRecepcion ? (
        <div className="panel-filtros" role="group" aria-label="Filtrar entregas">
          {FILTROS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`panel-filtro${filtro === item.id ? ' is-active' : ''}`}
              onClick={() => setFiltro(item.id)}
            >
              {item.etiqueta}
              <span>{conteos[item.id]}</span>
            </button>
          ))}
        </div>
      ) : null}

      {cargando ? (
        <div className="panel-loading">
          <span className="panel-spinner" />
          <span>Cargando entregas...</span>
        </div>
      ) : filtradas.length ? (
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Punto de acopio</th>
                <th>Registro</th>
                <th>Confianza IA</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((entrega) => {
                const estado = ESTADOS[entrega.estado];
                return (
                  <tr key={entrega.id}>
                    <td>
                      <div className="panel-table__categoria">
                        <span className="panel-table__icono">
                          <Icon name={iconoRaee(entrega.tipoRaee)} size={19} />
                        </span>
                        <div>
                          <strong>{entrega.nombreCategoriaVisible}</strong>
                          <small>
                            {idEntrega(entrega.id)}
                            {entrega.clasificacionCorregida ? ' · Corregida' : ''}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="panel-table__punto">
                        <strong>{entrega.puntoRecoleccionNombre}</strong>
                        <small>{entrega.puntoRecoleccionDireccion || 'Sin dirección'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="panel-table__fecha">
                        {formatearFechaHora(entrega.fechaRegistro)}
                      </span>
                    </td>
                    <td>
                      <span className="panel-confianza">
                        {formatearConfianza(entrega.confianzaIa)}
                      </span>
                    </td>
                    <td>
                      <span className={`panel-badge ${estado.clase}`}>{estado.etiqueta}</span>
                    </td>
                    <td>
                      <div className="panel-table__acciones">
                        <button
                          type="button"
                          className="panel-mini-btn"
                          onClick={() => abrirDetalle(entrega)}
                          title="Ver detalle"
                          aria-label={`Ver detalle de la entrega ${idEntrega(entrega.id)}`}
                        >
                          <Icon name="list" size={15} />
                        </button>
                        {esPendiente(entrega.estado) ? (
                          <>
                            <button
                              type="button"
                              className="panel-mini-btn exito"
                              onClick={() => abrirAccion(entrega, 'confirmar')}
                              title="Confirmar recepción"
                              aria-label={`Confirmar recepción de ${idEntrega(entrega.id)}`}
                            >
                              <Icon name="check" size={15} />
                            </button>
                            <button
                              type="button"
                              className="panel-mini-btn peligro"
                              onClick={() => abrirAccion(entrega, 'rechazar')}
                              title="Rechazar entrega"
                              aria-label={`Rechazar entrega ${idEntrega(entrega.id)}`}
                            >
                              <Icon name="x" size={15} />
                            </button>
                          </>
                        ) : null}
                        {entrega.estado === 'CONFIRMADA' ? (
                          <button
                            type="button"
                            className="panel-mini-btn exito"
                            onClick={() => abrirDetalle(entrega)}
                            title="Ver certificado"
                            aria-label={`Ver certificado de ${idEntrega(entrega.id)}`}
                          >
                            <Icon name="qr" size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel-empty">
          <span className="panel-empty__icono">
            <Icon name="scan" size={25} />
          </span>
          <h3>
            {busqueda
              ? 'Sin resultados'
              : vistaRecepcion
                ? 'No hay aparatos pendientes'
                : 'Aún no hay entregas'}
          </h3>
          <p>
            {busqueda
              ? 'Prueba con otra categoría, punto o código de certificado.'
              : vistaRecepcion
                ? 'Todas las entregas recibidas ya fueron revisadas. Vuelve a actualizar para ver nuevos registros.'
                : 'Las entregas registradas desde la app móvil aparecerán aquí para que confirmes su recepción.'}
          </p>
        </div>
      )}

      <Modal
        abierto={Boolean(detalle)}
        titulo={detalle ? `Entrega ${idEntrega(detalle.id)}` : 'Detalle de entrega'}
        descripcion={
          detalle
            ? `${detalle.nombreCategoriaVisible} · ${formatearFechaHora(detalle.fechaRegistro)}`
            : undefined
        }
        ancho={660}
        onCerrar={() => setDetalle(null)}
      >
        {detalle ? (
          <div className="panel-detalle">
            <div className="panel-detalle__hero">
              <span className="panel-detalle__icono">
                <Icon name={iconoRaee(detalle.tipoRaee)} size={24} />
              </span>
              <div>
                <h3>{detalle.nombreCategoriaVisible}</h3>
                <p>{detalle.tipoRaee.replace(/_/g, ' ')}</p>
              </div>
              <span className={`panel-badge ${ESTADOS[detalle.estado].clase}`}>
                {ESTADOS[detalle.estado].etiqueta}
              </span>
            </div>

            <dl className="panel-datos panel-datos--detalle">
              <div>
                <dt>Punto de acopio</dt>
                <dd>{detalle.puntoRecoleccionNombre}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{detalle.puntoRecoleccionDireccion || 'Sin dirección registrada'}</dd>
              </div>
              <div>
                <dt>Registro</dt>
                <dd>{formatearFechaHora(detalle.fechaRegistro)}</dd>
              </div>
              <div>
                <dt>Confirmación</dt>
                <dd>{formatearFechaHora(detalle.fechaConfirmacion)}</dd>
              </div>
              <div>
                <dt>Confianza IA</dt>
                <dd>{formatearConfianza(detalle.confianzaIa)}</dd>
              </div>
              <div>
                <dt>Clasificación</dt>
                <dd>
                  {detalle.clasificacionCorregida
                    ? 'Corregida manualmente'
                    : 'Detectada automáticamente'}
                </dd>
              </div>
            </dl>

            {detalle.estado === 'CONFIRMADA' ? (
              <section className="panel-certificado">
                <header>
                  <span>
                    <Icon name="qr" size={18} />
                  </span>
                  <div>
                    <h4>Certificado digital</h4>
                    <p>Generado al confirmar la recepción del RAEE.</p>
                  </div>
                </header>

                {cargandoCertificado ? (
                  <div className="panel-certificado__cargando">
                    <span className="panel-spinner" />
                    <span>Cargando certificado...</span>
                  </div>
                ) : errorCertificado ? (
                  <PanelAlert>
                    {errorCertificado}{' '}
                    <button
                      type="button"
                      className="panel-alert__link"
                      onClick={() => void cargarCertificado(detalle.id)}
                    >
                      Reintentar
                    </button>
                  </PanelAlert>
                ) : certificado ? (
                  <div className="panel-certificado__contenido">
                    {certificado.qrImagenBase64 ? (
                      <img
                        src={`data:image/png;base64,${certificado.qrImagenBase64}`}
                        alt="Código QR del certificado"
                      />
                    ) : null}
                    <div>
                      <strong>{certificado.nombreCategoria}</strong>
                      <span>{certificado.puntoEntregaNombre}</span>
                      <small>Emitido: {formatearFechaHora(certificado.fechaEmision)}</small>
                      <code>{certificado.codigoHash}</code>
                      {certificado.urlPdf ? (
                        <a href={certificado.urlPdf} target="_blank" rel="noreferrer">
                          Ver certificado PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {detalle.estado === 'RECHAZADA' ? (
              <PanelAlert variante="info">
                Esta entrega fue rechazada. El ciudadano recibió una notificación con
                las indicaciones para acercarse al punto de acopio.
              </PanelAlert>
            ) : null}

            {esPendiente(detalle.estado) ? (
              <div className="panel-form__acciones">
                <button
                  type="button"
                  className="panel-btn peligro"
                  onClick={() => abrirAccion(detalle, 'rechazar')}
                >
                  <Icon name="x" size={16} />
                  Rechazar entrega
                </button>
                <button
                  type="button"
                  className="panel-btn"
                  onClick={() => abrirAccion(detalle, 'confirmar')}
                >
                  <Icon name="check" size={16} />
                  Confirmar recepción
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        abierto={Boolean(accion)}
        titulo={accion?.tipo === 'confirmar' ? 'Confirmar recepción' : 'Rechazar entrega'}
        mensaje={
          accion?.tipo === 'confirmar'
            ? `¿Confirmas la recepción de la entrega ${idEntrega(
                accion.entrega.id,
              )}? Se generará el certificado digital y se notificará al ciudadano.`
            : `¿Seguro que deseas rechazar la entrega ${
                accion ? idEntrega(accion.entrega.id) : ''
              }? El ciudadano recibirá una notificación con las indicaciones.`
        }
        textoConfirmar={accion?.tipo === 'confirmar' ? 'Confirmar' : 'Rechazar'}
        textoCargando={accion?.tipo === 'confirmar' ? 'Confirmando...' : 'Rechazando...'}
        variante={accion?.tipo === 'confirmar' ? 'exito' : 'peligro'}
        icono={accion?.tipo === 'confirmar' ? 'check' : 'alert'}
        cargando={procesando}
        onConfirmar={() => void ejecutarAccion()}
        onCerrar={() => {
          if (!procesando) setAccion(null);
        }}
      />
    </section>
  );
}
