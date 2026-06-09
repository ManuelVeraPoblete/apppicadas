import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/theme';

const TabIcon = ({ emoji }: { emoji: string }) => (
  <Text style={{ fontSize: 20 }}>{emoji}</Text>
);

export default function UserTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom || 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favoritos', tabBarIcon: () => <TabIcon emoji="❤️" /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explorar', tabBarIcon: () => <TabIcon emoji="🔍" /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Mapa', tabBarIcon: () => <TabIcon emoji="🗺️" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}
