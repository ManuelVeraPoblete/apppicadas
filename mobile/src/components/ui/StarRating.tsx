import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  onPress?: (val: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, max = 5, size = 18, onPress }) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return onPress ? (
          <TouchableOpacity key={i} onPress={() => onPress(i + 1)}>
            <Text style={[styles.star, { fontSize: size, color: filled ? Colors.star : Colors.border }]}>★</Text>
          </TouchableOpacity>
        ) : (
          <Text key={i} style={[styles.star, { fontSize: size, color: filled ? Colors.star : Colors.border }]}>★</Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 2 },
});
