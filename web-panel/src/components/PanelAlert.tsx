import type { ReactNode } from 'react';
import Icon from './Icon';

interface PanelAlertProps {
  variante?: 'error' | 'success' | 'info';
  children: ReactNode;
  onCerrar?: () => void;
}

export default function PanelAlert({
  variante = 'error',
  children,
  onCerrar,
}: PanelAlertProps) {
  const icono = variante === 'success' ? 'check' : variante === 'info' ? 'leaf' : 'alert';

  return (
    <div className={`panel-alert ${variante}`} role="alert">
      <Icon name={icono} size={17} />
      <span>{children}</span>
      {onCerrar ? (
        <button type="button" onClick={onCerrar} aria-label="Cerrar aviso">
          <Icon name="x" size={15} />
        </button>
      ) : null}
    </div>
  );
}
