import * as Crypto from 'expo-crypto';
import { getDb } from './db';
import { expenseSchema } from '../core/validators';
import { checkBudget } from '../core/notifications';
import { Expense } from './types';

const now = () => new Date().toISOString();

export async function createExpense(input: unknown, receiptPath?: string | null) {
  const v = expenseSchema.parse(input);
  const id = Crypto.randomUUID();
  await (await getDb()).runAsync(
    `INSERT INTO expenses(id,category_id,amount,description,date,receipt_path,updated_at)
     VALUES(?,?,?,?,?,?,?)`,
    [id, v.categoryId, v.amount, v.description || null, v.date, receiptPath ?? null, now()]);
  await checkBudget(v.categoryId);
  return id;
}

export async function listExpenses() {
  return (await getDb()).getAllAsync<Expense>('SELECT * FROM expenses WHERE deleted=0 ORDER BY date DESC');
}

export async function getExpense(id: string) {
  return (await getDb()).getFirstAsync<Expense>('SELECT * FROM expenses WHERE id=? AND deleted=0', [id]);
}

export async function updateExpense(id: string, input: unknown, receiptPath?: string | null) {
  const v = expenseSchema.parse(input);
  await (await getDb()).runAsync(
    `UPDATE expenses SET category_id=?,amount=?,description=?,date=?,receipt_path=?,synced=0,updated_at=? WHERE id=?`,
    [v.categoryId, v.amount, v.description || null, v.date, receiptPath ?? null, now(), id]);
  await checkBudget(v.categoryId);
}

/** Borrado lógico para poder sincronizar la eliminación. */
export async function deleteExpense(id: string) {
  await (await getDb()).runAsync('UPDATE expenses SET deleted=1,synced=0,updated_at=? WHERE id=?', [now(), id]);
}

export async function totalsByCategory() {
  return (await getDb()).getAllAsync<{ name: string; icon: string; total: number }>(
    `SELECT c.name, c.icon, SUM(e.amount) AS total FROM expenses e
     JOIN categories c ON c.id=e.category_id WHERE e.deleted=0 GROUP BY c.id ORDER BY total DESC`);
}
