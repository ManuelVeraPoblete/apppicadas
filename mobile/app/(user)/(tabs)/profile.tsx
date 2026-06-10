import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/stores';
import { GradientHeader } from '../../../src/components/ui';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <GradientHeader style={styles.headerPadding}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'OWNER' ? '🏪 Dueño de local' : '👤 Usuario'}
          </Text>
        </View>
      </GradientHeader>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.rowIcon}>🚪</Text>
          <Text style={[styles.rowLabel, { color: Colors.error }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.warmBackground },
  headerPadding: { paddingBottom: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '700', color: 'white', textAlign: 'center' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  roleBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: Radius.full,
  },
  roleText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  section: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
});
