import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Image,
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/stores';
import { Button, Input } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/theme';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      const { user: loggedUser } = useAuthStore.getState();
      if (loggedUser?.role === 'OWNER') {
        router.replace('/(owner)/(tabs)/my-place');
      } else {
        router.replace('/(user)/(tabs)/explore');
      }
    } catch {
      // error shown via store
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fondo.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>Iniciar sesión</Text>

              {error && (
                <TouchableOpacity style={styles.errorBox} onPress={clearError}>
                  <Text style={styles.errorText}>{error}</Text>
                </TouchableOpacity>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Email"
                    placeholder="tu@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Contraseña"
                    placeholder="••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isPassword
                    error={errors.password?.message}
                  />
                )}
              />

              <Button
                label="Entrar"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
              />

              <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.linkText}>
                  ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  header: { alignItems: 'center', paddingVertical: Spacing.xxl },
  logo: { width: 281, height: 281 },
  form: {
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: 13 },
  button: { marginTop: Spacing.sm },
  link: { alignItems: 'center', marginTop: Spacing.lg },
  linkText: { color: '#000000', fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
