import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { listCategories } from '../src/data/categoryRepo';
import { createExpense, getExpense, updateExpense } from '../src/data/expenseRepo';
import { firstError } from '../src/core/validators';
import { Category } from '../src/data/types';
import { Button, Chip, Input, s } from '../src/ui';
import { View } from 'react-native';

export default function ExpenseForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString());
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setCats(await listCategories());
      if (id) {
        const e = await getExpense(id);
        if (e) { setCategoryId(e.category_id); setAmount(String(e.amount)); setDescription(e.description ?? ''); setReceipt(e.receipt_path); setDate(e.date); }
      }
    })();
  }, [id]);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso denegado', 'Activa la cámara en Ajustes.');
    const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (r.canceled) return;
    const dest = `${FileSystem.documentDirectory}receipt_${Date.now()}.jpg`; // directorio privado de la app
    await FileSystem.copyAsync({ from: r.assets[0].uri, to: dest });
    setReceipt(dest);
  };

  const save = async () => {
    setSaving(true); setError(undefined);
    try {
      const input = { amount, description, categoryId, date };
      if (id) await updateExpense(id, input, receipt); else await createExpense(input, receipt);
      router.back();
    } catch (e) { setError(firstError(e)); }
    setSaving(false);
  };

  return (
    <ScrollView style={s.screen}>
      <Text style={s.label}>Monto</Text>
      <Input placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <Text style={s.label}>Descripción</Text>
      <Input placeholder="Ej. Tacos" maxLength={100} value={description} onChangeText={setDescription} />
      <Text style={s.label}>Categoría</Text>
      <View style={s.wrap}>
        {cats.map(c => <Chip key={c.id} label={`${c.icon ?? ''} ${c.name}`} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />)}
      </View>
      <Text style={s.label}>Ticket</Text>
      {receipt && <Image source={{ uri: receipt }} style={{ width: '100%', height: 180, borderRadius: 10 }} resizeMode="cover" />}
      <Button title={receipt ? 'Volver a tomar foto' : '📷 Fotografiar ticket'} kind="ghost" onPress={takePhoto} />
      {error && <Text style={s.error}>{error}</Text>}
      <Button title={saving ? 'Guardando…' : 'Guardar'} onPress={save} disabled={saving} />
    </ScrollView>
  );
}
