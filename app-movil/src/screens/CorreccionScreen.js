import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import CategoriaCard from '../components/CategoriaCard';
import * as entregaService from '../services/entregaService';
import { COLORS, ESPACIOS, TIPOGRAFIA, TIPOS_RAEE } from '../theme';

export default function CorreccionScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const [seleccionado, setSeleccionado] = useState(entrega?.tipoRaee);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function confirmar() {
    try {
      setGuardando(true);
      setError('');
      const actualizada = await entregaService.corregirClasificacion(entrega.id, seleccionado);
      navigation.replace('Resultado', { entrega: actualizada, modo: route.params?.modo });
    } catch (_e) {
      setError('No pudimos guardar la corrección. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Corregir categoría" onBack={() => navigation.goBack()} />
        <Text style={styles.subtitulo}>Selecciona la categoría correcta</Text>

        <View style={styles.lista}>
          {TIPOS_RAEE.map((item) => (
            <CategoriaCard
              key={item.tipo}
              nombre={item.nombre}
              categoria={item.categoria}
              icono={item.icono}
              seleccionado={seleccionado === item.tipo}
              onPress={() => setSeleccionado(item.tipo)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Boton titulo="Guardar corrección" onPress={confirmar} deshabilitado={guardando} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  subtitulo: { ...TIPOGRAFIA.bodySm, fontSize: 12, marginBottom: ESPACIOS.lg },
  lista: { gap: ESPACIOS.sm, marginBottom: ESPACIOS.lg },
  error: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.danger, marginBottom: ESPACIOS.sm },
});