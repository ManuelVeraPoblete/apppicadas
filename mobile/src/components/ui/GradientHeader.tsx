import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientHeaderProps {
  children: React.ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({ children, dark = false, style }) => (
  <LinearGradient
    colors={dark ? ['#5A1800', '#8B2500', '#C04A00'] : ['#C04A00', '#E85D04', '#FF7A1A']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.gradient, style]}
  >
    <View style={styles.circle1} />
    <View style={styles.circle2} />
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
