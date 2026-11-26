import { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useExpenses } from '../../src/store/useExpenses';
import { useAuth } from '../../src/store/useAuth';
import { money, shortDate } from '../../src/core/format';
import { Button, colors, s } from '../../src/ui';

export default function ExpensesScreen() {
  const { items, status, error, load, remove, sync, syncing, syncError } = useExpenses();
  const signOut = useAuth(a => a.signOut);
  const router = useRouter();

  useFocusEffect(useCallback(() => { load(); }, []));
  useFocusEffect(useCallback(() => { sync(); }, []));

  const confirmDelete = (id: string) =>
    Alert.alert('Eliminar gasto', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);

  if (status === 'loading' && !items.length) return <View style={s.center}><ActivityIndicator size="large" /></View>;
  if (status === 'error') return (
    <View style={s.center}><Text style={s.error}>{error}</Text><Button title="Reintentar" onPress={load} /></View>
  );

  return (
    <View style={s.screen}>
      <View style={s.row}>
        <Text style={s.title}>Mis gastos</Text>
        <Button title="Salir" kind="ghost" onPress={signOut} />
      </View>
      {syncError && <Text style={s.error}>{syncError}</Text>}
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={sync} />}
        ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Aún no tienes gastos. Agrega uno con “+”.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => router.push({ pathname: '/expense-form', params: { id: item.id } })}
            onLongPress={() => confirmDelete(item.id)}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: colors.text }}>{item.description || 'Sin descripción'}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{shortDate(item.date)} {item.synced ? '☁️' : '⏳'}</Text>
              </View>
              {item.receipt_path && <Image source={{ uri: item.receipt_path }} style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10 }} />}
              <Text style={{ fontWeight: '700' }}>{money(item.amount)}</Text>
            </View>
          </Pressable>
        )}
      />
      <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center' }}>Mantén presionado un gasto para eliminarlo</Text>
      <Button title="+ Nuevo gasto" onPress={() => router.push('/expense-form')} />
    </View>
  );
}
