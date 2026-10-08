import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import MainTabs from './MainTabs';

import BienvenidaScreen from '../screens/BienvenidaScreen';
import LoginScreen from '../screens/LoginScreen';
import RecuperarScreen from '../screens/RecuperarScreen';
import NuevaPasswordScreen from '../screens/NuevaPasswordScreen';
import RegistroScreen from '../screens/RegistroScreen';
import CapturaFotoScreen from '../screens/CapturaFotoScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import CorreccionScreen from '../screens/CorreccionScreen';
import EntregaScreen from '../screens/EntregaScreen';
import ConfirmacionScreen from '../screens/ConfirmacionScreen';
import CertificadoScreen from '../screens/CertificadoScreen';
import AyudaScreen from '../screens/AyudaScreen';
import QueReciclarScreen from '../screens/QueReciclarScreen';
import PorQueReciclarScreen from '../screens/PorQueReciclarScreen';
import HorariosScreen from '../screens/HorariosScreen';
import AcercaScreen from '../screens/AcercaScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import AdministrarNotificacionesScreen from '../screens/AdministrarNotificacionesScreen';
import CambiarPasswordScreen from '../screens/CambiarPasswordScreen';
import FotoPerfilScreen from '../screens/FotoPerfilScreen';
import MenuScreen from '../screens/MenuScreen';

const Stack = createNativeStackNavigator();

const ANIMACION = { animation: 'slide_from_right' };

export default function AppNavigator() {
  const { cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return null;
  }

  return (
    <NavigationContainer>
      <View style={styles.fondo}>
        <View style={styles.app}>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Bienvenida">
            <Stack.Screen name="Bienvenida" component={BienvenidaScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={ANIMACION} />
            <Stack.Screen name="Registro" component={RegistroScreen} options={ANIMACION} />
            <Stack.Screen name="Recuperar" component={RecuperarScreen} options={ANIMACION} />
            <Stack.Screen name="NuevaPassword" component={NuevaPasswordScreen} options={ANIMACION} />
            <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
            <Stack.Screen name="CapturaFoto" component={CapturaFotoScreen} options={ANIMACION} />
            <Stack.Screen name="Resultado" component={ResultadoScreen} options={ANIMACION} />
            <Stack.Screen name="Correccion" component={CorreccionScreen} options={ANIMACION} />
            <Stack.Screen name="Entrega" component={EntregaScreen} options={ANIMACION} />
            <Stack.Screen name="Confirmacion" component={ConfirmacionScreen} options={ANIMACION} />
            <Stack.Screen name="Certificado" component={CertificadoScreen} options={ANIMACION} />
            <Stack.Screen name="Ayuda" component={AyudaScreen} options={ANIMACION} />
            <Stack.Screen name="QueReciclar" component={QueReciclarScreen} options={ANIMACION} />
            <Stack.Screen name="PorQueReciclar" component={PorQueReciclarScreen} options={ANIMACION} />
            <Stack.Screen name="Horarios" component={HorariosScreen} options={ANIMACION} />
            <Stack.Screen name="Acerca" component={AcercaScreen} options={ANIMACION} />
            <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={ANIMACION} />
            <Stack.Screen name="AdministrarNotificaciones" component={AdministrarNotificacionesScreen} options={ANIMACION} />

            <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} options={ANIMACION} />
            <Stack.Screen name="FotoPerfil" component={FotoPerfilScreen} options={ANIMACION} />
            <Stack.Screen name="Menu" component={MenuScreen} options={ANIMACION} />
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fondo: Platform.OS === 'web'
    ? { flex: 1, backgroundColor: COLORS.page, alignItems: 'center' }
    : { flex: 1 },
  app: Platform.OS === 'web'
    ? { flex: 1, width: '100%', maxWidth: 430, backgroundColor: COLORS.bg, overflow: 'hidden' }
    : { flex: 1 },
});