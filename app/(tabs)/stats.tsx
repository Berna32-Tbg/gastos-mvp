import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';
import { totalsByCategory } from '../../src/data/expenseRepo';
import { money } from '../../src/core/format';
import { colors, s } from '../../src/ui';

const PALETTE = ['#4F46E5', '#16A34A', '#F59E0B', '#DC2626', '#0EA5E9', '#A855F7'];

export default function Stats() {
  const [rows, setRows] = useState<{ name: string; icon: string; total: number }[]>([]);
  useFocusEffect(useCallback(() => { totalsByCategory().then(setRows); }, []));
  const total = rows.reduce((a, r) => a + r.total, 0);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ alignItems: 'center' }}>
      <Text style={[s.title, { alignSelf: 'flex-start' }]}>Estadísticas</Text>
      {!rows.length ? <Text style={{ color: colors.muted }}>Sin datos todavía.</Text> : (
        <>
          <PieChart donut radius={110} innerRadius={65}
            data={rows.map((r, i) => ({ value: r.total, color: PALETTE[i % PALETTE.length] }))}
            centerLabelComponent={() => <Text style={{ fontWeight: '700' }}>{money(total)}</Text>} />
          <View style={{ width: '100%', marginTop: 20 }}>
            {rows.map((r, i) => (
              <View key={r.name} style={[s.card, s.row]}>
                <Text><Text style={{ color: PALETTE[i % PALETTE.length] }}>● </Text>{r.icon} {r.name}</Text>
                <Text style={{ fontWeight: '600' }}>{money(r.total)} ({Math.round((r.total / total) * 100)}%)</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
