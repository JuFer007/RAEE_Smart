import { useState } from 'react';
import Icon from '../../components/Icon';
import PanelAlert from '../../components/PanelAlert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatusDot from '../../components/ui/StatusDot';
import { verificarCertificado } from '../../api/panel';
import type { Certificado } from '../../types';
import { formatearFechaHora, iconoRaee, obtenerMensajeError } from '../../utils/formato';

function normalizarCodigo(valor: string): string {
  const texto = valor.trim();
  if (!texto) return '';
  try {
    const url = new URL(texto);
    const segmentos = url.pathname.split('/').filter(Boolean);
    return segmentos[segmentos.length - 1] ?? texto;
  } catch {
    const segmentos = texto.split(/[/?#]/).filter(Boolean);
    return segmentos[segmentos.length - 1] ?? texto;
  }
}

export default function VerificarCertificadoPage() {
  const [codigo, setCodigo] = useState('');
  const [ultimoCodigo, setUltimoCodigo] = useState('');
  const [resultado, setResultado] = useState<Certificado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const consultar = async (valor: string) => {
    const codigoNormalizado = normalizarCodigo(valor);
    if (!codigoNormalizado) {
      setError('Ingresa el código del certificado o pega la URL completa del QR.');
      return;
    }
    setUltimoCodigo(codigoNormalizado);
    setCargando(true);
    setError('');
    setResultado(null);
    try {
      setResultado(await verificarCertificado(codigoNormalizado));
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <section>
      <PageHeader
        title="Certificados"
        description="Consulta la autenticidad de un certificado emitido al confirmar una entrega."
      />

      <div className="satisfaction-grid">
        <Card>
          <header className="ui-card__header">
            <div>
              <h3>Buscar certificado</h3>
              <p>Acepta el código hash o la URL del código QR.</p>
            </div>
          </header>
          <form
            className="panel-form"
            noValidate
            onSubmit={(evento) => {
              evento.preventDefault();
              void consultar(codigo);
            }}
          >
            <label className="ui-field">
              <span>Código o URL del QR</span>
              <input
                value={codigo}
                onChange={(evento) => setCodigo(evento.target.value)}
                placeholder="Ej. 5f8c2d90-3a1b-4e7c-9f20-1d2e3a4b5c6d"
                aria-label="Código del certificado"
              />
            </label>
            <div className="panel-form__acciones">
              <Button type="submit" icon="shield" disabled={cargando}>
                {cargando ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <header className="ui-card__header">
            <div>
              <h3>Resultado de la consulta</h3>
              <p>Datos de la entrega asociada al certificado.</p>
            </div>
          </header>

          {cargando ? (
            <div className="panel-loading">
              <span className="panel-spinner" />
              <span>Verificando certificado...</span>
            </div>
          ) : error ? (
            <PanelAlert>
              {error}{' '}
              <button
                type="button"
                className="panel-alert__link"
                onClick={() => void consultar(ultimoCodigo)}
              >
                Reintentar
              </button>
            </PanelAlert>
          ) : resultado ? (
            <section className="panel-certificado">
              <header>
                <span>
                  <Icon name={iconoRaee(resultado.tipoAparato)} size={18} />
                </span>
                <div>
                  <StatusDot tone="success" label="Certificado válido" />
                  <p>El código consultado corresponde a una entrega registrada.</p>
                </div>
              </header>
              <div className="panel-certificado__contenido">
                {resultado.qrImagenBase64 ? (
                  <img
                    src={`data:image/png;base64,${resultado.qrImagenBase64}`}
                    alt="Código QR del certificado"
                  />
                ) : null}
                <div>
                  <strong>{resultado.nombreCategoria}</strong>
                  <span>{resultado.puntoEntregaNombre}</span>
                  <small>Emitido: {formatearFechaHora(resultado.fechaEmision)}</small>
                  <code>{resultado.codigoHash}</code>
                  {resultado.urlPdf ? (
                    <a href={resultado.urlPdf} target="_blank" rel="noreferrer">
                      Ver certificado PDF
                    </a>
                  ) : null}
                </div>
              </div>
              <dl className="panel-datos panel-datos--detalle">
                <div>
                  <dt>Tipo de aparato</dt>
                  <dd>{resultado.tipoAparato}</dd>
                </div>
                <div>
                  <dt>Entrega</dt>
                  <dd>#{resultado.entregaId}</dd>
                </div>
                <div>
                  <dt>Fecha de entrega</dt>
                  <dd>{formatearFechaHora(resultado.fechaEntrega)}</dd>
                </div>
                <div>
                  <dt>Punto de entrega</dt>
                  <dd>{resultado.puntoEntregaNombre}</dd>
                </div>
              </dl>
            </section>
          ) : (
            <EmptyState
              icon="qr"
              title="Aún no hay consultas"
              description="Ingresa un código para verificar la autenticidad del certificado."
              compact
            />
          )}
        </Card>
      </div>
    </section>
  );
}
