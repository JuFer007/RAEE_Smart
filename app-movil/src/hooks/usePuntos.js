import { useState, useEffect, useCallback } from 'react';
import * as puntoService from '../services/puntoService';
import { ordenarPorDistancia } from '../utils/geo';

export default function usePuntos(ubicacion) {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await puntoService.listarPuntos();
      setPuntos(ordenarPorDistancia(data, ubicacion));
    } catch (e) {
      setError('No pudimos cargar los puntos de acopio');
    } finally {
      setCargando(false);
    }
  }, [ubicacion?.latitud, ubicacion?.longitud]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { puntos, cargando, error, recargar: cargar };
}