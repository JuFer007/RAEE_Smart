import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from './Campo';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function SelectorMunicipalidad({
  opciones = [],
  valor = 'Todas',
  onChange,
  placeholder = 'Todas las municipalidades',
}) {
  const [visible, setVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const filtradas = opciones.filter((opcion) =>
    opcion.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es'))
  );

  function seleccionar(opcion) {
    onChange?.(opcion);
    setVisible(false);
    setBusqueda('');
  }

  const textoMostrado = valor === 'Todas' ? placeholder : valor;

  return (
    <>
      <TouchableOpacity style={styles.selector} activeOpacity={0.7} onPress={() => setVisible(true)}>
        <Ionicons name="location-outline" size={16} color={COLORS.mutIcon} />
        <Text style={[styles.selectorTexto, valor === 'Todas' && styles.selectorTextoVacio]} numberOfLines={1}>
          {textoMostrado}
        </Text>
        <Ionicons name="chevron-down" size={15} color={COLORS.mutIcon} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fondo}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />

          <View style={styles.panel}>
            <View style={styles.panelCabecera}>
              <View style={styles.panelTituloZona}>
                <Ionicons name="funnel-outline" size={16} color={COLORS.primaryText} />
                <Text style={styles.panelTitulo}>Filtrar por municipalidad</Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color={COLORS.mutSoft} />
              </TouchableOpacity>
            </View>

            <Campo
              icono="search-outline"
              placeholder="Buscar municipalidad..."
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
            />

            <View style={styles.lista}>
              <Text style={styles.contador}>
                {filtradas.length} municipalidad{filtradas.length !== 1 ? 'es' : ''}
              </Text>
              {filtradas.map((opcion) => {
                const activa = opcion === valor;
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[styles.opcion, activa && styles.opcionActiva]}
                    activeOpacity={0.75}
                    onPress={() => seleccionar(opcion)}
                  >
                    <Ionicons
                      name={activa ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={activa ? COLORS.primary : COLORS.mutSoft}
                    />
                    <Text style={[styles.opcionTexto, activa && styles.opcionTextoActiva]}>
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIOS.campo,
    backgroundColor: COLORS.surface,
  },
  selectorTexto: {
    flex: 1,
    ...TIPOGRAFIA.small,
    fontSize: 13.5,
    color: COLORS.inkField,
  },
  selectorTextoVacio: { color: COLORS.mutIcon },

  fondo: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIOS.lg,
    borderTopRightRadius: RADIOS.lg,
    paddingHorizontal: ESPACIOS.page,
    paddingTop: ESPACIOS.lg,
    paddingBottom: ESPACIOS.xxl,
    gap: ESPACIOS.md,
    ...SOMBRAS.flotante,
  },
  panelCabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTituloZona: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelTitulo: { ...TIPOGRAFIA.h4, fontSize: 15 },

  lista: { maxHeight: 300, gap: 4 },
  contador: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft, marginLeft: 2 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: RADIOS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  opcionActiva: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryRing },
  opcionTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 13.5, color: COLORS.inkItem },
  opcionTextoActiva: { fontFamily: FUENTES.dmBold, color: COLORS.primaryText },
});