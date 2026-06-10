import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useFavoritesStore, useAuthStore } from '../../../src/stores';
import { PlaceCard } from '../../../src/components/places';
import { GradientHeader } from '../../../src/components/ui';
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
      <GradientHeader>
        <Text style={styles.headerTitle}>❤️ Mis favoritos</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} picada{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}
        </Text>
      </GradientHeader>

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
  safe: { flex: 1, backgroundColor: Colors.warmBackground },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  list: { padding: Spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
});
