import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/stores';
import { Button, Input } from '../../src/components/ui';
import { Colors, Spacing, Radius } from '../../src/theme';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  { value: 'USER' as const, label: 'Soy cliente', emoji: '🧑‍🍳', desc: 'Descubro picadas cercanas' },
  { value: 'OWNER' as const, label: 'Soy dueño', emoji: '🏪', desc: 'Registro mi local' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [role, setRole] = useState<'USER' | 'OWNER'>('USER');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await register({ name: data.name, email: data.email, password: data.password, role });
      const { user: registeredUser } = useAuthStore.getState();
      if (registeredUser?.role === 'OWNER') {
        router.replace('/(owner)/(tabs)/my-place');
      } else {
        router.replace('/(user)/(tabs)/explore');
      }
    } catch {
      // error shown via store
    }
  };

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Crear cuenta</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionLabel}>¿Cómo usarás PicáCerca?</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && (
              <TouchableOpacity style={styles.errorBox} onPress={clearError}>
                <Text style={styles.errorText}>{error}</Text>
              </TouchableOpacity>
            )}

            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />

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
                  placeholder="Mínimo 6 caracteres"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Confirmar contraseña"
                  placeholder="Repite tu contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              label="Crear cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.button}
            />

            <TouchableOpacity style={styles.link} onPress={() => router.back()}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  header: { paddingVertical: Spacing.lg },
  backBtn: { marginBottom: Spacing.sm },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
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
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: Spacing.sm },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  roleEmoji: { fontSize: 28, marginBottom: 4 },
  roleLabel: { fontSize: 13, fontWeight: '700', color: '#000000' },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: '#000000', textAlign: 'center', marginTop: 2 },
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
