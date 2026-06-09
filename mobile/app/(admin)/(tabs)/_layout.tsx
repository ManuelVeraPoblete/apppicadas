import { Tabs } from 'expo-router';
import { Colors } from '../../../src/theme';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { borderTopColor: Colors.border },
      }}
    >
      <Tabs.Screen name="reports"    options={{ title: 'Reportes',    tabBarIcon: () => null, tabBarLabel: '🚩 Reportes'    }} />
      <Tabs.Screen name="places"     options={{ title: 'Locales',     tabBarIcon: () => null, tabBarLabel: '📍 Locales'     }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorías',  tabBarIcon: () => null, tabBarLabel: '🏷️ Categorías'  }} />
    </Tabs>
  );
}
