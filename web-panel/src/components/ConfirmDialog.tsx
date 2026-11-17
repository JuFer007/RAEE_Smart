import Icon from './Icon';
import Modal from './Modal';

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCargando?: string;
  variante?: 'peligro' | 'exito';
  icono?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCerrar: () => void;
}

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCargando = 'Eliminando...',
  variante = 'peligro',
  icono = 'alert',
  cargando = false,
  onConfirmar,
  onCerrar,
}: ConfirmDialogProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar} ancho={440}>
      <div className="panel-confirmar">
        <span className="panel-confirmar__icono">
          <Icon name={icono} size={22} />
        </span>
        <p>{mensaje}</p>
      </div>
      <div className="panel-form__acciones">
        <button type="button" className="panel-btn secundario" onClick={onCerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className={`panel-btn ${variante}`}
          onClick={onConfirmar}
          disabled={cargando}
        >
          {cargando ? textoCargando : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
