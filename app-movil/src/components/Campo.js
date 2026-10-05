import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function Campo({
  icono,
  placeholder,
  valor,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multilinea = false,
  autoCapitalize = 'sentences',
}) {
  const [foco, setFoco] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={[estilos.campo, foco && estilos.foco]}>
      {icono ? <Ionicons name={icono} size={16} color={COLORS.mutIcon} /> : null}
      <TextInput
        style={[estilos.input, multilinea && estilos.multilinea]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.mutIcon}
        value={valor ?? value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !visible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multilinea}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
      />
      {secureTextEntry ? (
        <TouchableOpacity onPress={() => setVisible(!visible)} hitSlop={8}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.mutIcon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: {
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
  multilinea: { height: 92, textAlignVertical: 'top', paddingTop: ESPACIOS.md },
  foco: { borderColor: '#4EAF79', boxShadow: `0px 0px 0px 3px ${COLORS.focusSoft}` },
  input: {
    flex: 1,
    ...TIPOGRAFIA.small,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: COLORS.inkField,
    padding: 0,
  },
});