import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

interface ModalProps {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  ancho?: number;
  onCerrar: () => void;
  children: ReactNode;
}

export default function Modal({
  abierto,
  titulo,
  descripcion,
  ancho = 560,
  onCerrar,
  children,
}: ModalProps) {
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div
      className="panel-modal__overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <section
        className="panel-modal"
        style={{ maxWidth: ancho }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <header className="panel-modal__cabecera">
          <div>
            <h2 id={tituloId}>{titulo}</h2>
            {descripcion ? <p>{descripcion}</p> : null}
          </div>
          <button
            type="button"
            className="panel-modal__cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="panel-modal__cuerpo">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
