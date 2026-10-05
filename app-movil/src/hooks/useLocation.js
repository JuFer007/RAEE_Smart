import { useState, useEffect } from 'react';
import { solicitarPermisoYObtenerUbicacion } from '../services/geolocationService';

export default function useLocation(activo = true) {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activo) {
      setUbicacion(null);
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
  }, [activo]);

  return { ubicacion, cargando, error };
}
