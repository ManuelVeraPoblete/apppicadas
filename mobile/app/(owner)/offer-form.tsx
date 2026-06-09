import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Platform, ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ownerApi } from '../../src/api/owner.api';
import { Offer } from '../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../src/theme';

const DISCOUNT_TYPES: { value: Offer['discountType']; label: string; icon: string; color: string }[] = [
  { value: 'PERCENTAGE',  label: '% Porcentaje', icon: '🏷️', color: Colors.primary },
  { value: 'FIXED',       label: '$ Monto fijo',  icon: '💵', color: Colors.success },
  { value: 'TWO_FOR_ONE', label: '2×1',           icon: '🎁', color: '#7B1FA2' },
  { value: 'FREE_ITEM',   label: 'Gratis',        icon: '🎉', color: '#00796B' },
];

const fmt = (d: Date) =>
  d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

export default function OfferFormScreen() {
  const {
    placeId, offerId,
    title: initTitle = '',
    description: initDesc = '',
    discountType: initType = 'PERCENTAGE',
    discountValue: initValue = '',
    validFrom: initFrom,
    validTo: initTo,
  } = useLocalSearchParams<{
    placeId: string; offerId?: string;
    title?: string; description?: string;
    discountType?: string; discountValue?: string;
    validFrom?: string; validTo?: string;
  }>();

  const router = useRouter();
  const isEditing = !!offerId;

  const defaultFrom = initFrom ? new Date(initFrom) : new Date();
  const defaultTo = initTo ? new Date(initTo) : (() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d;
  })();

  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDesc);
  const [discountType, setDiscountType] = useState<Offer['discountType']>(
    (initType as Offer['discountType']) ?? 'PERCENTAGE',
  );
  const [discountValue, setDiscountValue] = useState(initValue);
  const [validFrom, setValidFrom] = useState(defaultFrom);
  const [validTo, setValidTo] = useState(defaultTo);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsValue = discountType === 'PERCENTAGE' || discountType === 'FIXED';

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Ingresa un título para la oferta.');
      return;
    }
    if (validTo <= validFrom) {
      Alert.alert('Fechas inválidas', 'La fecha de término debe ser posterior al inicio.');
      return;
    }
    if (needsValue && discountValue) {
      const numVal = Number(discountValue);
      if (isNaN(numVal) || numVal <= 0) {
        Alert.alert('Valor inválido', 'El valor del descuento debe ser un número positivo.');
        return;
      }
      if (discountType === 'PERCENTAGE' && numVal > 100) {
        Alert.alert('Porcentaje inválido', 'El porcentaje no puede superar 100%.');
        return;
      }
    }
    setSaving(true);
    try {
      const dto = {
        title: title.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue: needsValue && discountValue ? Number(discountValue) : undefined,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
      };
      if (isEditing) {
        await ownerApi.updateOffer(placeId, offerId!, dto);
      } else {
        await ownerApi.createOffer(placeId, dto);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la oferta. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar oferta' : 'Nueva oferta'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. Almuerzo del día con descuento"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Describe la oferta en detalle (opcional)"
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Tipo de descuento</Text>
        <View style={styles.typeGrid}>
          {DISCOUNT_TYPES.map((t) => {
            const active = discountType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typeCard,
                  active && { borderColor: t.color, backgroundColor: t.color + '18' },
                ]}
                onPress={() => setDiscountType(t.value)}
                activeOpacity={0.75}
              >
                <Text style={styles.typeCardIcon}>{t.icon}</Text>
                <Text style={[styles.typeCardLabel, active && { color: t.color, fontWeight: '700' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {needsValue && (
          <>
            <Text style={styles.label}>
              {discountType === 'PERCENTAGE' ? 'Porcentaje (ej. 20 para 20%)' : 'Monto fijo (ej. 5000)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={discountType === 'PERCENTAGE' ? '20' : '5000'}
              placeholderTextColor={Colors.textMuted}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
            />
          </>
        )}

        <Text style={styles.label}>Período de validez</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateFieldLabel}>Desde</Text>
            <TouchableOpacity style={styles.dateTouchable} onPress={() => setShowFromPicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateValue}>{fmt(validFrom)}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateArrow}>→</Text>
          <View style={styles.dateField}>
            <Text style={styles.dateFieldLabel}>Hasta</Text>
            <TouchableOpacity style={styles.dateTouchable} onPress={() => setShowToPicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateValue}>{fmt(validTo)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={validFrom}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowFromPicker(false);
              if (event.type === 'set' && date) setValidFrom(date);
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={validTo}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={validFrom}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowToPicker(false);
              if (event.type === 'set' && date) setValidTo(date);
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>{isEditing ? 'Guardar cambios' : 'Crear oferta'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, padding: 4 },
  backText: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeCard: {
    flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 2, borderColor: Colors.border, ...Shadow.sm,
  },
  typeCardIcon: { fontSize: 24, marginBottom: 4 },
  typeCardLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateField: { flex: 1 },
  dateFieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  dateTouchable: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  dateIcon: { fontSize: 16 },
  dateValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  dateArrow: { fontSize: 18, color: Colors.textMuted, paddingTop: 20 },
  saveBtn: {
    marginTop: Spacing.xl, backgroundColor: Colors.primary,
    borderRadius: Radius.lg, paddingVertical: Spacing.md + 2,
    alignItems: 'center', ...Shadow.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
