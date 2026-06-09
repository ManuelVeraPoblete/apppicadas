import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TextInput, TouchableOpacity, ActivityIndicator, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { usePlacesStore } from '../../../src/stores';
import { PlaceCard } from '../../../src/components/places';
import { Colors, Spacing, Radius } from '../../../src/theme';

export default function ExploreScreen() {
  const { nearbyPlaces, categories, fetchNearby, fetchCategories, isLoading, selectedCategory, setSelectedCategory } = usePlacesStore();
  const [search, setSearch] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    loadNearby();
  }, []);

  const loadNearby = async (categoryId?: string | null) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Necesitamos acceso a tu ubicación para mostrarte picadas cercanas');
      await fetchNearby({ lat: -33.4489, lng: -70.6693, radius: 5000, categoryId: categoryId ?? undefined });
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    await fetchNearby({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      radius: 5000,
      categoryId: categoryId ?? undefined,
    });
  };

  const filtered = nearbyPlaces.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar picadas</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o dirección..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {locationError && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>📍 {locationError}</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => { setSelectedCategory(null); loadNearby(null); }}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            onPress={() => { setSelectedCategory(cat.id); loadNearby(cat.id); }}
          >
            <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
              {cat.emoji} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Buscando picadas cercanas...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} showDistance />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No se encontraron picadas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, backgroundColor: Colors.surface },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  warningBox: {
    margin: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
  },
  warningText: { fontSize: 12, color: Colors.warning },
  categories: { maxHeight: 52, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoriesContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.textInverse },
  list: { padding: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md },
});
