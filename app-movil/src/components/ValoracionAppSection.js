import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Boton from './Boton';
import Campo from './Campo';
import * as satisfaccionService from '../services/satisfaccionService';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

const CALIFICACIONES = [1, 2, 3, 4, 5];
const ETIQUETAS = ['', 'Muy insatisfecho', 'Insatisfecho', 'Regular', 'Satisfecho', 'Muy satisfecho'];
const MAX_COMENTARIO = 500;
const MENSAJE_CONFLICTO =
  'Ya tenías una valoración registrada. Cargamos tus respuestas para que puedas editarlas.';

export default function ValoracionAppSection({
  mostrarTituloSeccion = true,
  mostrarEncabezado = true,
}) {
  const enviandoRef = useRef(false);

  const [registro, setRegistro] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');
  const [errorCarga, setErrorCarga] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga('');
      const existente = await satisfaccionService.obtenerMia();
      setRegistro(existente);
      setCalificacion(Number(existente?.calificacion) || 0);
      setComentario(existente?.comentario || '');
      setEditando(false);
    } catch (err) {
      if (satisfaccionService.esNoEncontrado(err)) {
        setRegistro(null);
        setCalificacion(0);
        setComentario('');
        setEditando(false);
      } else {
        setErrorCarga(err.normalizado || 'No pudimos consultar tu valoración. Inténtelo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  async function guardar() {
    if (enviandoRef.current) return;

    const valor = Number(calificacion);
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      setError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    const texto = comentario.trim();
    if (texto.length > MAX_COMENTARIO) {
      setError(`El comentario no puede superar los ${MAX_COMENTARIO} caracteres.`);
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setError('');
    setAviso('');

    try {
      const datos = { calificacion: valor, comentario: texto };
      const resultado = registro
        ? await satisfaccionService.actualizar(datos)
        : await satisfaccionService.registrar(datos);
      setRegistro(resultado);
      setCalificacion(valor);
      setComentario(texto);
      setEditando(false);
    } catch (err) {
      if (satisfaccionService.esConflicto(err)) {
        setAviso(MENSAJE_CONFLICTO);
        setErrorCarga('');
        await cargar();
        return;
      }
      setError(err.normalizado || 'No pudimos guardar tu valoración. Inténtelo de nuevo.');
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  function empezarEdicion() {
    setCalificacion(Number(registro?.calificacion) || 0);
    setComentario(registro?.comentario || '');
    setError('');
    setAviso('');
    setEditando(true);
  }

  function cancelarEdicion() {
    setEditando(false);
    setError('');
    setCalificacion(Number(registro?.calificacion) || 0);
    setComentario(registro?.comentario || '');
  }

  const calificacionActual = Number(registro?.calificacion) || 0;

  return (
    <View style={styles.seccion}>
      {mostrarTituloSeccion ? (
        <Text style={styles.seccionTitulo}>Satisfacción</Text>
      ) : null}

      <View style={[styles.tarjeta, !mostrarTituloSeccion && styles.tarjetaSinSeccion]}>
        {mostrarEncabezado ? (
          <View style={styles.encabezado}>
            <View style={styles.iconoFondo}>
              <Ionicons name="star" size={18} color={COLORS.white} />
            </View>
            <View style={styles.encabezadoTextos}>
              <Text style={styles.titulo}>Califica la app</Text>
              <Text style={styles.subtitulo}>Tu opinión nos ayuda a mejorar</Text>
            </View>
          </View>
        ) : null}

        {cargando ? (
          <View style={styles.cargando}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.textoCargando}>Consultando tu valoración...</Text>
          </View>
        ) : errorCarga ? (
          <View style={styles.aviso}>
            <Ionicons name="cloud-offline-outline" size={18} color={COLORS.danger} />
            <Text style={styles.avisoTexto}>{errorCarga}</Text>
            <Boton titulo="Reintentar" variante="fantasma" onPress={cargar} />
          </View>
        ) : (
          <>
            {aviso ? (
              <View style={styles.avisoAmarillo}>
                <Ionicons name="information-circle-outline" size={17} color={COLORS.warning} />
                <Text style={styles.avisoAmarilloTexto}>{aviso}</Text>
              </View>
            ) : null}

            {registro && !editando ? (
              <View style={styles.resumen}>
                <Text style={styles.pregunta}>Tu valoración actual</Text>
                <Estrellas valor={calificacionActual} />
                <Text style={styles.etiquetaEstrellas}>{ETIQUETAS[calificacionActual]}</Text>
                {registro?.comentario ? (
                  <Text style={styles.comentarioGuardado}>“{registro.comentario}”</Text>
                ) : (
                  <Text style={styles.sinComentario}>Sin comentario</Text>
                )}
                <Text style={styles.fecha}>
                  Actualizada: {formatearFechaHora(registro?.fechaActualizacion || registro?.fechaRegistro)}
                </Text>
                <Boton titulo="Editar valoración" icono="create-outline" onPress={empezarEdicion} />
              </View>
            ) : (
              <View style={styles.formulario}>
                <Text style={styles.pregunta}>¿Qué tan fue tu experiencia con RAEE Smart?</Text>
                <Estrellas
                  valor={calificacion}
                  onSeleccionar={(valor) => {
                    setCalificacion(valor);
                    setError('');
                  }}
                  deshabilitado={enviando}
                />
                <Text style={styles.etiquetaEstrellas}>
                  {calificacion > 0 ? ETIQUETAS[calificacion] : 'Toca una estrella para calificar'}
                </Text>

                <Text style={styles.etiquetaCampo}>Comentario (opcional)</Text>
                <Campo
                  icono="chatbubble-outline"
                  placeholder="Cuéntanos qué podemos mejorar"
                  valor={comentario}
                  onChangeText={(texto) => {
                    setComentario(texto);
                    if (error) setError('');
                  }}
                  multilinea
                  maxLength={MAX_COMENTARIO}
                />
                <Text style={styles.contador}>{comentario.length}/{MAX_COMENTARIO}</Text>

                {error ? (
                  <View style={styles.avisoError}>
                    <Ionicons name="alert-circle-outline" size={17} color={COLORS.danger} />
                    <Text style={styles.avisoErrorTexto}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.acciones}>
                  <Boton
                    titulo={registro ? 'Guardar cambios' : 'Enviar calificación'}
                    icono="send-outline"
                    onPress={guardar}
                    cargando={enviando}
                  />
                  {registro ? (
                    <Boton
                      titulo="Cancelar"
                      variante="fantasma"
                      onPress={cancelarEdicion}
                      deshabilitado={enviando}
                    />
                  ) : null}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function Estrellas({ valor, onSeleccionar, deshabilitado = false }) {
  return (
    <View style={styles.estrellas}>
      {CALIFICACIONES.map((numero) => {
        const nombre = numero <= valor ? 'star' : 'star-outline';
        const color = numero <= valor ? COLORS.warning : COLORS.lineTab;
        if (!onSeleccionar) {
          return <Ionicons key={numero} name={nombre} size={25} color={color} />;
        }
        return (
          <TouchableOpacity
            key={numero}
            onPress={() => onSeleccionar(numero)}
            disabled={deshabilitado}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${numero} estrella${numero > 1 ? 's' : ''}`}
          >
            <Ionicons name={nombre} size={30} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginBottom: ESPACIOS.xl },
  seccionTitulo: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    padding: ESPACIOS.md,
    gap: ESPACIOS.md,
  },
  tarjetaSinSeccion: { marginTop: 0 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconoFondo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encabezadoTextos: { flex: 1 },
  titulo: { ...TIPOGRAFIA.h4, fontSize: 14 },
  subtitulo: { ...TIPOGRAFIA.micro, fontSize: 11 },
  cargando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: ESPACIOS.md },
  textoCargando: { ...TIPOGRAFIA.small, fontSize: 12 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIOS.campo,
    padding: ESPACIOS.md,
  },
  avisoTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 12, lineHeight: 17 },
  avisoAmarillo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.warningSoft,
    borderRadius: RADIOS.campo,
    padding: ESPACIOS.md,
  },
  avisoAmarilloTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 12, lineHeight: 17, color: COLORS.warning },
  avisoError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIOS.campo,
    padding: ESPACIOS.md,
  },
  avisoErrorTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 12, lineHeight: 17, color: COLORS.danger },
  resumen: { alignItems: 'center', gap: 8 },
  formulario: { gap: 8 },
  pregunta: { ...TIPOGRAFIA.h4, fontSize: 13, textAlign: 'center' },
  estrellas: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  etiquetaEstrellas: { ...TIPOGRAFIA.small, fontSize: 12, textAlign: 'center' },
  etiquetaCampo: { ...TIPOGRAFIA.h4, fontSize: 12, marginTop: ESPACIOS.sm },
  comentarioGuardado: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.inkItem,
    backgroundColor: COLORS.primaryPale,
    borderRadius: RADIOS.campo,
    padding: ESPACIOS.md,
  },
  sinComentario: { ...TIPOGRAFIA.small, fontSize: 11, fontStyle: 'italic' },
  fecha: { ...TIPOGRAFIA.micro, fontSize: 10, textAlign: 'center' },
  contador: { ...TIPOGRAFIA.micro, fontSize: 10, textAlign: 'right', marginTop: 2 },
  acciones: { gap: 8, marginTop: ESPACIOS.sm },
});
