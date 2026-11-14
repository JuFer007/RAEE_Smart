import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as notificacionService from '../services/notificacionService';

export default function useNotificacionesNoLeidas() {
  const [noLeidas, setNoLeidas] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      notificacionService
        .contarNoLeidas()
        .then((cantidad) => {
          if (activo) setNoLeidas(cantidad);
        })
        .catch(() => {});
      return () => {
        activo = false;
      };
    }, []),
  );

  return noLeidas;
}
