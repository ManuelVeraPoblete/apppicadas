import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, ImageBackground,
  Modal, TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/core';
import * as ImagePicker from 'expo-image-picker';
import { placesApi } from '../../../src/api/places.api';
import { ownerApi } from '../../../src/api/owner.api';
import { Place, MenuItem } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

const EMPTY_FORM = { name: '', desc: '', price: '', available: true };

export default function OwnerMenuScreen() {
  const [place, setPlace]                   = useState<Place | null>(null);
  const [menu, setMenu]                     = useState<MenuItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem]   = useState<MenuItem | null>(null);
  const [saving, setSaving]             = useState(false);
  const [itemName, setItemName]         = useState('');
  const [itemDesc, setItemDesc]         = useState('');
  const [itemPrice, setItemPrice]       = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  const loadData = useCallback(() => {
    setLoading(true);
    placesApi.getMyPlace()
      .then(async (p) => {
        setPlace(p);
        if (p) setMenu(await ownerApi.getMenu(p.id));
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el menú'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadData);

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

  const openCreate = () => {
    setEditingItem(null);
    setItemName(EMPTY_FORM.name);
    setItemDesc(EMPTY_FORM.desc);
    setItemPrice(EMPTY_FORM.price);
    setItemAvailable(EMPTY_FORM.available);
    setModalVisible(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description ?? '');
    setItemPrice(String(item.price));
    setItemAvailable(item.isAvailable);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!place) return;
    const trimmedName = itemName.trim();
    if (!trimmedName) {
      Alert.alert('Campo requerido', 'El nombre del ítem es obligatorio.');
      return;
    }
    const price = Number(itemPrice);
    if (!itemPrice || isNaN(price) || price <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido mayor a 0.');
      return;
    }
    setSaving(true);
    try {
      const dto = {
        name: trimmedName,
        description: itemDesc.trim() || undefined,
        price,
        isAvailable: itemAvailable,
      };
      if (editingItem) {
        const updated = await ownerApi.updateMenuItem(place.id, editingItem.id, dto);
        setMenu((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      } else {
        const created = await ownerApi.createMenuItem(place.id, dto);
        setMenu((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar el ítem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: MenuItem) => {
    swipeableRefs.current[item.id]?.close();
    Alert.alert(
      'Eliminar ítem',
      `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            if (!place) return;
            try {
              await ownerApi.deleteMenuItem(place.id, item.id);
              setMenu((prev) => prev.filter((m) => m.id !== item.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el ítem.');
            }
          },
        },
      ],
    );
  };

  const renderDeleteAction = (item: MenuItem) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item)}>
      <Text style={styles.deleteActionIcon}>🗑️</Text>
      <Text style={styles.deleteActionText}>Eliminar</Text>
    </TouchableOpacity>
  );

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

  const hasImage = !!place.menuImageUrl;

  return (
    <ImageBackground
      source={hasImage ? { uri: place.menuImageUrl } : undefined}
      style={styles.bg}
      resizeMode="cover"
    >
      {hasImage && <View style={styles.overlay} />}

      <SafeAreaView style={styles.safeTransparent}>
        <View style={[styles.header, hasImage && styles.headerTransparent]}>
          <Text style={[styles.title, hasImage && styles.titleLight]}>🍽️ Menú</Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleUploadMenuImage} disabled={uploadingImage}>
            {uploadingImage
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.cameraBtnText}>{hasImage ? '📷' : '📷 Subir foto'}</Text>}
          </TouchableOpacity>
        </View>

        <FlatList
          data={menu}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptySection}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyTitle, hasImage && styles.textLight]}>Sin ítems aún</Text>
              <Text style={[styles.emptyHint, hasImage && styles.textMutedLight]}>
                Toca "＋ Agregar ítem" para comenzar
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
              renderRightActions={() => renderDeleteAction(item)}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => openEdit(item)}
                style={[styles.menuItem, hasImage && styles.menuItemGlass]}
              >
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuName, hasImage && styles.textLight]}>{item.name}</Text>
                  {item.description ? (
                    <Text style={[styles.menuDesc, hasImage && styles.textMutedLight]}>{item.description}</Text>
                  ) : null}
                  {!item.isAvailable && <Text style={styles.unavailable}>No disponible</Text>}
                </View>
                <View style={styles.menuActions}>
                  <Text style={styles.menuPrice}>${item.price.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
        />

        <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
          <Text style={styles.fabText}>＋ Agregar ítem</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar ítem' : 'Nuevo ítem'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Empanada de queso"
                placeholderTextColor={Colors.textMuted}
                value={itemName}
                onChangeText={setItemName}
                returnKeyType="next"
              />

              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="ej. Queso derretido, masa crujiente"
                placeholderTextColor={Colors.textMuted}
                value={itemDesc}
                onChangeText={setItemDesc}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Precio CLP *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 2500"
                placeholderTextColor={Colors.textMuted}
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="numeric"
                returnKeyType="done"
              />

              <View style={styles.availabilityRow}>
                <Text style={styles.label}>Disponible</Text>
                <Switch
                  value={itemAvailable}
                  onValueChange={setItemAvailable}
                  trackColor={{ false: Colors.border, true: Colors.successLight }}
                  thumbColor={itemAvailable ? Colors.success : Colors.textMuted}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeModal} disabled={saving}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnSaveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg:              { flex: 1, backgroundColor: Colors.background },
  overlay:         { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safe:            { flex: 1, backgroundColor: Colors.background },
  safeTransparent: { flex: 1 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noPlaceEmoji:    { fontSize: 56 },
  noPlaceText: {
    fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md,
    textAlign: 'center', padding: Spacing.lg,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTransparent: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  title:      { fontSize: 22, fontWeight: '800', color: Colors.text },
  titleLight: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
  },
  cameraBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  list: { padding: Spacing.md, paddingBottom: 100 },

  emptySection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji:   { fontSize: 56 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyHint:    { fontSize: 14, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center' },

  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, ...Shadow.sm,
  },
  menuItemGlass: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  menuInfo:       { flex: 1 },
  menuName:       { fontSize: 14, fontWeight: '700', color: Colors.text },
  menuDesc:       { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  textLight:      { color: '#fff' },
  textMutedLight: { color: 'rgba(255,255,255,0.75)' },
  unavailable:    { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
  menuActions:    { flexDirection: 'row', alignItems: 'center' },
  menuPrice:      { fontSize: 15, fontWeight: '800', color: Colors.primary },

  deleteAction: {
    backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center',
    width: 80, borderRadius: Radius.md, marginBottom: Spacing.sm,
  },
  deleteActionIcon: { fontSize: 20 },
  deleteActionText: { fontSize: 11, fontWeight: '700', color: '#fff', marginTop: 2 },

  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadow.lg,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: Spacing.xl, maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '800', color: Colors.text,
    marginBottom: Spacing.lg, textAlign: 'center',
  },

  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: 15, color: Colors.text, marginBottom: Spacing.md,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },

  availabilityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },

  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  btnCancel: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  btnCancelText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  btnSave: {
    flex: 2, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.primary,
  },
  btnSaveText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
