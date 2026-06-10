import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../../../src/stores';
import { ownerApi } from '../../../src/api/owner.api';
import { GradientHeader } from '../../../src/components/ui';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [instagramConnected, setInstagramConnected] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      ownerApi.getInstagramStatus()
        .then(({ connected }) => setInstagramConnected(connected))
        .catch(() => setInstagramConnected(false));
    }, []),
  );

  const handleConnectInstagram = async () => {
    try {
      const { url } = await ownerApi.getInstagramConnectUrl();
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo iniciar la conexión con Instagram.');
    }
  };

  const handleDisconnectInstagram = () => {
    Alert.alert('Desconectar Instagram', '¿Querés desvincular tu cuenta de Instagram?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desconectar', style: 'destructive', onPress: async () => {
          await ownerApi.disconnectInstagram();
          setInstagramConnected(false);
        },
      },
    ]);
  };

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
          <Text style={styles.roleText}>🏪 Dueño de local</Text>
        </View>
      </GradientHeader>

      <View style={styles.section}>
        {instagramConnected === null ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : instagramConnected ? (
          <TouchableOpacity style={styles.row} onPress={handleDisconnectInstagram}>
            <Text style={styles.rowIcon}>📷</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Instagram conectado</Text>
              <Text style={styles.rowSub}>Toca para desconectar</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Activo</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.row} onPress={handleConnectInstagram}>
            <Text style={styles.rowIcon}>📷</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Conectar Instagram</Text>
              <Text style={styles.rowSub}>Publicá ofertas automáticamente</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

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
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '700', color: 'white', textAlign: 'center' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  roleBadge: {
    marginTop: Spacing.sm, alignSelf: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    backgroundColor: 'white', borderRadius: Radius.full,
  },
  roleText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  section: {
    margin: Spacing.lg, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  rowContent: { flex: 1 },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  connectedBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, backgroundColor: Colors.successLight, borderRadius: Radius.sm },
  connectedText: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
});
