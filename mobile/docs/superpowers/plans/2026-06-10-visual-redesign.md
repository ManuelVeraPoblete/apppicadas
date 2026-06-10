# Rediseño Visual PicáCerca — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar visualmente todas las pantallas del frontend mobile con estilo cálido/naranja, gradientes, cards con más profundidad y PlaceCard horizontal mejorado, sin tocar login ni lógica de negocio.

**Architecture:** Componente compartido `GradientHeader` para los headers reutilizables; cambios de StyleSheet en cada pantalla sin alterar estructura JSX ni lógica. Los cambios son puramente de presentación.

**Tech Stack:** React Native, Expo, expo-linear-gradient (nueva dep), StyleSheet, Colors/Spacing/Radius/Shadow del tema existente.

---

## Task 1: Instalar expo-linear-gradient

**Files:**
- Modify: `package.json` (automático via expo install)

- [ ] **Step 1: Instalar la dependencia**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
npx expo install expo-linear-gradient
```

Esperado: sin errores, `expo-linear-gradient` aparece en `package.json`.

- [ ] **Step 2: Verificar instalación**

```bash
grep "linear-gradient" /home/manuel/Desarrollo/finales/apppicadas/mobile/package.json
```

Esperado: línea con `"expo-linear-gradient": "..."`.

- [ ] **Step 3: Commit**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
git add package.json package-lock.json
git commit -m "chore: instalar expo-linear-gradient"
```

---

## Task 2: Crear componente GradientHeader

