import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createBudget, deleteBudget, listBudgets } from '../../src/data/budgetRepo';
import { listCategories } from '../../src/data/categoryRepo';
import { Category } from '../../src/data/types';
import { firstError } from '../../src/core/validators';
import { money } from '../../src/core/format';
import { Button, Chip, Input, colors, s } from '../../src/ui';

export default function Budgets() {
  const [list, setList] = useState<Awaited<ReturnType<typeof listBudgets>>>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [error, setError] = useState<string>();

  const load = async () => { setList(await listBudgets()); setCats(await listCategories()); };
  useFocusEffect(useCallback(() => { load(); }, []));

  const add = async () => {
    setError(undefined);
    try { await createBudget({ amount, categoryId, period }); setAmount(''); await load(); }
    catch (e) { setError(firstError(e)); }
  };

  return (
    <View style={s.screen}>
      <Text style={s.title}>Presupuestos</Text>
      <View style={s.card}>
        <View style={s.wrap}>
          {cats.map(c => <Chip key={c.id} label={`${c.icon ?? ''} ${c.name}`} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />)}
        </View>
        <Input placeholder="Monto" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        <View style={[s.wrap, { marginTop: 10 }]}>
          <Chip label="Semanal" active={period === 'weekly'} onPress={() => setPeriod('weekly')} />
          <Chip label="Mensual" active={period === 'monthly'} onPress={() => setPeriod('monthly')} />
        </View>
        {error && <Text style={s.error}>{error}</Text>}
        <Button title="Agregar presupuesto" onPress={add} />
      </View>
      <FlatList data={list} keyExtractor={b => b.id}
        renderItem={({ item }) => {
          const pct = Math.min(item.spent / item.amount, 1);
          const color = pct >= 1 ? colors.danger : pct >= 0.8 ? colors.warn : colors.ok;
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={{ fontWeight: '600' }}>{item.icon} {item.name} · {item.period === 'weekly' ? 'semanal' : 'mensual'}</Text>
                <Text onPress={() => Alert.alert('Eliminar', '¿Eliminar presupuesto?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteBudget(item.id); load(); } }])}>🗑️</Text>
              </View>
              <Text style={{ color: colors.muted, marginVertical: 4 }}>{money(item.spent)} de {money(item.amount)}</Text>
              <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                <View style={{ height: 8, width: `${pct * 100}%`, backgroundColor: color, borderRadius: 4 }} />
              </View>
            </View>
          );
        }} />
    </View>
  );
}
