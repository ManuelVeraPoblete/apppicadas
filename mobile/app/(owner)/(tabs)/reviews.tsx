import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal
} from 'react-native';
import { placesApi } from '../../../src/api/places.api';
import { reviewsApi } from '../../../src/api/reviews.api';
import { Place, Review } from '../../../src/types';
import { StarRating, Button, GradientHeader } from '../../../src/components/ui';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

export default function OwnerReviewsScreen() {
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await placesApi.getMyPlace();
      setPlace(p);
      if (p) {
        const r = await reviewsApi.getByPlace(p.id);
        setReviews(r);
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const openReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply?.comment ?? '');
    setReplyModal(true);
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    setSubmitting(true);
    try {
      if (selectedReview.reply) {
        await reviewsApi.updateReply(selectedReview.id, replyText);
      } else {
        await reviewsApi.reply(selectedReview.id, replyText);
      }
      setReviews((prev) => prev.map((r) => r.id === selectedReview.id
        ? { ...r, reply: { id: r.reply?.id ?? '', reviewId: r.id, ownerId: '', comment: replyText, createdAt: new Date().toISOString() } }
        : r
      ));
      setReplyModal(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View></SafeAreaView>;

  if (!place) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}><Text style={styles.noPlaceEmoji}>🏪</Text><Text style={styles.noPlaceText}>Primero crea tu local</Text></View>
    </SafeAreaView>
  );

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <GradientHeader>
        <Text style={styles.headerTitle}>💬 Reseñas</Text>
        <View style={styles.headerSummary}>
          <Text style={styles.headerStat}>⭐ {avgRating}</Text>
          <Text style={styles.headerStat}>{reviews.length} reseñas</Text>
        </View>
      </GradientHeader>

      <FlatList
        data={reviews}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userName?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewer}>{item.userName ?? 'Usuario'}</Text>
                <StarRating value={item.rating} size={13} />
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.comment && <Text style={styles.comment}>{item.comment}</Text>}

            {item.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyLabel}>Tu respuesta:</Text>
                <Text style={styles.replyText}>{item.reply.comment}</Text>
                <TouchableOpacity onPress={() => openReply(item)}>
                  <Text style={styles.editReply}>Editar respuesta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.replyBtn} onPress={() => openReply(item)}>
                <Text style={styles.replyBtnText}>💬 Responder</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>Aún no tienes reseñas</Text>
          </View>
        }
      />

      <Modal visible={replyModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selectedReview?.reply ? 'Editar respuesta' : 'Responder reseña'}</Text>
            {selectedReview?.comment && (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{selectedReview.comment}"</Text>
              </View>
            )}
            <TextInput
              style={styles.replyInput}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor={Colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Button label="Cancelar" onPress={() => setReplyModal(false)} variant="outline" size="sm" style={{ flex: 1 }} />
              <Button label="Publicar" onPress={handleReply} loading={submitting} size="sm" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.warmBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerSummary: { flexDirection: 'row', gap: Spacing.md },
  headerStat: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 40 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.textInverse, fontWeight: '700' },
  reviewer: { fontSize: 13, fontWeight: '600', color: Colors.text },
  date: { fontSize: 11, color: Colors.textMuted },
  comment: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  replyBox: { marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.secondary, borderRadius: Radius.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  replyLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  replyText: { fontSize: 13, color: Colors.textSecondary },
  editReply: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  replyBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary },
  replyBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: Spacing.md },
  noPlaceEmoji: { fontSize: 56 },
  noPlaceText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  quoteBox: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  quoteText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  replyInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 14, color: Colors.text, minHeight: 100, textAlignVertical: 'top', marginBottom: Spacing.md },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
});
