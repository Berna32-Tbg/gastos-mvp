import React from 'react';
import { Pressable, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

export const colors = { bg: '#F6F7FB', card: '#FFFFFF', primary: '#4F46E5', text: '#111827', muted: '#6B7280', danger: '#DC2626', ok: '#16A34A', warn: '#F59E0B' };

export function Button({ title, onPress, kind = 'primary', disabled, style }:
  { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; style?: ViewStyle }) {
  const bg = kind === 'primary' ? colors.primary : kind === 'danger' ? colors.danger : 'transparent';
  const fg = kind === 'ghost' ? colors.primary : '#fff';
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}>
      <Text style={{ color: fg, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[s.input, props.style]} />;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.primary }]}>
      <Text style={{ color: active ? '#fff' : colors.text }}>{label}</Text>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  label: { color: colors.muted, marginBottom: 6, marginTop: 10, fontSize: 13 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', color: colors.text },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: colors.danger, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
