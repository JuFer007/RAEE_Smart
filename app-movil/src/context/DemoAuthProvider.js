import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './AuthContext';
import { USUARIO_DEMO } from '../utils/mockData';

const valorDemo = {
  usuario: USUARIO_DEMO,
  cargandoSesion: false,
  iniciarSesion: async () => {},
  cerrarSesion: async () => {},
};

export function DemoAuthProvider({ children }) {
  return <AuthContext.Provider value={valorDemo}>{children}</AuthContext.Provider>;
}