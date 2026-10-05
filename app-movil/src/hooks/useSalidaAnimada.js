import { useEffect, useRef } from 'react';

/**
 * Intercepta el regreso de una pantalla (botón, gesto o hardware) para que la
 * animación de salida termine antes de quitarla de la pila.
 * Las navegaciones hacia adelante no se animan.
 */
export default function useSalidaAnimada(navigation, salir, activo = true) {
  const dejarPasar = useRef(false);

  useEffect(() => {
    if (!activo) return undefined;

    return navigation.addListener('beforeRemove', (e) => {
      const tipo = e.data.action.type;
      if (tipo !== 'GO_BACK' && tipo !== 'POP') return;

      // La acción que re-despachamos al terminar la animación debe pasar libre.
      if (dejarPasar.current) {
        dejarPasar.current = false;
        return;
      }

      e.preventDefault();

      salir(() => {
        dejarPasar.current = true;
        navigation.dispatch(e.data.action);
      });
    });
  }, [navigation, salir, activo]);
}