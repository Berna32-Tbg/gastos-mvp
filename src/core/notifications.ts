import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDb } from '../data/db';
import { Budget } from '../data/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Presupuestos', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') await scheduleWeeklyReminder();
}

/** Recordatorio semanal programado (domingo 20:00). Evita duplicados. */
export async function scheduleWeeklyReminder() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  if (all.some(n => n.content.data?.kind === 'weekly')) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Resumen semanal', body: 'Revisa tus gastos de la semana', data: { kind: 'weekly' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 20, minute: 0 },
  });
}

function periodStart(period: 'weekly' | 'monthly'): string {
  const d = new Date();
  if (period === 'monthly') return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const day = (d.getDay() + 6) % 7; // lunes = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).toISOString();
}

/** Notifica si el gasto del periodo supera el 80 % del presupuesto de la categoría. */
export async function checkBudget(categoryId: string) {
  const db = await getDb();
  const budgets = await db.getAllAsync<Budget>(
    'SELECT * FROM budgets WHERE category_id=? AND deleted=0', [categoryId]);
  for (const b of budgets) {
    const row = await db.getFirstAsync<{ spent: number }>(
      `SELECT COALESCE(SUM(amount),0) AS spent FROM expenses
       WHERE category_id=? AND deleted=0 AND date>=?`, [categoryId, periodStart(b.period)]);
    const pct = (row?.spent ?? 0) / b.amount;
    if (pct >= 0.8) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Presupuesto',
          body: `Has usado el ${Math.round(pct * 100)}% de tu presupuesto ${b.period === 'weekly' ? 'semanal' : 'mensual'}`,
        },
        trigger: null,
      });
    }
  }
}
