import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import ModalEnProceso from '../components/ModalEnProceso';
import Boton from '../components/Boton';
import { Chip } from '../components/Tarjeta';
import { useAuth } from '../context/AuthContext';
import * as entregaService from '../services/entregaService';
import { obtenerEstado, obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

const FILTROS = ['Todas', 'Certificadas', 'En proceso'];

export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enProceso, setEnProceso] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await entregaService.listarHistorial(usuario.id);
      setEntregas(data);
    } catch (_e) {
      setError('No pudimos cargar tus entregas');
    } finally {
      setCargando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    let activo = true;
    entregaService
      .listarHistorial(usuario.id)
      .then((data) => {
        if (activo) setEntregas(data);
      })
      .catch(() => {
        if (activo) setError('No pudimos cargar tus entregas');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [usuario.id]);

  const visibles = entregas.filter((e) => {
    if (filtro === 'Certificadas') return e.estado === 'CONFIRMADA';
    if (filtro === 'En proceso') return e.estado !== 'CONFIRMADA';
    return true;
  });

  const certificada = (entrega) => entrega.estado === 'CONFIRMADA' && Boolean(entrega.certificadoCodigoQr);

  function abrirEntrega(entrega) {
    if (certificada(entrega)) {
      navigation.navigate('Certificado', { entrega });
    } else {
      setEnProceso(entrega);
    }
  }

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
          cargando ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.cargando} />
          ) : error ? (
            <View style={styles.vacio}>
              <Ionicons name="cloud-offline-outline" size={32} color={COLORS.mut} />
              <Text style={styles.vacioTexto}>{error}</Text>
              <Boton
                titulo="Reintentar"
                variante="fantasma"
                ancho={false}
                onPress={() => {
                  setCargando(true);
                  cargar();
                }}
              />
            </View>
          ) : (
            <View style={styles.vacio}>
              <Ionicons name="leaf-outline" size={32} color={COLORS.mut} />
              <Text style={styles.vacioTexto}>Todavía no has registrado entregas</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <FilaEntrega entrega={item} onPress={() => abrirEntrega(item)} />
        )}
      />

      <ModalEnProceso
        visible={Boolean(enProceso)}
        entrega={enProceso}
        onCerrar={() => setEnProceso(null)}
        onVerPuntos={() => {
          setEnProceso(null);
          navigation.navigate('Horarios');
        }}
      />
    </View>
  );
}

function FilaEntrega({ entrega, onPress }) {
  const info = obtenerInfoTipo(entrega.tipoRaee);
  const estado = obtenerEstado(entrega.estado);
  const lista = entrega.estado === 'CONFIRMADA' && Boolean(entrega.certificadoCodigoQr);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemIcono}>
        <Ionicons name={info.icono} size={22} color={COLORS.secondary} />
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
      <View style={styles.itemDerecha}>
        <View style={[styles.itemEstado, { backgroundColor: estado.bg }]}>
          <Text style={[styles.itemEstadoTexto, { color: estado.color }]}>{estado.label}</Text>
        </View>
        <Ionicons
          name={lista ? 'qr-code-outline' : 'information-circle-outline'}
          size={16}
          color={lista ? COLORS.primaryText : COLORS.mutSoft}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  encabezadoZona: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md },
  filtros: { flexDirection: 'row', gap: 8, marginBottom: ESPACIOS.md },
  lista: { paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.xl, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.boton,
    padding: 12,
  },
  itemIcono: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextos: { flex: 1 },
  itemDerecha: { alignItems: 'flex-end', gap: 6 },
  itemNombre: { ...TIPOGRAFIA.micro, fontSize: 14, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  itemDetalle: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.mut, marginTop: 3 },
  itemEstado: { alignSelf: 'flex-start', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  itemEstadoTexto: { ...TIPOGRAFIA.micro, fontSize: 10, fontFamily: FUENTES.dmSemi },
  vacio: { alignItems: 'center', gap: ESPACIOS.md, marginTop: ESPACIOS.xxl },
  vacioTexto: { ...TIPOGRAFIA.small, textAlign: 'center' },
  cargando: { marginTop: ESPACIOS.xxl },
});