import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/theme';

export default function OwnerTabsLayout() {
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
        name="my-place"
        options={{ title: 'Mi Local', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏪</Text> }}
      />
      <Tabs.Screen
        name="menu"
        options={{ title: 'Menú', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🍽️</Text> }}
      />
      <Tabs.Screen
        name="offers"
        options={{ title: 'Ofertas', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏷️</Text> }}
      />
      <Tabs.Screen
        name="reviews"
        options={{ title: 'Reseñas', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
    </Tabs>
  );
}
