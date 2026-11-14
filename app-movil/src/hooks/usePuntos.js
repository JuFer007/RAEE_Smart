import { useState, useEffect, useCallback } from 'react';
import * as puntoService from '../services/puntoService';
import { ordenarPorDistancia } from '../utils/geo';

export default function usePuntos(ubicacion) {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (ubicacionActual = ubicacion) => {
    try {
      setError(null);
      setCargando(true);
      const data = await puntoService.listarPuntos();
      setPuntos(ordenarPorDistancia(data, ubicacionActual));
    } catch {
      setError('No pudimos cargar los puntos de acopio');
    } finally {
      setCargando(false);
    }
  }, [ubicacion]);

  useEffect(() => {
    cargar(ubicacion);
  }, [cargar, ubicacion]);

  return { puntos, cargando, error, recargar: cargar };
}