import { useState, useEffect } from 'react';
import { solicitarPermisoYObtenerUbicacion } from '../services/geolocationService';
import { esDemo } from '../utils/demo';
import { UBICACION_DEMO } from '../utils/mockData';

export default function useLocation(activo = true) {
  const habilitado = activo && !esDemo();
  const [ubicacion, setUbicacion] = useState(habilitado ? null : UBICACION_DEMO);
  const [cargando, setCargando] = useState(habilitado);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!habilitado) {
      setUbicacion(UBICACION_DEMO);
      setCargando(false);
      return;
    }

    (async () => {
      try {
        setUbicacion(await solicitarPermisoYObtenerUbicacion());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [habilitado]);

  return { ubicacion, cargando, error };
}