import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { adminApi } from '../../../src/api/admin.api';
import { Place } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

export default function AdminPlacesScreen() {
  const [places, setPlaces]   = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [search, setSearch]   = useState('');

  const loadPlaces = useCallback(() => {
    setLoading(true);
    adminApi.getAllPlaces({ limit: 100 })
      .then((res) => setPlaces(res.data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los locales'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadPlaces);

  const handleVerify = (place: Place) => {
    Alert.alert(
      'Verificar local',
      `¿Verificar "${place.name}"? Aparecerá con el badge ✅ verificado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Verificar',
          onPress: async () => {
            setVerifying(place.id);
            try {
              const updated = await adminApi.verifyPlace(place.id);
              setPlaces((prev) => prev.map((p) => p.id === updated.id ? updated : p));
            } catch {
              Alert.alert('Error', 'No se pudo verificar el local');
            } finally {
              setVerifying(null);
            }
          },
        },
      ],
    );
  };

  const filtered = places.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()),
  );

  const pending  = places.filter((p) => !p.isVerified && p.isActive).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Locales</Text>
        <Text style={styles.headerSub}>{pending} sin verificar</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ciudad..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Sin resultados</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isVerifying = verifying === item.id;
          return (
            <View style={[styles.card, !item.isActive && styles.cardInactive]}>
              <View style={styles.cardInfo}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.isVerified && <Text style={styles.verifiedBadge}>✅</Text>}
                  {!item.isActive && <Text style={styles.inactiveBadge}>Inactivo</Text>}
                </View>
                <Text style={styles.cardCity}>{item.address}, {item.city}</Text>
                <Text style={styles.cardRating}>⭐ {item.ratingAverage.toFixed(1)} · {item.reviewCount} reseña{item.reviewCount !== 1 ? 's' : ''}</Text>
              </View>

              {!item.isVerified && item.isActive && (
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={() => handleVerify(item)}
                  disabled={isVerifying}
                >
                  {isVerifying
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.verifyBtnText}>Verificar</Text>}
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
  emptyText: { fontSize: 15, color: Colors.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    padding: Spacing.lg, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:     { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.warning, fontWeight: '600' },

  searchBox: { padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: 14, color: Colors.text,
  },

  list: { padding: Spacing.md, paddingBottom: 32 },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', ...Shadow.sm,
  },
  cardInactive: { opacity: 0.5 },
  cardInfo: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  verifiedBadge: { fontSize: 14 },
  inactiveBadge: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden',
  },
  cardCity:   { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardRating: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  verifyBtn: {
    backgroundColor: Colors.success, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minWidth: 80, alignItems: 'center',
  },
  verifyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
