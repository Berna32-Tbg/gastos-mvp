import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (e: string) => () => <Text style={{ fontSize: 20 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Gastos', tabBarIcon: icon('🧾') }} />
      <Tabs.Screen name="budgets" options={{ title: 'Presupuestos', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="stats" options={{ title: 'Estadísticas', tabBarIcon: icon('📊') }} />
    </Tabs>
  );
}
