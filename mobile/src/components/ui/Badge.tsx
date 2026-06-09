import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.primary,
  bgColor = Colors.secondary,
  style,
}) => (
  <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);

const PRICE_MAP: Record<string, string> = {
  LOW: '$',
  MEDIUM: '$$',
  HIGH: '$$$',
};

export const PriceBadge: React.FC<{ priceRange: string }> = ({ priceRange }) => (
  <Badge
    label={PRICE_MAP[priceRange] ?? priceRange}
    color={Colors.success}
    bgColor={Colors.successLight}
  />
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
