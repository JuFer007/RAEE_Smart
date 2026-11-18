const fs = require('fs');
const path = require('path');

function cargarEnv(rutaArchivo) {
  if (!fs.existsSync(rutaArchivo)) return {};

  const variables = {};
  const contenido = fs.readFileSync(rutaArchivo, 'utf8');

  for (const linea of contenido.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;

    const indice = limpia.indexOf('=');
    if (indice === -1) continue;

    const clave = limpia.slice(0, indice).trim();
    let valor = limpia.slice(indice + 1).trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    variables[clave] = valor;
  }

  return variables;
}

const directorioApp = path.dirname(require.resolve('./app.json'));
const env = cargarEnv(path.resolve(directorioApp, '..', '.env'));

const apiBaseUrl =
  env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || '';
const backendPort = env.BACKEND_PORT || process.env.BACKEND_PORT || '8080';
const mapStyleUrl =
  env.EXPO_PUBLIC_MAP_STYLE_URL ||
  process.env.EXPO_PUBLIC_MAP_STYLE_URL ||
  'https://tiles.openfreemap.org/styles/bright/style.json';
const usarDatosPrueba =
  (env.EXPO_PUBLIC_USAR_DATOS_PRUEBA ??
    process.env.EXPO_PUBLIC_USAR_DATOS_PRUEBA ??
    'false') === 'true';

if (env.EXPO_PUBLIC_API_URL) {
  process.env.EXPO_PUBLIC_API_URL = env.EXPO_PUBLIC_API_URL;
}
process.env.EXPO_PUBLIC_MAP_STYLE_URL = mapStyleUrl;
process.env.EXPO_PUBLIC_USAR_DATOS_PRUEBA = String(usarDatosPrueba);

module.exports = ({ config }) => {
  const extra = {
    ...(config.extra || {}),
    backendPort,
    mapStyleUrl,
    usarDatosPrueba,
  };

  if (apiBaseUrl) extra.apiBaseUrl = apiBaseUrl;

  return { ...config, extra };
};
