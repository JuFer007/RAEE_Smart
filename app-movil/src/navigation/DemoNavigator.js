import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DemoAuthProvider } from '../context/DemoAuthProvider';
import { activarDemo } from '../utils/demo';
import { ENTREGA_DEMO } from '../utils/mockData';

import DemoScreen from '../screens/DemoScreen';
import MainTabs from './MainTabs';
import CapturaFotoScreen from '../screens/CapturaFotoScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import EntregaScreen from '../screens/EntregaScreen';
import ConfirmacionScreen from '../screens/ConfirmacionScreen';
import CertificadoScreen from '../screens/CertificadoScreen';
import CorreccionScreen from '../screens/CorreccionScreen';
import AyudaScreen from '../screens/AyudaScreen';

const Stack = createNativeStackNavigator();

const paramsMock = { entrega: ENTREGA_DEMO, esDemo: true };

export default function DemoNavigator() {
  activarDemo(true);

  useEffect(() => {
    return () => activarDemo(false);
  }, []);

  return (
    <DemoAuthProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DemoIndice">
        <Stack.Screen name="DemoIndice" component={DemoScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="CapturaFoto" component={CapturaFotoScreen} initialParams={{ esDemo: true }} />
        <Stack.Screen name="Resultado" component={ResultadoScreen} initialParams={paramsMock} />
        <Stack.Screen name="Entrega" component={EntregaScreen} initialParams={paramsMock} />
        <Stack.Screen name="Confirmacion" component={ConfirmacionScreen} initialParams={paramsMock} />
        <Stack.Screen name="Certificado" component={CertificadoScreen} initialParams={paramsMock} />
        <Stack.Screen name="Correccion" component={CorreccionScreen} initialParams={paramsMock} />
        <Stack.Screen name="Ayuda" component={AyudaScreen} />
      </Stack.Navigator>
    </DemoAuthProvider>
  );
}