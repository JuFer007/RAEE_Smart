import React, { useCallback, useEffect, useRef } from 'react';
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
  const vRef = useRef(new Animated.Value(0));
  const alTerminarSalida = useRef(null);

  useEffect(() => {
    const anim = Animated.timing(vRef.current, {
      toValue: 1,
      duration: duracion,
      delay: 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [duracion]);

  const salir = useCallback(
    (alTerminar) =>
      new Promise((resolve) => {
        alTerminarSalida.current = alTerminar;
        Animated.timing(vRef.current, {
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
    [duracionSalida]
  );

  const [style, setStyle] = React.useState({
    opacity: 0,
    transform: [
      { translateX: eje === 'x' ? distancia : 0 },
      { translateY: eje === 'y' ? distancia : 0 },
      { scale: 0.985 },
    ],
  });

  React.useEffect(() => {
    const desplazamiento = vRef.current.interpolate({ inputRange: [0, 1], outputRange: [distancia, 0] });
    const escalaAnimada = vRef.current.interpolate({ inputRange: [0, 1], outputRange: [escala, 1] });
    const opacidad = vRef.current.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 1, 1] });
    setStyle({
      opacity: opacidad,
      transform: [
        { translateX: eje === 'x' ? desplazamiento : 0 },
        { translateY: eje === 'y' ? desplazamiento : 0 },
        { scale: escalaAnimada },
      ],
    });
  }, [distancia, escala, eje]);

  return [style, salir];
}