import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useFavoritesStore, useAuthStore } from '../../../src/stores';
import { PlaceCard } from '../../../src/components/places';
import { Colors, Spacing } from '../../../src/theme';

export default function FavoritesScreen() {
  const { favorites, fetchFavorites, isLoading } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) fetchFavorites();
    }, [isAuthenticated]),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Mis favoritos</Text>
        <Text style={styles.subtitle}>{favorites.length} picada{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💔</Text>
              <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
              <Text style={styles.emptyText}>Explora picadas cercanas y guarda las que más te gusten</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
});
