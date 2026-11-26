import * as Crypto from 'expo-crypto';
import { getDb } from './db';
import { budgetSchema } from '../core/validators';
import { Budget } from './types';

const now = () => new Date().toISOString();

export async function createBudget(input: unknown) {
  const v = budgetSchema.parse(input);
  await (await getDb()).runAsync(
    'INSERT INTO budgets(id,category_id,amount,period,start_date,updated_at) VALUES(?,?,?,?,?,?)',
    [Crypto.randomUUID(), v.categoryId, v.amount, v.period, now(), now()]);
}

export async function listBudgets() {
  return (await getDb()).getAllAsync<Budget & { name: string; icon: string; spent: number }>(
    `SELECT b.*, c.name, c.icon,
       (SELECT COALESCE(SUM(e.amount),0) FROM expenses e
         WHERE e.category_id=b.category_id AND e.deleted=0 AND e.date>=b.start_date) AS spent
     FROM budgets b JOIN categories c ON c.id=b.category_id WHERE b.deleted=0`);
}

export async function deleteBudget(id: string) {
  await (await getDb()).runAsync('UPDATE budgets SET deleted=1,synced=0,updated_at=? WHERE id=?', [now(), id]);
}
