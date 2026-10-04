import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { Chip } from '../components/Tarjeta';
import { useAuth } from '../context/AuthContext';
import * as entregaService from '../services/entregaService';
import { obtenerEstado, obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

const FILTROS = ['Todas', 'Certificadas', 'En proceso'];

export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await entregaService.listarHistorial(usuario.id);
      setEntregas(data);
    } catch (e) {
      setError('No pudimos cargar tus entregas');
    } finally {
      setCargando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = entregas.filter((e) => {
    if (filtro === 'Certificadas') return e.estado === 'CONFIRMADA';
    if (filtro === 'En proceso') return e.estado !== 'CONFIRMADA';
    return true;
  });

  return (
    <View style={styles.fondo}>
      <View style={styles.encabezadoZona}>
        <Encabezado titulo="Historial de entregas" />
        <View style={styles.filtros}>
          {FILTROS.map((f) => (
            <Chip key={f} texto={f} activo={filtro === f} onPress={() => setFiltro(f)} />
          ))}
        </View>
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          cargando ? null : (
            <View style={styles.vacio}>
              <Ionicons name="file-tray-outline" size={30} color={COLORS.mut} />
              <Text style={styles.vacioTexto}>{error || 'Todavía no tienes entregas registradas'}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <FilaEntrega
            entrega={item}
            onPress={() => navigation.navigate('Certificado', { entrega: item })}
          />
        )}
      />
    </View>
  );
}

function FilaEntrega({ entrega, onPress }) {
  const info = obtenerInfoTipo(entrega.tipoRaee);
  const estado = obtenerEstado(entrega.estado);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemIcono}>
        <Ionicons name={info.icono} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.itemTextos}>
        <Text style={styles.itemNombre} numberOfLines={1}>
          {entrega.nombreCategoriaVisible || info.nombre}
        </Text>
        <Text style={styles.itemDetalle}>{formatearFechaHora(entrega.fechaRegistro)}</Text>
        <Text style={styles.itemDetalle} numberOfLines={1}>
          {entrega.certificadoCodigoQr
            ? `Código: ${entrega.certificadoCodigoQr}`
            : entrega.puntoRecoleccionNombre || 'Punto por asignar'}
        </Text>
      </View>
      <View style={[styles.itemEstado, { backgroundColor: estado.bg }]}>
        <Text style={[styles.itemEstadoTexto, { color: estado.color }]}>{estado.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={COLORS.mutSoft} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  encabezadoZona: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm },
  filtros: { flexDirection: 'row', gap: 7, marginBottom: ESPACIOS.sm },
  lista: { paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.xl, gap: 9 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.boton,
    padding: 10,
  },
  itemIcono: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextos: { flex: 1 },
  itemNombre: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#22594D' },
  itemDetalle: { ...TIPOGRAFIA.micro, fontSize: 9, color: '#869E95', marginTop: 3 },
  itemEstado: { alignSelf: 'flex-start', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  itemEstadoTexto: { ...TIPOGRAFIA.micro, fontSize: 8, fontFamily: 'DMSans_600SemiBold' },
  vacio: { alignItems: 'center', gap: ESPACIOS.sm, marginTop: ESPACIOS.xxl },
  vacioTexto: { ...TIPOGRAFIA.small, textAlign: 'center' },
});