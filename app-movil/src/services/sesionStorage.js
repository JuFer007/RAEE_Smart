import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@raeesmart_token';
const USUARIO_KEY = '@raeesmart_usuario';

let tokenEnMemoria = null;

export async function guardarSesion(usuario, token, recordar = true) {
  tokenEnMemoria = token || null;

  if (recordar) {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, String(token || '')],
      [USUARIO_KEY, JSON.stringify(usuario)],
    ]);
    return;
  }

  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
}

export async function obtenerToken() {
  if (tokenEnMemoria) return tokenEnMemoria;
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerSesionGuardada() {
  try {
    const [token, rawUsuario] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USUARIO_KEY),
    ]);

    if (!token || !rawUsuario) {
      await limpiarSesion();
      return null;
    }

    tokenEnMemoria = token;
    return { token, usuario: JSON.parse(rawUsuario) };
  } catch {
    await limpiarSesion();
    return null;
  }
}

export async function limpiarSesion() {
  tokenEnMemoria = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
}
