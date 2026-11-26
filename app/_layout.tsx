import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as LocalAuth from 'expo-local-authentication';
import { useAuth } from '../src/store/useAuth';
import { setupNotifications } from '../src/core/notifications';
import { Button, s } from '../src/ui';
import { Text } from 'react-native';

export default function RootLayout() {
  const { session, ready, init } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [bioFailed, setBioFailed] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => { init(); }, []);

  const unlock = async () => {
    const hw = await LocalAuth.hasHardwareAsync();
    const enrolled = await LocalAuth.isEnrolledAsync();
    if (!hw || !enrolled) { setUnlocked(true); return; } // sin biometría: se omite
    const r = await LocalAuth.authenticateAsync({ promptMessage: 'Confirma tu identidad' });
    setUnlocked(r.success); setBioFailed(!r.success);
  };

  useEffect(() => { if (session && !unlocked) unlock(); }, [session]);
  useEffect(() => { if (session && unlocked) setupNotifications(); }, [session, unlocked]);

  useEffect(() => {
    if (!ready) return;
    const inLogin = segments[0] === 'login';
    if (!session && !inLogin) router.replace('/login');
    if (session && unlocked && inLogin) router.replace('/');
  }, [ready, session, unlocked, segments]);

  if (!ready) return <View style={s.center}><ActivityIndicator size="large" /></View>;
  if (session && !unlocked) {
    return (
      <View style={s.center}>
        <Text style={s.title}>🔒 App bloqueada</Text>
        {bioFailed && <Button title="Reintentar" onPress={unlock} />}
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="expense-form" options={{ title: 'Gasto', presentation: 'modal' }} />
    </Stack>
  );
}
