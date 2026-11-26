import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useAuth } from '../src/store/useAuth';
import { Button, Input, colors, s } from '../src/ui';

export default function Login() {
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.screen, { justifyContent: 'center' }]}>
      <Text style={[s.title, { fontSize: 30 }]}>💸 Gastos</Text>
      <Text style={{ color: colors.muted, marginBottom: 20 }}>Inicia sesión para sincronizar tus gastos</Text>
      <Input placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 10 }} />
      <Input placeholder="Contraseña (mín. 8)" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={s.error}>{error}</Text>}
      {info && <Text style={{ color: colors.ok, marginTop: 8 }}>{info}</Text>}
      {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : (
        <>
          <Button title="Entrar" onPress={() => signIn(email, password)} />
          <Button title="Crear cuenta" kind="ghost" onPress={async () => setInfo(await signUp(email, password))} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}
