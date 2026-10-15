import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { solicitarPermisoYObtenerUbicacion } from '../services/geolocationService';

export default function useLocation(activo = true, solicitarAutomatico = true) {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState(null);
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    if (!activo) return;

    let vivo = true;

    (async () => {
      try {
        if (solicitarAutomatico) {
          const actual = await solicitarPermisoYObtenerUbicacion();
          if (vivo) {
            setUbicacion(actual);
            setSinPermiso(false);
          }
        } else {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (!vivo) return;
          if (status !== 'granted') {
            setSinPermiso(true);
            return;
          }
          setSinPermiso(false);
          const actual = await solicitarPermisoYObtenerUbicacion();
          if (vivo) setUbicacion(actual);
        }
      } catch (e) {
        if (vivo) {
          setError(e.message);
          setSinPermiso(true);
        }
      } finally {
        if (vivo) setCargando(false);
      }
    })();

    return () => {
      vivo = false;
    };
  }, [activo, solicitarAutomatico]);

  async function permitir() {
    setCargando(true);
    setError(null);
    try {
      const actual = await solicitarPermisoYObtenerUbicacion();
      setUbicacion(actual);
      setSinPermiso(false);
    } catch (e) {
      setError(e.message);
      setSinPermiso(true);
    } finally {
      setCargando(false);
    }
  }

  return { ubicacion, cargando, error, sinPermiso, permitir };
}
