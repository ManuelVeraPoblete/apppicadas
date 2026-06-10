import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput, Image, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { placesApi } from '../../src/api/places.api';
import { reviewsApi } from '../../src/api/reviews.api';
import { Place, Review, MenuItem, BusinessHour, Offer } from '../../src/types';
import { StarRating } from '../../src/components/ui/StarRating';
import { Button } from '../../src/components/ui/Button';
import { useFavoritesStore, useAuthStore } from '../../src/stores';
import { Colors, Spacing, Radius, Shadow } from '../../src/theme';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const VALID_TABS = ['info', 'menu', 'reviews', 'offers'] as const;
type TabKey = typeof VALID_TABS[number];

export default function PlaceDetailScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(
    VALID_TABS.includes(tab as TabKey) ? (tab as TabKey) : 'info',
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuImageFull, setMenuImageFull] = useState(false);

  useEffect(() => {
    if (id) loadAll(id);
  }, [id]);

  const loadAll = async (placeId: string) => {
    setLoading(true);
    try {
      const [p, r, m, h, o] = await Promise.all([
        placesApi.getById(placeId),
        reviewsApi.getByPlace(placeId),
        placesApi.getMenu(placeId),
        placesApi.getHours(placeId),
        placesApi.getOffers(placeId),
      ]);
      setPlace(p);
      setReviews(r);
      setMenu(m);
      setHours(h);
      setOffers(o);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el local');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!place) return;
    if (isFavorite(place.id)) {
      await removeFavorite(place.id);
    } else {
      await addFavorite(place.id);
    }
  };

  const submitReview = async () => {
    if (!place || !user) return;
    setSubmitting(true);
    try {
      const review = await reviewsApi.create(place.id, { rating: reviewRating, comment: reviewComment || undefined });
      setReviews((prev) => [review, ...prev]);
      setReviewComment('');
      setReviewRating(5);
    } catch {
      Alert.alert('Error', 'No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
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

  if (!place) return null;

  const fav = isFavorite(place.id);
  const TAB_LABELS: Record<TabKey, string> = { info: 'Info', menu: '🍽 Menú', reviews: '⭐ Reseñas', offers: '🏷 Ofertas' };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Compact orange header */}
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

      <View style={styles.tabBar}>
        {VALID_TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{TAB_LABELS[t]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'info' && (
          <View>
            {place.description && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sobre el local</Text>
                <Text style={styles.desc}>{place.description}</Text>
              </View>
            )}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Horarios</Text>
              {hours.length === 0 ? (
                <Text style={styles.empty}>Sin horarios registrados</Text>
              ) : (
                hours.map((h) => (
                  <View key={h.id} style={styles.hourRow}>
                    <Text style={styles.dayName}>{DAY_NAMES[h.dayOfWeek]}</Text>
                    <Text style={styles.hourText}>
                      {h.isClosed ? 'Cerrado' : `${h.openTime} – ${h.closeTime}`}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'menu' && (
          <View>
            {place.menuImageUrl ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => setMenuImageFull(true)}>
                <Image
                  source={{ uri: place.menuImageUrl }}
                  style={styles.menuImage}
                  resizeMode="contain"
                />
                <Text style={styles.menuImageHint}>Toca para ver completa</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>Sin menú publicado</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View>
            {user && user.role !== 'OWNER' && (() => {
              const alreadyReviewed = reviews.some((r) => r.userId === user.id);
              if (alreadyReviewed) {
                return (
                  <View style={[styles.card, styles.alreadyReviewedCard]}>
                    <Text style={styles.alreadyReviewedText}>✅ Ya dejaste tu reseña en este local</Text>
                  </View>
                );
              }
              return (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Deja tu reseña</Text>
                  <StarRating value={reviewRating} size={28} onPress={setReviewRating} />
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="¿Qué te pareció? (opcional)"
                    placeholderTextColor={Colors.textMuted}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    multiline
                    numberOfLines={3}
                  />
                  <Button label="Publicar reseña" onPress={submitReview} loading={submitting} size="sm" />
                </View>
              );
            })()}

            {reviews.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>Sin reseñas aún</Text>
              </View>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{r.userName?.[0]?.toUpperCase() ?? '?'}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewName}>{r.userName ?? 'Usuario'}</Text>
                      <StarRating value={r.rating} size={13} />
                    </View>
                    <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                  </View>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                  {r.reply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Respuesta del dueño:</Text>
                      <Text style={styles.replyText}>{r.reply.comment}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'offers' && (
          <View>
            {offers.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyEmoji}>🏷️</Text>
                <Text style={styles.emptyTitle}>Sin ofertas activas</Text>
              </View>
            ) : (
              offers.map((o) => (
                <View key={o.id} style={[styles.card, styles.offerCard]}>
                  <Text style={styles.offerTitle}>{o.title}</Text>
                  {o.description && <Text style={styles.offerDesc}>{o.description}</Text>}
                  <Text style={styles.offerValid}>Válida hasta {new Date(o.validTo).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={menuImageFull} animationType="fade" onRequestClose={() => setMenuImageFull(false)}>
        <View style={styles.fullscreen}>
          <Image source={{ uri: place.menuImageUrl! }} style={styles.fullscreenImg} resizeMode="contain" />
          <TouchableOpacity style={styles.fullscreenClose} onPress={() => setMenuImageFull(false)}>
            <Text style={styles.fullscreenCloseText}>✕ Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.warmBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  content: { padding: Spacing.md, paddingBottom: 40, backgroundColor: Colors.warmBackground },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  desc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  dayName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  hourText: { fontSize: 14, color: Colors.textSecondary },
  empty: { fontSize: 14, color: Colors.textMuted },
  alreadyReviewedCard: { backgroundColor: Colors.successLight },
  alreadyReviewedText: { fontSize: 14, color: Colors.success, fontWeight: '600', textAlign: 'center' },
  reviewInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, marginVertical: Spacing.md, fontSize: 14,
    color: Colors.text, minHeight: 80, textAlignVertical: 'top',
  },
  reviewCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: Colors.textInverse, fontWeight: '700' },
  reviewName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  reviewDate: { marginLeft: 'auto', fontSize: 11, color: Colors.textMuted },
  reviewComment: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  replyBox: {
    marginTop: Spacing.sm, padding: Spacing.sm,
    backgroundColor: Colors.secondary, borderRadius: Radius.md, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  replyLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  replyText: { fontSize: 13, color: Colors.textSecondary },
  offerCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  offerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  offerDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  offerValid: { fontSize: 11, color: Colors.textMuted, marginTop: Spacing.xs },
  emptySection: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md },
  menuImage: { width: '100%', height: 480, borderRadius: Radius.md },
  menuImageHint: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginTop: Spacing.xs },
  fullscreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  fullscreenImg: { width: '100%', flex: 1 },
  fullscreenClose: {
    position: 'absolute', top: 48, right: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: Spacing.md,
    paddingVertical: 8, borderRadius: Radius.full,
  },
  fullscreenCloseText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
