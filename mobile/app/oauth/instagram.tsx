import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function InstagramOAuthCallback() {
  const { status } = useLocalSearchParams<{ status: string }>();
  const router = useRouter();

  useEffect(() => {
    if (status === 'success') {
      Alert.alert('Instagram conectado', '¡Tu cuenta fue vinculada exitosamente!');
    } else {
      Alert.alert('Error', 'No se pudo conectar Instagram. Intentá de nuevo.');
    }
    router.replace('/(owner)/(tabs)/profile');
  }, []);

  return null;
}
