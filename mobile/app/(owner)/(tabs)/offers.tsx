import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useRef } from 'react';
import {
  View, Text, SectionList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/core';
import { useRouter } from 'expo-router';
import { placesApi } from '../../../src/api/places.api';
import { ownerApi } from '../../../src/api/owner.api';
import { Place, Offer } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';

// ─── helpers ────────────────────────────────────────────────────────────────

const DISCOUNT_CONFIG: Record<Offer['discountType'], { icon: string; color: string; format: (v?: number) => string }> = {
  PERCENTAGE:  { icon: '🏷️', color: Colors.primary, format: (v) => v ? `${v}% OFF`             : '% OFF'  },
  FIXED:       { icon: '💵', color: Colors.success,  format: (v) => v ? `$${v.toLocaleString('es-CL')}` : '$ Fijo' },
  TWO_FOR_ONE: { icon: '🎁', color: '#7B1FA2',       format: () => '2×1'                                          },
  FREE_ITEM:   { icon: '🎉', color: '#00796B',       format: () => 'GRATIS'                                       },
};

function categorize(offers: Offer[]) {
  const now = new Date();
  const active: Offer[]   = [];
  const upcoming: Offer[] = [];
  const expired: Offer[]  = [];

  for (const o of offers) {
    const from = new Date(o.validFrom);
    const to   = new Date(o.validTo);
    if (!o.isActive || to < now) {
      expired.push(o);
    } else if (from > now) {
      upcoming.push(o);
    } else {
      active.push(o);
    }
  }
  return [
    { title: 'Activas',  statusColor: Colors.success,  data: active   },
    { title: 'Próximas', statusColor: Colors.primary,  data: upcoming },
    { title: 'Vencidas', statusColor: Colors.textMuted, data: expired  },
  ].filter((s) => s.data.length > 0);
}

function daysLabel(offer: Offer): string {
  const now = Date.now();
  const to  = new Date(offer.validTo).getTime();
  const diff = Math.ceil((to - now) / 86_400_000);
  if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? 's' : ''}`;
  if (diff === 0) return 'Vence hoy';
  return `${diff} día${diff !== 1 ? 's' : ''} restante${diff !== 1 ? 's' : ''}`;
}

function formatDateRange(from: string, to: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${new Date(from).toLocaleDateString('es-CL', opts)} – ${new Date(to).toLocaleDateString('es-CL', opts)}`;
}

// ─── component ──────────────────────────────────────────────────────────────

export default function OwnerOffersScreen() {
  const router = useRouter();
  const [place, setPlace]   = React.useState<Place | null>(null);
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  const loadData = useCallback(() => {
    setLoading(true);
    placesApi.getMyPlace()
      .then(async (p) => {
        setPlace(p);
        if (p) setOffers(await ownerApi.getOffers(p.id));
      })
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las ofertas'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadData);

  const openForm = (offer?: Offer) => {
    if (!place) return;
    router.push({
      pathname: '/(owner)/offer-form',
      params: {
        placeId: place.id,
        ...(offer && {
          offerId:       offer.id,
          title:         offer.title,
          description:   offer.description ?? '',
          discountType:  offer.discountType,
          discountValue: offer.discountValue != null ? String(offer.discountValue) : '',
          validFrom:     offer.validFrom,
          validTo:       offer.validTo,
        }),
      },
    });
  };

  const handleDelete = (offer: Offer) => {
    swipeableRefs.current[offer.id]?.close();
    Alert.alert(
      'Eliminar oferta',
      `¿Eliminar "${offer.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            if (!place) return;
            try {
              await ownerApi.deleteOffer(place.id, offer.id);
              setOffers((prev) => prev.filter((o) => o.id !== offer.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la oferta.');
            }
          },
        },
      ],
    );
  };

  const renderDeleteAction = (offer: Offer) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(offer)}>
      <Text style={styles.deleteActionIcon}>🗑️</Text>
      <Text style={styles.deleteActionText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Offer }) => {
    const cfg    = DISCOUNT_CONFIG[item.discountType];
    const isOver = new Date(item.validTo) < new Date();
    return (
      <Swipeable
        ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
        renderRightActions={() => renderDeleteAction(item)}
        overshootRight={false}
      >
        <View style={[styles.card, { borderLeftColor: cfg.color }, isOver && styles.cardExpired]}>
          <View style={styles.cardBody}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <Text style={styles.cardDateRange}>{formatDateRange(item.validFrom, item.validTo)}</Text>
              <Text style={[styles.cardDays, isOver && { color: Colors.error }]}>
                {daysLabel(item)}
              </Text>
            </View>

            <View style={styles.cardRight}>
              <View style={[styles.badge, { backgroundColor: cfg.color }]}>
                <Text style={styles.badgeIcon}>{cfg.icon}</Text>
                <Text style={styles.badgeText}>{cfg.format(item.discountValue)}</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => openForm(item)}>
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string; statusColor: string; data: Offer[] } }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: section.statusColor }]} />
      <Text style={[styles.sectionTitle, { color: section.statusColor }]}>{section.title.toUpperCase()}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
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
          <Text style={styles.emptyEmoji}>🏪</Text>
          <Text style={styles.emptyText}>Primero crea tu local en "Mi Local"</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sections = categorize(offers);
  const now = new Date();
  const activeCount = offers.filter((o) =>
    o.isActive && new Date(o.validTo) >= now && new Date(o.validFrom) <= now,
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏷️ Ofertas</Text>
        <Text style={styles.headerSub}>{activeCount} activa{activeCount !== 1 ? 's' : ''} · {offers.length} en total</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptySection}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={styles.emptyTitle}>Sin ofertas aún</Text>
            <Text style={styles.emptyHint}>Crea una oferta para atraer más clientes</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => openForm()} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋ Nueva oferta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    padding: Spacing.lg, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub:   { fontSize: 13, color: Colors.textMuted },

  list: { padding: Spacing.md, paddingBottom: 100 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginTop: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: 2,
  },
  sectionDot:   { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sectionCount: {
    marginLeft: 4, fontSize: 11, fontWeight: '700',
    color: Colors.textInverse, backgroundColor: Colors.textMuted,
    borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden',
  },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderLeftWidth: 4, marginBottom: Spacing.sm, ...Shadow.sm, overflow: 'hidden',
  },
  cardExpired: { opacity: 0.6 },
  cardBody: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  cardLeft: { flex: 1 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardDesc:      { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  cardDateRange: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  cardDays:      { fontSize: 12, fontWeight: '600', color: Colors.success, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.sm },
  badge: {
    alignItems: 'center', borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, minWidth: 70,
  },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#fff', marginTop: 1 },
  editBtn: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

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

  emptySection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyHint:  { fontSize: 14, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
  emptyText:  { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md, textAlign: 'center', padding: Spacing.lg },
});
