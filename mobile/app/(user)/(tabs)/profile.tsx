import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/stores';
import { Colors, Spacing, Radius } from '../../../src/theme';

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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'OWNER' ? '🏪 Dueño de local' : '👤 Usuario'}</Text>
        </View>
      </View>

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
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.textInverse },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: {
    marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 4,
    backgroundColor: Colors.secondary, borderRadius: Radius.full,
  },
  roleText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  section: { margin: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
});