**Files:**
- Create: `src/components/ui/GradientHeader.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: Crear el componente**

Crear `src/components/ui/GradientHeader.tsx` con el contenido siguiente:

```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientHeaderProps {
  children: React.ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({ children, dark = false, style }) => (
  <LinearGradient
    colors={dark ? ['#5A1800', '#8B2500', '#C04A00'] : ['#C04A00', '#E85D04', '#FF7A1A']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.gradient, style]}
  >
    <View style={styles.circle1} />
    <View style={styles.circle2} />
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
```

- [ ] **Step 2: Exportar desde el índice de UI**

En `src/components/ui/index.ts`, agregar la línea:

```ts
export { Button } from './Button';
export { Input } from './Input';
export { StarRating } from './StarRating';
export { Badge, PriceBadge } from './Badge';
export { GradientHeader } from './GradientHeader';
```

- [ ] **Step 3: Commit**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
git add src/components/ui/GradientHeader.tsx src/components/ui/index.ts
git commit -m "feat: agregar componente GradientHeader reutilizable"
```

---

## Task 3: Rediseñar PlaceCard

**Files:**
- Modify: `src/components/places/PlaceCard.tsx`

- [ ] **Step 1: Reemplazar el archivo completo**

Reemplazar `src/components/places/PlaceCard.tsx` con:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { NearbyPlace, Place } from '../../types';
import { StarRating } from '../ui/StarRating';
import { Colors, Spacing, Radius, Shadow } from '../../theme';

interface PlaceCardProps {
  place: Place | NearbyPlace;
  showDistance?: boolean;
}

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const PRICE_LABELS: Record<string, string> = { LOW: '$', MEDIUM: '$$', HIGH: '$$$' };

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, showDistance = false }) => {
  const router = useRouter();
  const distanceMeters = (place as NearbyPlace).distanceMeters;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/place/${place.id}`)}
    >
      {/* Imagen izquierda */}
      <View style={styles.imageContainer}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            accessibilityLabel={place.name}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.emoji}>🍽️</Text>
          </View>
        )}
        {showDistance && distanceMeters != null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{formatDistance(distanceMeters)}</Text>
          </View>
        )}
      </View>

      {/* Contenido derecho */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          {place.priceRange && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{PRICE_LABELS[place.priceRange]}</Text>
            </View>
          )}
        </View>

        <Text style={styles.address} numberOfLines={1}>{place.address}</Text>

        <View style={styles.metaRow}>
          <StarRating value={place.ratingAverage} size={12} />
          <Text style={styles.reviewCount}>({place.reviewCount})</Text>
        </View>

        {place.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verificado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    width: 88,
    minHeight: 90,
    backgroundColor: '#E85D04',
    overflow: 'hidden',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB347',
    minHeight: 90,
  },
  emoji: { fontSize: 32 },
  distanceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  priceBadge: {
    backgroundColor: '#FFF3E6',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  priceText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  address: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewCount: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  verifiedBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
```

- [ ] **Step 2: Verificar que la app compila**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores de tipos en PlaceCard.

- [ ] **Step 3: Commit**

```bash
git add src/components/places/PlaceCard.tsx
git commit -m "feat: rediseñar PlaceCard con imagen mejorada y badges"
```

---

## Task 4: Rediseñar pantalla Explorar

**Files:**
- Modify: `app/(user)/(tabs)/explore.tsx`

- [ ] **Step 1: Actualizar el archivo**

Reemplazar `app/(user)/(tabs)/explore.tsx` con:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TextInput, TouchableOpacity, ActivityIndicator, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { usePlacesStore } from '../../../src/stores';
import { PlaceCard } from '../../../src/components/places';
import { GradientHeader } from '../../../src/components/ui';
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
      <GradientHeader>
        <Text style={styles.headerBadge}>🔥 {nearbyPlaces.length} picadas cerca tuyo</Text>
        <Text style={styles.headerTitle}>Descubre tu{'\n'}próxima picada</Text>
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
      </GradientHeader>

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
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>🍽 Todos</Text>
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
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerBadge: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: 'white', lineHeight: 28, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  warningBox: {
    margin: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
  },
  warningText: { fontSize: 12, color: Colors.warning },
  categories: {
    maxHeight: 52,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8E0',
  },
  categoriesContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FFF3E6',
    borderWidth: 1.5,
    borderColor: '#FFD4A8',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  list: { padding: Spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(user)/(tabs)/explore.tsx"
git commit -m "feat: rediseñar pantalla Explorar con banner gradiente"
```

---

## Task 5: Rediseñar pantalla Favoritos

**Files:**
- Modify: `app/(user)/(tabs)/favorites.tsx`

- [ ] **Step 1: Actualizar el archivo**

Reemplazar `app/(user)/(tabs)/favorites.tsx` con:

```tsx
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
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  list: { padding: Spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(user)/(tabs)/favorites.tsx"
git commit -m "feat: rediseñar pantalla Favoritos con header gradiente"
```

---

## Task 6: Rediseñar perfil de usuario

**Files:**
- Modify: `app/(user)/(tabs)/profile.tsx`

- [ ] **Step 1: Actualizar el archivo**

Reemplazar `app/(user)/(tabs)/profile.tsx` con:

```tsx
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
          <Text style={styles.roleText}>👤 Usuario</Text>
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
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(user)/(tabs)/profile.tsx"
git commit -m "feat: rediseñar perfil de usuario con header gradiente"
```

---

## Task 7: Rediseñar detalle del local

**Files:**
- Modify: `app/place/[id].tsx`

Este es el cambio más importante: reemplazar `topBar` + `hero` (emoji gigante + fila de info) por un header naranja compacto con emoji en círculo blanco.

- [ ] **Step 1: Reemplazar la sección de header en el JSX**

En `app/place/[id].tsx`, localizar el bloque que comienza en:
```tsx
return (
  <SafeAreaView style={styles.safe}>
    <View style={styles.topBar}>
```

Reemplazar desde `<View style={styles.topBar}>` hasta el cierre del `<View style={styles.hero}>` (incluyendo el cierre) con:

```tsx
      {/* Header compacto naranja */}
      <View style={styles.placeHeader}>
        <View style={styles.placeHeaderTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Volver">
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity onPress={handleFavorite} style={styles.favBtn} accessibilityLabel={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
              <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.placeHeaderContent}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emojiCircleText}>🍽️</Text>
          </View>
          <View style={styles.placeHeaderInfo}>
            <Text style={styles.placeName} numberOfLines={2}>{place.name}</Text>
            <Text style={styles.placeAddress}>{place.address}, {place.city}</Text>
            <View style={styles.placeMetaRow}>
              <StarRating value={place.ratingAverage} size={13} />
              <Text style={styles.placeRatingText}>{place.ratingAverage.toFixed(1)} ({place.reviewCount})</Text>
              {place.priceRange && <Text style={styles.placePriceText}>{place.priceRange === 'LOW' ? '$' : place.priceRange === 'MEDIUM' ? '$$' : '$$$'}</Text>}
              {place.isVerified && <Text style={styles.placeVerifiedText}>✓</Text>}
            </View>
          </View>
        </View>
        {(place.phone || place.instagram) && (
          <View style={styles.contactChips}>
            {place.phone && (
              <View style={styles.contactChip}>
                <Text style={styles.contactChipText}>📞 {place.phone}</Text>
              </View>
            )}
            {place.instagram && (
              <View style={styles.contactChip}>
                <Text style={styles.contactChipText}>📸 @{place.instagram}</Text>
              </View>
            )}
          </View>
        )}
      </View>
```

- [ ] **Step 2: Actualizar el ScrollView de contenido**

Localizar `<ScrollView contentContainerStyle={styles.content}>` y asegurarse que usa `#F5F0EB` como fondo. El style `content` debe tener `backgroundColor: '#F5F0EB'`.

- [ ] **Step 3: Actualizar el avatar de reseñas**

En el bloque de `reviewCard`, localizar `styles.reviewAvatar` y cambiar su `backgroundColor` de `Colors.primary` a usar un gradiente LinearGradient o simplemente `Colors.primaryLight`:

En el JSX de `reviews.map`, encontrar:
```tsx
<View style={styles.reviewAvatar}>
  <Text style={styles.reviewAvatarText}>{r.userName?.[0]?.toUpperCase() ?? '?'}</Text>
</View>
```
No hay cambio en JSX, solo en el estilo.

- [ ] **Step 4: Reemplazar todos los estilos de header en `place/[id].tsx`**

En el `StyleSheet.create(...)`, **reemplazar** los estilos `topBar`, `backBtn`, `backText`, `favBtn`, `favIcon`, `hero`, `heroEmoji`, `heroInfo`, `heroRow`, `name`, `verified`, `address`, `metaRow`, `ratingText`, `contact` con los siguientes nuevos estilos (los demás estilos del archivo quedan igual):

```ts
  // Reemplaza: topBar, backBtn, backText, favBtn, favIcon, hero, heroEmoji, heroInfo, heroRow, name, verified, address, metaRow, ratingText, contact
  placeHeader: {
    backgroundColor: '#E85D04',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  placeHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, fontWeight: '700', color: 'white' },
  favBtn: { padding: 4 },
  favIcon: { fontSize: 22 },
  placeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    flexShrink: 0,
  },
  emojiCircleText: { fontSize: 28 },
  placeHeaderInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '900', color: 'white', lineHeight: 20 },
  placeAddress: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  placeRatingText: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  placePriceText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  placeVerifiedText: { fontSize: 11, color: '#A5D6A7', fontWeight: '700' },
  contactChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  contactChip: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  contactChipText: { fontSize: 11, color: '#444' },
  // Actualizar también:
  content: { padding: Spacing.md, paddingBottom: 40, backgroundColor: '#F5F0EB' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
```

- [ ] **Step 5: Verificar tipos**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores en `place/[id].tsx`.

- [ ] **Step 6: Commit**

```bash
git add "app/place/[id].tsx"
git commit -m "feat: rediseñar detalle del local con header compacto naranja"
```

---

## Task 8: Rediseñar perfil del owner

**Files:**
- Modify: `app/(owner)/(tabs)/profile.tsx`

- [ ] **Step 1: Actualizar el archivo**

Reemplazar `app/(owner)/(tabs)/profile.tsx` con:

```tsx
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
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
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
  connectedBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, backgroundColor: '#e6f4ea', borderRadius: Radius.sm },
  connectedText: { fontSize: 12, color: '#1e7e34', fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(owner)/(tabs)/profile.tsx"
git commit -m "feat: rediseñar perfil del owner con header gradiente"
```

---

## Task 9: Headers gradiente en pantallas Owner (my-place, offers, reviews, offer-form)

**Files:**
- Modify: `app/(owner)/(tabs)/my-place.tsx`
- Modify: `app/(owner)/(tabs)/offers.tsx`
- Modify: `app/(owner)/(tabs)/reviews.tsx`
- Modify: `app/(owner)/offer-form.tsx`

### my-place.tsx

- [ ] **Step 1: Agregar import GradientHeader en my-place.tsx**

En `app/(owner)/(tabs)/my-place.tsx`, agregar el import:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

- [ ] **Step 2: Reemplazar el header en my-place.tsx**

Localizar:
```tsx
        <View style={styles.header}>
          <Text style={styles.title}>{place ? '✏️ Editar mi local' : '🏪 Crear mi local'}</Text>
          {place && (
            <View style={styles.stats}>
              <Text style={styles.stat}>⭐ {place.ratingAverage.toFixed(1)}</Text>
              <Text style={styles.stat}>💬 {place.reviewCount} reseñas</Text>
              {place.isVerified && <Text style={[styles.stat, { color: Colors.success }]}>✓ Verificado</Text>}
            </View>
          )}
        </View>
```

Reemplazar con:
```tsx
        <GradientHeader>
          <Text style={styles.headerTitle}>{place ? '✏️ Editar mi local' : '🏪 Crear mi local'}</Text>
          {place && (
            <View style={styles.headerStats}>
              <Text style={styles.headerStat}>⭐ {place.ratingAverage.toFixed(1)}</Text>
              <Text style={styles.headerStat}>💬 {place.reviewCount} reseñas</Text>
              {place.isVerified && <Text style={styles.headerStat}>✓ Verificado</Text>}
            </View>
          )}
        </GradientHeader>
```

- [ ] **Step 3: Actualizar estilos de my-place.tsx**

En el `StyleSheet.create`, reemplazar:
```ts
  header: { marginBottom: Spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  stats: { flexDirection: 'row', gap: Spacing.md, marginTop: 6 },
  stat: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
```

Con:
```ts
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerStats: { flexDirection: 'row', gap: Spacing.md },
  headerStat: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
```

Y cambiar `safe` a `backgroundColor: '#F5F0EB'`:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
```

Y cambiar `scroll` para quitar el padding top (el GradientHeader lo tiene):
```ts
  scroll: { paddingBottom: 40 },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.lg, margin: Spacing.lg },
```

### offers.tsx

- [ ] **Step 4: Agregar import y reemplazar header en offers.tsx**

En `app/(owner)/(tabs)/offers.tsx`, agregar:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

Localizar el `View` del header (buscar `styles.header` y `styles.title` con el texto de Ofertas). El renderizado principal tiene un header similar a los demás. Buscar el bloque:
```tsx
      <View style={styles.header}>
        <Text style={styles.title}>🏷️ Mis ofertas</Text>
        ...
      </View>
```

Reemplazarlo con:
```tsx
      <GradientHeader>
        <Text style={styles.headerTitle}>🏷️ Mis ofertas</Text>
        {place && <Text style={styles.headerSubtitle}>{place.name}</Text>}
      </GradientHeader>
```

Y actualizar en StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
```

### reviews.tsx

- [ ] **Step 5: Agregar import y reemplazar header en reviews.tsx**

En `app/(owner)/(tabs)/reviews.tsx`, agregar:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

Localizar:
```tsx
      <View style={styles.header}>
        <Text style={styles.title}>💬 Reseñas</Text>
        <View style={styles.summary}>
          <Text style={styles.avgRating}>⭐ {avgRating}</Text>
          <Text style={styles.reviewCount}>{reviews.length} reseñas</Text>
        </View>
      </View>
```

Reemplazar con:
```tsx
      <GradientHeader>
        <Text style={styles.headerTitle}>💬 Reseñas</Text>
        <View style={styles.headerSummary}>
          <Text style={styles.headerStat}>⭐ {avgRating}</Text>
          <Text style={styles.headerStat}>{reviews.length} reseñas</Text>
        </View>
      </GradientHeader>
```

Y actualizar StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerSummary: { flexDirection: 'row', gap: Spacing.md },
  headerStat: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 40 },
```

### offer-form.tsx

- [ ] **Step 6: Reemplazar header en offer-form.tsx**

En `app/(owner)/offer-form.tsx`, agregar:
```tsx
import { GradientHeader } from '../../src/components/ui';
```

Localizar:
```tsx
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar oferta' : 'Nueva oferta'}</Text>
        <View style={{ width: 40 }} />
      </View>
```

Reemplazar con:
```tsx
      <GradientHeader style={styles.headerRow}>
        <View style={styles.headerRowContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Editar oferta' : 'Nueva oferta'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </GradientHeader>
```

Y actualizar StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerRow: { paddingTop: 8, paddingBottom: 12 },
  headerRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, padding: 4 },
  backText: { fontSize: 22, color: 'white', fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: 'white' },
  content: { padding: Spacing.lg, paddingBottom: 48 },
```

- [ ] **Step 7: Commit**

```bash
git add "app/(owner)/(tabs)/my-place.tsx" "app/(owner)/(tabs)/offers.tsx" "app/(owner)/(tabs)/reviews.tsx" "app/(owner)/offer-form.tsx"
git commit -m "feat: headers gradiente en pantallas Owner (my-place, offers, reviews, offer-form)"
```

---

## Task 10: Header gradiente en pantalla Menú (owner)

**Files:**
- Modify: `app/(owner)/(tabs)/menu.tsx`

La pantalla de menú es especial: cuando hay imagen de menú usa `ImageBackground`; en ese caso se mantiene el header transparente sobre la foto. Solo se aplica `GradientHeader` cuando no hay imagen.

- [ ] **Step 1: Agregar import en menu.tsx**

```tsx
import { GradientHeader } from '../../../src/components/ui';
```

- [ ] **Step 2: Reemplazar el header condicional en menu.tsx**

Localizar:
```tsx
        <View style={[styles.header, hasImage && styles.headerTransparent]}>
          <Text style={[styles.title, hasImage && styles.titleLight]}>🍽️ Menú</Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleUploadMenuImage} disabled={uploadingImage}>
            {uploadingImage
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.cameraBtnText}>{hasImage ? '📷' : '📷 Subir foto'}</Text>}
          </TouchableOpacity>
        </View>
```

Reemplazar con:
```tsx
        {hasImage ? (
          <View style={[styles.header, styles.headerTransparent]}>
            <Text style={[styles.title, styles.titleLight]}>🍽️ Menú</Text>
            <TouchableOpacity style={styles.cameraBtn} onPress={handleUploadMenuImage} disabled={uploadingImage}>
              {uploadingImage
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.cameraBtnText}>📷</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <GradientHeader style={styles.gradientHeaderRow}>
            <Text style={styles.headerTitle}>🍽️ Menú</Text>
            <TouchableOpacity style={styles.cameraBtn} onPress={handleUploadMenuImage} disabled={uploadingImage}>
              {uploadingImage
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.cameraBtnText}>📷 Subir foto</Text>}
            </TouchableOpacity>
          </GradientHeader>
        )}
```

- [ ] **Step 3: Actualizar StyleSheet en menu.tsx**

Agregar los nuevos estilos y cambiar `safe`:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  gradientHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
```

- [ ] **Step 4: Commit**

```bash
git add "app/(owner)/(tabs)/menu.tsx"
git commit -m "feat: header gradiente en pantalla Menú del owner"
```

---

## Task 11: Headers oscuros en pantallas Admin

**Files:**
- Modify: `app/(admin)/(tabs)/reports.tsx`
- Modify: `app/(admin)/(tabs)/places.tsx`
- Modify: `app/(admin)/(tabs)/categories.tsx`

Las tres pantallas admin usan `dark={true}` en `GradientHeader` para un gradiente más oscuro (`#5A1800 → #8B2500 → #C04A00`).

### reports.tsx

- [ ] **Step 1: Import y header en reports.tsx**

Agregar import:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

Localizar el header JSX (buscar `styles.header` con texto "Reportes"). Reemplazar:
```tsx
      <View style={styles.header}>
        <Text style={styles.title}>🚩 Reportes</Text>
        {pending > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pending} pendiente{pending !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>
```
Con:
```tsx
      <GradientHeader dark>
        <Text style={styles.headerTitle}>🚩 Reportes</Text>
        {pending > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pending} pendiente{pending !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </GradientHeader>
```

Actualizar StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  pendingBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pendingBadgeText: { fontSize: 12, color: 'white', fontWeight: '600' },
```

### places.tsx

- [ ] **Step 2: Import y header en places.tsx**

Agregar import:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

Localizar el header con el título "Locales". Reemplazar:
```tsx
      <View style={styles.header}>
        <Text style={styles.title}>📍 Locales</Text>
        {pending > 0 && <Text style={styles.pendingText}>{pending} sin verificar</Text>}
      </View>
      <View style={styles.searchRow}>
        <TextInput ... />
      </View>
```
Con:
```tsx
      <GradientHeader dark>
        <Text style={styles.headerTitle}>📍 Locales</Text>
        {pending > 0 && <Text style={styles.headerSubtitle}>{pending} sin verificar</Text>}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o ciudad..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </GradientHeader>
```

Actualizar StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchInput: { fontSize: 14, color: 'white' },
```

### categories.tsx

- [ ] **Step 3: Import y header en categories.tsx**

Agregar import:
```tsx
import { GradientHeader } from '../../../src/components/ui';
```

Localizar el header con texto "Categorías". Reemplazar con:
```tsx
      <GradientHeader dark>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🏷️ Categorías</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>＋ Nueva</Text>
          </TouchableOpacity>
        </View>
      </GradientHeader>
```

Actualizar StyleSheet:
```ts
  safe: { flex: 1, backgroundColor: '#F5F0EB' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
```

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/(tabs)/reports.tsx" "app/(admin)/(tabs)/places.tsx" "app/(admin)/(tabs)/categories.tsx"
git commit -m "feat: headers gradiente oscuro en pantallas Admin"
```

---

## Task 12: Rediseñar pantalla de registro

**Files:**
- Modify: `app/(auth)/register.tsx`

- [ ] **Step 1: Actualizar estilos del formulario y role cards**

En `app/(auth)/register.tsx`, localizar el `StyleSheet.create` y actualizar los estilos siguientes:

```ts
  form: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  roleCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,243,230,0.9)',
  },
  roleLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/register.tsx"
git commit -m "feat: mejorar estilos del formulario de registro"
```

---

## Verificación final

- [ ] **Iniciar la app y verificar cada pantalla:**

```bash
cd /home/manuel/Desarrollo/finales/apppicadas/mobile
npx expo start
```

Revisar visualmente:
1. Login — sin cambios ✓
2. Register — formulario más sólido, role cards con borde naranja activo
3. Explorar — banner naranja con título + search flotante, chips naranja-cálido
4. PlaceCard — imagen con gradiente fallback, badge distancia, badge precio naranja, verified verde
5. Favoritos — header naranja con título blanco
6. Detalle local — barra naranja compacta con emoji en círculo blanco
7. Perfil usuario — gradiente, avatar círculo blanco
8. Mi local (owner) — header naranja con título blanco
9. Menú (owner) — gradiente cuando no hay imagen de menú
10. Ofertas (owner) — header naranja
11. Reseñas (owner) — header naranja con rating
12. Formulario oferta — header naranja con botón volver
13. Perfil owner — gradiente, avatar círculo blanco
14. Admin Reportes — header oscuro rojo-naranja
15. Admin Locales — header oscuro con buscador integrado
16. Admin Categorías — header oscuro con botón nueva categoría
