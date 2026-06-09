import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useAuthStore } from '../src/stores';
import { Colors } from '../src/theme';

export default function Index() {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'OWNER') {
    return <Redirect href="/(owner)/(tabs)/my-place" />;
  }

  if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
    return <Redirect href={'/(admin)/(tabs)/reports' as Href} />;
  }

  return <Redirect href="/(user)/(tabs)/explore" />;
}
