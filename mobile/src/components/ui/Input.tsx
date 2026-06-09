import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, rightIcon, isPassword, style, ...props }) => {
  const [secure, setSecure] = useState(isPassword ?? false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.icon}>
            <Text style={styles.iconText}>{secure ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: Spacing.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  inputNormal: { borderColor: Colors.border },
  inputError: { borderColor: Colors.error },
  input: { flex: 1, height: 48, fontSize: 15, color: Colors.text },
  icon: { paddingLeft: Spacing.sm },
  iconText: { fontSize: 16 },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
});
