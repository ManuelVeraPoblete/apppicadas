import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { NearbyPlace, Place } from '../../types';
import { StarRating } from '../ui/StarRating';
import { Colors, Spacing, Radius, Shadow } from '../../theme';

interface PlaceCardProps {
  place: Place | NearbyPlace;
  showDistance?: boolean;
}

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const PRICE_LABELS: Record<string, string> = { LOW: '$', MEDIUM: '$$', HIGH: '$$$' };

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, showDistance = false }) => {
  const router = useRouter();
  const distanceMeters = (place as NearbyPlace).distanceMeters;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/place/${place.id}`)}
    >
      <View style={styles.imageContainer}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            accessibilityLabel={place.name}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.emoji}>🍽️</Text>
          </View>
        )}
        {showDistance && distanceMeters != null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{formatDistance(distanceMeters)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          {place.priceRange && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{PRICE_LABELS[place.priceRange]}</Text>
            </View>
          )}
        </View>

        <Text style={styles.address} numberOfLines={1}>{place.address}</Text>

        <View style={styles.metaRow}>
          <StarRating value={place.ratingAverage} size={12} />
          <Text style={styles.reviewCount}>({place.reviewCount})</Text>
        </View>

        {place.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verificado</Text>
          </View>
        )}
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
    ...Shadow.md,
  },
  imageContainer: {
    width: 88,
    minHeight: 90,
    backgroundColor: '#E85D04',
    overflow: 'hidden',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB347',
    minHeight: 90,
    overflow: 'hidden',
  },
  emoji: { fontSize: 32 },
  distanceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  priceBadge: {
    backgroundColor: Colors.warningLight,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  priceText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  address: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewCount: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  verifiedBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.successLight,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.success,
  },
});
