import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { adminApi } from '../../../src/api/admin.api';
import { Category } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';
import { GradientHeader } from '../../../src/components/ui';

const EMPTY_FORM = { name: '', slug: '', emoji: '' };

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [catName,  setCatName]  = useState('');
  const [catSlug,  setCatSlug]  = useState('');
  const [catEmoji, setCatEmoji] = useState('');

  const loadCategories = useCallback(() => {
    setLoading(true);
    adminApi.getAllCategories()
      .then(setCategories)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las categorías'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadCategories);

  const openCreate = () => {
    setCatName(EMPTY_FORM.name);
    setCatSlug(EMPTY_FORM.slug);
    setCatEmoji(EMPTY_FORM.emoji);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const name = catName.trim();
    const slug = catSlug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!name) {
      Alert.alert('Campo requerido', 'El nombre de la categoría es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createCategory({ name, slug, emoji: catEmoji.trim() || undefined });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'No se pudo crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (cat: Category & { isActive?: boolean }) => {
    const isActive = cat.isActive !== false;
    Alert.alert(
      isActive ? 'Desactivar categoría' : 'Activar categoría',
      `¿${isActive ? 'Desactivar' : 'Activar'} "${cat.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isActive ? 'Desactivar' : 'Activar',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            setToggling(cat.id);
            try {
              const updated = isActive
                ? await adminApi.deactivateCategory(cat.id)
                : await adminApi.activateCategory(cat.id);
              setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c));
            } catch {
              Alert.alert('Error', 'No se pudo actualizar la categoría');
            } finally {
              setToggling(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GradientHeader dark>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🏷️ Categorías</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>＋ Nueva</Text>
          </TouchableOpacity>
        </View>
      </GradientHeader>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cat = item as Category & { isActive?: boolean };
          const isActive = cat.isActive !== false;
          const isToggling = toggling === cat.id;
          return (
            <View style={[styles.card, !isActive && styles.cardInactive]}>
              <Text style={styles.catEmoji}>{cat.emoji ?? '📂'}</Text>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catStatus}>{isActive ? 'Activa' : 'Inactiva'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, isActive ? styles.toggleBtnDeactivate : styles.toggleBtnActivate]}
                onPress={() => handleToggle(cat)}
                disabled={isToggling}
              >
                {isToggling
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.toggleBtnText}>{isActive ? 'Desactivar' : 'Activar'}</Text>}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋ Nueva categoría</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Nueva categoría</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Sandwiches"
                placeholderTextColor={Colors.textMuted}
                value={catName}
                onChangeText={(v) => {
                  setCatName(v);
                  setCatSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }}
              />
              <Text style={styles.label}>Slug (auto-generado)</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. sandwiches"
                placeholderTextColor={Colors.textMuted}
                value={catSlug}
                onChangeText={setCatSlug}
                autoCapitalize="none"
              />
              <Text style={styles.label}>Emoji (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 🥪"
                placeholderTextColor={Colors.textMuted}
                value={catEmoji}
                onChangeText={setCatEmoji}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnSaveText}>Crear</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.warmBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  list: { padding: Spacing.md, paddingBottom: 100 },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', ...Shadow.sm,
  },
  cardInactive: { opacity: 0.5 },
  catEmoji: { fontSize: 28, marginRight: Spacing.md },
  catInfo:  { flex: 1 },
  catName:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  catStatus:{ fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  toggleBtn: {
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    minWidth: 90, alignItems: 'center',
  },
  toggleBtnDeactivate: { backgroundColor: Colors.error },
  toggleBtnActivate:   { backgroundColor: Colors.success },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, ...Shadow.lg,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: Spacing.xl, maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '800', color: Colors.text,
    marginBottom: Spacing.lg, textAlign: 'center',
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: 15, color: Colors.text, marginBottom: Spacing.sm,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
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
