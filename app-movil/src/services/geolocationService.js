import * as Location from 'expo-location';

export async function solicitarPermisoYObtenerUbicacion() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permiso de ubicación denegado');
  }
  const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return {
    latitud: posicion.coords.latitude,
    longitud: posicion.coords.longitude,
  };
}
