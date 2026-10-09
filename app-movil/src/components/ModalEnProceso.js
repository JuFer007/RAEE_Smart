import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Boton from './Boton';
import { obtenerEstado, obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

export default function ModalEnProceso({ visible, entrega, onCerrar, onVerPuntos }) {
  if (!entrega) return null;

  const info = obtenerInfoTipo(entrega.tipoRaee);
  const estado = obtenerEstado(entrega.estado);
  const nombre = entrega.nombreCategoriaVisible || info.nombre;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCerrar}
    >
      <View style={styles.fondo}>
        <Pressable style={styles.overlay} onPress={onCerrar} />

        <View style={styles.centro}>
          <View style={styles.tarjeta}>
            <View style={styles.badge}>
              <Ionicons name="hourglass-outline" size={22} color={COLORS.warning} />
            </View>

            <Text style={styles.titulo}>Tu entrega aún está en proceso</Text>
            <Text style={styles.subtitulo}>
              El certificado digital se genera cuando el punto de acopio confirma la recepción del aparato.
            </Text>

            <View style={styles.datos}>
              <Dato icono={info.icono} etiqueta="Aparato" valor={nombre} />
              <Dato icono="calendar-outline" etiqueta="Registrada" valor={formatearFechaHora(entrega.fechaRegistro)} />
              <Dato
                icono="location-outline"
                etiqueta="Punto"
                valor={entrega.puntoRecoleccionNombre || 'Por asignar'}
              />
            </View>

            <View style={styles.estadoFila}>
              <View style={[styles.estadoPunto, { backgroundColor: estado.color }]} />
              <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.label}</Text>
            </View>

            <View style={styles.botones}>
              <Boton titulo="Entendido" onPress={onCerrar} />
              {onVerPuntos ? (
                <Boton titulo="Ver puntos de acopio" variante="secundario" onPress={onVerPuntos} />
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Dato({ icono, etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <View style={styles.datoIcono}>
        <Ionicons name={icono} size={14} color={COLORS.primaryText} />
      </View>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACIOS.page,
    pointerEvents: 'box-none',
  },
  tarjeta: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    padding: ESPACIOS.lg,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },
  badge: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...TIPOGRAFIA.h3, fontSize: 18, textAlign: 'center' },
  subtitulo: { ...TIPOGRAFIA.small, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },

  datos: {
    gap: 9,
    backgroundColor: COLORS.bgBottom,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  datoIcono: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datoEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 11.5, width: 68, color: COLORS.mut },
  datoValor: { flex: 1, ...TIPOGRAFIA.micro, fontSize: 11.5, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },

  estadoFila: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  estadoPunto: { width: 8, height: 8, borderRadius: 4 },
  estadoTexto: { ...TIPOGRAFIA.micro, fontSize: 11.5, fontFamily: FUENTES.dmBold },

  botones: { gap: 9, marginTop: 2 },
});