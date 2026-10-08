import { useState, useCallback } from 'react';

export default function useToast() {
  const [toast, setToast] = useState({
    visible: false,
    mensaje: '',
    tipo: 'error',
    accionTexto: null,
    onAccion: null,
    duracion: 3000,
  });

  const mostrar = useCallback(
    (mensaje, tipo = 'error', opts = {}) => {
      setToast({
        visible: true,
        mensaje,
        tipo,
        accionTexto: opts.accionTexto || null,
        onAccion: opts.onAccion || null,
        duracion: opts.duracion ?? 3000,
      });
    },
    [],
  );

  const ocultar = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const error = useCallback((mensaje, opts) => mostrar(mensaje, 'error', opts), [mostrar]);
  const warning = useCallback((mensaje, opts) => mostrar(mensaje, 'warning', opts), [mostrar]);
  const info = useCallback((mensaje, opts) => mostrar(mensaje, 'info', opts), [mostrar]);
  const success = useCallback((mensaje, opts) => mostrar(mensaje, 'success', opts), [mostrar]);

  return {
    toast,
    mostrar,
    ocultar,
    error,
    warning,
    info,
    success,
  };
}
