import { useEffect, useRef, useState } from 'react';
import { UNSTABLE_usePreventRemove as usePreventRemove } from '@react-navigation/native';

/**
 * Intercepta el regreso de una pantalla (botón, gesto o hardware) para que la
 * animación de salida termine antes de quitarla de la pila.
 * Usa `usePreventRemove` para que native-stack no la quite nativamente antes
 * de que la animación termine. Las navegaciones hacia adelante no se animan.
 */
export default function useSalidaAnimada(navigation, salir, activo = true) {
  const [prevenir, setPrevenir] = useState(activo);
  const accionPendiente = useRef(null);
  const animando = useRef(false);

  useEffect(() => {
    if (accionPendiente.current) return;
    setPrevenir(activo);
  }, [activo]);

  usePreventRemove(prevenir, ({ data }) => {
    const tipo = data.action.type;

    if (tipo !== 'GO_BACK' && tipo !== 'POP') {
      accionPendiente.current = data.action;
      setPrevenir(false);
      return;
    }

    if (animando.current) return;
    animando.current = true;

    salir(() => {
      accionPendiente.current = data.action;
      setPrevenir(false);
    });
  });

  useEffect(() => {
    if (prevenir || !accionPendiente.current) return;

    const pendiente = accionPendiente.current;
    accionPendiente.current = null;
    navigation.dispatch(pendiente);
  }, [prevenir, navigation]);
}
