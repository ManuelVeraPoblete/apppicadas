import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, ImageBackground,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { placesApi } from '../../../src/api/places.api';
import { ownerApi } from '../../../src/api/owner.api';
import { Place, MenuItem } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

export default function OwnerMenuScreen() {
  const [place, setPlace] = useState<Place | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await placesApi.getMyPlace();
      setPlace(p);
      if (p) {
        const items = await ownerApi.getMenu(p.id);
        setMenu(items);
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMenuImage = async () => {
    if (!place) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para subir la imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    setUploadingImage(true);
    try {
      const { menuImageUrl } = await ownerApi.uploadMenuImage(place.id, result.assets[0].uri, place.name);
      setPlace((p) => p ? { ...p, menuImageUrl } : p);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo subir la imagen del menú');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.noPlaceEmoji}>🏪</Text>
          <Text style={styles.noPlaceText}>Primero crea tu local en "Mi Local"</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={place.menuImageUrl ? { uri: place.menuImageUrl } : undefined}
      style={styles.bg}
      resizeMode="cover"
    >
      {place.menuImageUrl && <View style={styles.overlay} />}

      <SafeAreaView style={styles.safeTransparent}>
        <View style={[styles.header, place.menuImageUrl && styles.headerTransparent]}>
          <Text style={[styles.title, place.menuImageUrl && styles.titleLight]}>🍽️ Menú</Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleUploadMenuImage} disabled={uploadingImage}>
            {uploadingImage
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.cameraBtnText}>{place.menuImageUrl ? '📷' : '📷 Subir foto'}</Text>}
          </TouchableOpacity>
        </View>

        <FlatList
          data={menu}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.menuItem, place.menuImageUrl && styles.menuItemGlass]}>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuName, place.menuImageUrl && styles.textLight]}>{item.name}</Text>
                {item.description && (
                  <Text style={[styles.menuDesc, place.menuImageUrl && styles.textMutedLight]}>{item.description}</Text>
                )}
                {!item.isAvailable && <Text style={styles.unavailable}>No disponible</Text>}
              </View>
              <View style={styles.menuActions}>
                <Text style={styles.menuPrice}>${item.price.toLocaleString()}</Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.background },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safe: { flex: 1, backgroundColor: Colors.background },
  safeTransparent: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noPlaceEmoji: { fontSize: 56 },
  noPlaceText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md, textAlign: 'center', padding: Spacing.lg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTransparent: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  titleLight: { color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  cameraBtn: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full },
  cameraBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  list: { padding: Spacing.md, paddingBottom: 24 },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, ...Shadow.sm,
  },
  menuItemGlass: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  menuDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  textLight: { color: '#fff' },
  textMutedLight: { color: 'rgba(255,255,255,0.75)' },
  unavailable: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
  menuActions: { flexDirection: 'row', alignItems: 'center' },
  menuPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary },
});
