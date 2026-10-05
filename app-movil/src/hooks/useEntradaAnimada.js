import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

/**
 * Animación de entrada/salida para pantallas.
 * Devuelve [estilos, salir] — salir() anima hacia fuera y avisa al terminar.
 */
export default function useEntradaAnimada({
  eje = 'y',
  distancia = -20,
  escala = 0.985,
  duracion = 300,
  duracionSalida = 220,
} = {}) {
  const v = useRef(new Animated.Value(0)).current;
  const alTerminarSalida = useRef(null);

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: duracion,
      delay: 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [v, duracion]);

  const salir = useCallback(
    (alTerminar) =>
      new Promise((resolve) => {
        alTerminarSalida.current = alTerminar;
        Animated.timing(v, {
          toValue: 0,
          duration: duracionSalida,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
          alTerminar?.();
          alTerminarSalida.current = null;
          resolve();
        });
      }),
    [v, duracionSalida]
  );

  const desplazamiento = v.interpolate({ inputRange: [0, 1], outputRange: [distancia, 0] });
  const escalaAnimada = v.interpolate({ inputRange: [0, 1], outputRange: [escala, 1] });
  const opacidad = v.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 1, 1] });

  return [
    {
      opacity: opacidad,
      transform: [
        { translateX: eje === 'x' ? desplazamiento : 0 },
        { translateY: eje === 'y' ? desplazamiento : 0 },
        { scale: escalaAnimada },
      ],
    },
    salir,
  ];
}