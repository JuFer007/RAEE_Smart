import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../components/Icon';

export type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURACION = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [...current.slice(-3), { id, message, variant }]);
      const timer = window.setTimeout(() => removeToast(id), DURACION);
      timers.current.push(timer);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-viewport" aria-live="polite" aria-atomic="false">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.variant}`} role="status">
              <span className="toast__icon">
                <Icon
                  name={toast.variant === 'success' ? 'checkCircle' : toast.variant === 'error' ? 'alert' : 'leaf'}
                  size={18}
                />
              </span>
              <p>{toast.message}</p>
              <button
                type="button"
                className="toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar mensaje"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}
