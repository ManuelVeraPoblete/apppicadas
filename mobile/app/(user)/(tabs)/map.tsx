import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usePlacesStore, useFavoritesStore } from '../../../src/stores';
import { PlaceMapMarker } from '../../../src/components/places';
import { NearbyPlace } from '../../../src/types';
import { Colors, Spacing, Radius } from '../../../src/theme';
import { PICACERCA_MAP_STYLE } from '../../../src/shared/maps/google-map-clean-style';

const openDirections = (lat: number, lng: number, mode: 'walk' | 'drive') => {
  const travelMode = mode === 'walk' ? 'w' : 'd';
  const url = Platform.OS === 'ios'
    ? `maps://?daddr=${lat},${lng}&dirflg=${travelMode}`
    : `google.navigation:q=${lat},${lng}&mode=${travelMode}`;
  Linking.openURL(url).catch(() => {
    const fallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode === 'walk' ? 'walking' : 'driving'}`;
    Linking.openURL(fallback);
  });
};

export default function MapScreen() {
  const { nearbyPlaces, fetchNearby, error: storeError } = usePlacesStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NearbyPlace | null>(null);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const coords = status === 'granted'
        ? (await Location.getCurrentPositionAsync({})).coords
        : { latitude: -33.4489, longitude: -70.6693 };
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      await fetchNearby({ lat: coords.latitude, lng: coords.longitude, radius: 50000 });
    } catch {
      const fallback = { latitude: -33.4489, longitude: -70.6693 };
      setUserLocation(fallback);
      await fetchNearby({ lat: fallback.latitude, lng: fallback.longitude, radius: 50000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const center = userLocation ?? { latitude: -33.4489, longitude: -70.6693 };

  return (
    <SafeAreaView style={styles.safe}>
      <MapView
        style={styles.map}
        customMapStyle={PICACERCA_MAP_STYLE}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
        onPress={() => setSelected(null)}
      >
        {nearbyPlaces.map((place) => (
          <PlaceMapMarker
            key={place.id}
            place={place}
            onPress={setSelected}
          />
        ))}
      </MapView>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{nearbyPlaces.length} picadas cercanas</Text>
      </View>

      {storeError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {storeError}</Text>
          <TouchableOpacity onPress={loadMap} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {selected && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelName}>{selected.name}</Text>
              <Text style={styles.panelAddress}>{selected.address}</Text>
            </View>
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => isFavorite(selected.id)
                ? removeFavorite(selected.id)
                : addFavorite(selected.id)
              }
            >
              <Text style={styles.favBtnIcon}>
                {isFavorite(selected.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.panelLabel}>¿Cómo quieres llegar?</Text>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnWalk]}
              onPress={() => openDirections(Number(selected.latitude), Number(selected.longitude), 'walk')}
            >
              <Text style={styles.navBtnIcon}>🚶</Text>
              <Text style={styles.navBtnText}>A pie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnDrive]}
              onPress={() => openDirections(Number(selected.latitude), Number(selected.longitude), 'drive')}
            >
              <Text style={styles.navBtnIcon}>🚗</Text>
              <Text style={styles.navBtnText}>En auto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkRow}>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => { setSelected(null); router.push({ pathname: '/place/[id]', params: { id: selected.id, tab: 'menu' } }); }}
            >
              <Text style={styles.linkBtnIcon}>🍽️</Text>
              <Text style={styles.linkBtnText}>Ver menú</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => { setSelected(null); router.push({ pathname: '/place/[id]', params: { id: selected.id, tab: 'offers' } }); }}
            >
              <Text style={styles.linkBtnIcon}>🏷️</Text>
              <Text style={styles.linkBtnText}>Ver ofertas</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  map:         { flex: 1 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary },

  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: Colors.text },

  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#FFF3F3',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  errorText: { fontSize: 13, color: Colors.error, textAlign: 'center' },
  retryBtn:  { marginTop: 8, backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  panelName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  panelAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  favBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  favBtnIcon: {
    fontSize: 26,
  },
  closeBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  panelLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: 8,
  },
  navBtnWalk: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  navBtnDrive: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  navBtnIcon: { fontSize: 20 },
  navBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },

  linkRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  linkBtnIcon: { fontSize: 18 },
  linkBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
