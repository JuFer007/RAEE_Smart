import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

export default function ConfirmacionScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;
  const confirmada = entrega?.estado === 'CONFIRMADA';
  const rechazada = entrega?.estado === 'RECHAZADA';
  const enProceso = entrega?.estado === 'EN_PROCESO';

  function irAlInicio() {
    navigation.navigate('Main', { screen: 'Inicio' });
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Confirmación de entrega" onBack={() => navigation.goBack()} />

        <View style={styles.centro}>
          <View style={styles.anillo}>
            <View
              style={[
                styles.circulo,
                rechazada && styles.circuloRechazada,
                enProceso && styles.circuloProceso,
              ]}
            >
              <Ionicons
                name={rechazada ? 'close' : confirmada ? 'checkmark' : enProceso ? 'time' : 'checkmark'}
                size={52}
                color={COLORS.white}
              />
            </View>
          </View>

          <Text style={styles.titulo}>
            {rechazada
              ? 'Entrega rechazada'
              : confirmada
                ? '¡Entrega confirmada!'
                : enProceso
                  ? 'Entrega en proceso'
                  : '¡Entrega registrada!'}
          </Text>
          <Text style={styles.copy}>
            {rechazada
              ? 'El punto de acopio rechazó la recepción. Acércate para más información.'
              : confirmada
                ? 'La recepción fue confirmada y tu certificado ya está disponible.'
                : enProceso
                  ? 'El punto de acopio está revisando tu entrega. Te avisaremos cuando se confirme la recepción y se genere tu certificado.'
                  : 'Tu RAEE fue registrado. El punto de acopio debe confirmar la recepción para generar tu certificado.'}
          </Text>
        </View>

        <View style={styles.resumen}>
          <Fila icono={info.icono} etiqueta="Categoría" valor={nombre} />
          <Fila icono="calendar-outline" etiqueta="Fecha" valor={formatearFechaHora(entrega?.fechaRegistro)} />
          <Fila
            icono="location-outline"
            etiqueta="Ubicación"
            valor={entrega?.puntoRecoleccionDireccion || entrega?.puntoRecoleccionNombre || 'Por asignar'}
            ultima
          />
        </View>

        <View style={styles.botones}>
          <Boton
            titulo={confirmada ? 'Ver certificado digital' : 'Ver estado del certificado'}
            onPress={() => navigation.navigate('Certificado', { entrega })}
          />
          <Boton titulo="Volver al inicio" variante="secundario" icono="home-outline" onPress={irAlInicio} />
        </View>
      </ScrollView>
    </View>
  );
}

function Fila({ icono, etiqueta, valor, ultima = false }) {
  return (
    <View style={[styles.fila, !ultima && styles.filaBorde]}>
      <View style={styles.filaIcono}>
        <Ionicons name={icono} size={13} color={COLORS.white} />
      </View>
      <Text style={styles.filaEtiqueta}>{etiqueta}:</Text>
      <Text style={styles.filaValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  centro: { alignItems: 'center', marginTop: ESPACIOS.sm, marginBottom: 24 },
  anillo: { padding: 12, borderRadius: 70, backgroundColor: COLORS.focusSoft, marginBottom: 20 },
  circulo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#109558',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloRechazada: { backgroundColor: COLORS.danger },
  circuloProceso: { backgroundColor: COLORS.warning },
  titulo: { ...TIPOGRAFIA.h2, fontSize: 22, color: COLORS.primaryText, marginBottom: 8 },
  copy: { ...TIPOGRAFIA.bodySm, fontSize: 13, textAlign: 'center' },
  resumen: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  filaBorde: { borderBottomWidth: 1, borderBottomColor: COLORS.lineInner },
  filaIcono: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaEtiqueta: { ...TIPOGRAFIA.small, fontSize: 13, fontFamily: FUENTES.dmSemi, color: '#265B50' },
  filaValor: { flex: 1, ...TIPOGRAFIA.small, fontSize: 13, color: '#6D8980' },
  botones: { gap: 10 },
});
