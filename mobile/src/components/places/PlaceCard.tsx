import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { NearbyPlace, Place } from '../../types';
import { StarRating } from '../ui/StarRating';
import { PriceBadge } from '../ui/Badge';
import { Colors, Spacing, Radius, Shadow } from '../../theme';

interface PlaceCardProps {
  place: Place | NearbyPlace;
  showDistance?: boolean;
}

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, showDistance = false }) => {
  const router = useRouter();
  const distanceMeters = (place as NearbyPlace).distanceMeters;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/place/${place.id}`)}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.imagePlaceholder}
          resizeMode="cover"
          accessibilityLabel={place.name}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.emoji}>🍽️</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          {place.isVerified && <Text style={styles.verified}>✓</Text>}
        </View>

        <Text style={styles.address} numberOfLines={1}>{place.address}</Text>

        <View style={styles.meta}>
          <StarRating value={place.ratingAverage} size={13} />
          <Text style={styles.reviewCount}>({place.reviewCount})</Text>
          <PriceBadge priceRange={place.priceRange} />
          {showDistance && distanceMeters != null && (
            <Text style={styles.distance}>{formatDistance(distanceMeters)}</Text>
          )}
        </View>
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
    ...Shadow.sm,
  },
  imagePlaceholder: {
    width: 90,
    backgroundColor: Colors.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32 },
  content: { flex: 1, padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  verified: { fontSize: 13, color: Colors.success },
  address: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
  reviewCount: { fontSize: 12, color: Colors.textMuted },
  distance: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
