import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { placesApi, categoriesApi } from '../../../src/api';
import { Place, Category } from '../../../src/types';
import { Button, Input, GradientHeader } from '../../../src/components/ui';
import { Colors, Spacing, Radius } from '../../../src/theme';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  address: z.string().min(3, 'Requerido'),
  city: z.string().min(2, 'Requerido'),
  latitude: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90, 'Busca la ubicación primero'),
  longitude: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180, 'Busca la ubicación primero'),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  priceRange: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  categoryId: z.string().uuid('Selecciona una categoría'),
});

type FormData = z.infer<typeof schema>;

const PRICE_OPTIONS = [
  { value: 'LOW', label: '$ Económico' },
  { value: 'MEDIUM', label: '$$ Moderado' },
  { value: 'HIGH', label: '$$$ Premium' },
];

interface PendingCoords {
  latitude: number;
  longitude: number;
}

export default function MyPlaceScreen() {
  const [place, setPlace] = useState<Place | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<PendingCoords | null>(null);
  const [markerCoords, setMarkerCoords] = useState<PendingCoords | null>(null);

  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priceRange: 'LOW' },
  });

  const latValue = watch('latitude');
  const lngValue = watch('longitude');
  const hasCoords = latValue && lngValue && !isNaN(Number(latValue)) && !isNaN(Number(lngValue));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, cats] = await Promise.all([placesApi.getMyPlace(), categoriesApi.getAll()]);
      setPlace(p);
      setCategories(cats);
      if (p) {
        reset({
          name: p.name,
          description: p.description ?? '',
          address: p.address,
          city: p.city,
          latitude: String(p.latitude),
          longitude: String(p.longitude),
          phone: p.phone ?? '',
          website: p.website ?? '',
          instagram: p.instagram ?? '',
          priceRange: p.priceRange,
          categoryId: p.categoryId,
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar tu local');
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async () => {
    const address = getValues('address');
    const city = getValues('city');
    if (!address || address.length < 3) {
      Alert.alert('Falta la dirección', 'Ingresa la dirección del local primero.');
      return;
    }
    if (!city || city.length < 2) {
      Alert.alert('Falta la ciudad', 'Ingresa la ciudad del local primero.');
      return;
    }
    setGeocoding(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación para buscar la dirección.');
        return;
      }
      const results = await Location.geocodeAsync(`${address}, ${city}`);
      if (!results || results.length === 0) {
        Alert.alert('No encontrada', 'No se pudo encontrar esa dirección. Intenta ser más específico.');
        return;
      }
      const coords = { latitude: results[0].latitude, longitude: results[0].longitude };
      setPendingCoords(coords);
      setMarkerCoords(coords);
      setMapVisible(true);
    } catch {
      Alert.alert('Error', 'Ocurrió un error al buscar la dirección. Verifica tu conexión.');
    } finally {
      setGeocoding(false);
    }
  };

  const confirmLocation = () => {
    if (!markerCoords) return;
    setValue('latitude', String(markerCoords.latitude), { shouldValidate: true });
    setValue('longitude', String(markerCoords.longitude), { shouldValidate: true });
    setMapVisible(false);
  };

  const cancelLocation = () => {
    setMapVisible(false);
    setPendingCoords(null);
    setMarkerCoords(null);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const payload = { ...data, latitude: Number(data.latitude), longitude: Number(data.longitude) };
    try {
      if (place) {
        const updated = await placesApi.update(place.id, payload);
        setPlace(updated);
      } else {
        const created = await placesApi.create(payload);
        setPlace(created);
      }
      Alert.alert('¡Listo!', 'Cambios guardados correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const mapRegion: Region | undefined = pendingCoords
    ? { ...pendingCoords, latitudeDelta: 0.005, longitudeDelta: 0.005 }
    : undefined;

  return (
    <SafeAreaView style={styles.safe}>
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

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Nombre del local" placeholder="La Picada de Juan" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => (
              <View style={styles.textAreaWrapper}>
                <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Cuéntanos sobre tu local..."
                  placeholderTextColor={Colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Dirección" placeholder="Av. Principal 123" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.address?.message} />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Ciudad" placeholder="Santiago" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.city?.message} />
            )}
          />

          <TouchableOpacity
            style={[styles.geoBtn, geocoding && styles.geoBtnDisabled]}
            onPress={geocodeAddress}
            disabled={geocoding}
            activeOpacity={0.8}
          >
            {geocoding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.geoBtnText}>📍 {hasCoords ? 'Cambiar ubicación' : 'Buscar ubicación en el mapa'}</Text>
            )}
          </TouchableOpacity>

          {(errors.latitude || errors.longitude) && !hasCoords && (
            <Text style={styles.fieldError}>Debes buscar la ubicación antes de guardar</Text>
          )}

          {hasCoords && (
            <View style={styles.coordsBox}>
              <Text style={styles.coordsLabel}>✓ Ubicación confirmada</Text>
              <Text style={styles.coordsText}>
                {Number(latValue).toFixed(6)}, {Number(lngValue).toFixed(6)}
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Teléfono (opcional)" placeholder="+56 9 1234 5678" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" />
            )}
          />

          <Controller
            control={control}
            name="website"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Sitio web (opcional)" placeholder="https://mipicada.cl" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="url" autoCapitalize="none" />
            )}
          />

          <Controller
            control={control}
            name="instagram"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label="Instagram (sin @)" placeholder="mi_picada" value={value} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          <Text style={styles.fieldLabel}>Rango de precio</Text>
          <Controller
            control={control}
            name="priceRange"
            render={({ field: { value, onChange } }) => (
              <View style={styles.priceRow}>
                {PRICE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.priceChip, value === opt.value && styles.priceChipActive]}
                    onPress={() => onChange(opt.value)}
                  >
                    <Text style={[styles.priceChipText, value === opt.value && styles.priceChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.priceRange && <Text style={styles.fieldError}>{errors.priceRange.message}</Text>}

          <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Categoría</Text>
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { value, onChange } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, value === cat.id && styles.catChipActive]}
                    onPress={() => onChange(cat.id)}
                  >
                    <Text style={[styles.catText, value === cat.id && styles.catTextActive]}>{cat.emoji} {cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          />
          {errors.categoryId && <Text style={styles.fieldError}>{errors.categoryId.message}</Text>}

          <Button label={saving ? 'Guardando...' : (place ? 'Guardar cambios' : 'Crear local')} onPress={handleSubmit(onSubmit)} loading={saving} style={styles.saveBtn} />
        </View>
      </ScrollView>

      <Modal visible={mapVisible} animationType="slide" onRequestClose={cancelLocation}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirmar ubicación</Text>
            <Text style={styles.modalSubtitle}>Arrastra el marcador para ajustar la posición exacta</Text>
          </View>

          {mapRegion && (
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker
                coordinate={markerCoords!}
                draggable
                onDragEnd={(e) => setMarkerCoords(e.nativeEvent.coordinate)}
                pinColor={Colors.primary}
              />
            </MapView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelLocation}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation}>
              <Text style={styles.confirmBtnText}>✓ Confirmar ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.warmBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerStats: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  headerStat: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.lg, margin: Spacing.lg },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: Spacing.xs },
  textAreaWrapper: { marginBottom: Spacing.md },
  textArea: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: 14, color: Colors.text, minHeight: 80, textAlignVertical: 'top',
  },
  geoBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  geoBtnDisabled: { opacity: 0.6 },
  geoBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  coordsBox: {
    backgroundColor: '#F0FFF4',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  coordsLabel: { fontSize: 12, fontWeight: '700', color: Colors.success, marginBottom: 2 },
  coordsText: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'monospace' },
  priceRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  priceChip: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  priceChipActive: { borderColor: Colors.primary, backgroundColor: Colors.secondary },
  priceChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  priceChipTextActive: { color: Colors.primary },
  catScroll: { marginBottom: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  catChipActive: { borderColor: Colors.primary, backgroundColor: Colors.secondary },
  catText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  catTextActive: { color: Colors.primary },
  fieldError: { fontSize: 12, color: Colors.error, marginBottom: Spacing.sm },
  saveBtn: { marginTop: Spacing.lg },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  map: { flex: 1 },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
