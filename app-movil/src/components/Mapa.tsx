import React from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import MapaWeb from './Mapa.web';
import MapaNative from './Mapa.native';
import MapaWebView from './Mapa.webview';

const isExpoGo = Constants.appOwnership === 'expo';

export default function Mapa(props) {
  if (Platform.OS === 'web') {
    return <MapaWeb {...props} />;
  }

  if (isExpoGo) {
    return <MapaWebView {...props} />;
  }

  return <MapaNative {...props} />;
}
