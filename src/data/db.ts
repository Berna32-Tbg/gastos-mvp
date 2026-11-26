import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { getDbKey } from '../core/security';
import { SCHEMA } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;
let _opening: Promise<SQLite.SQLiteDatabase> | null = null;

async function open() {
  const db = await SQLite.openDatabaseAsync('gastos.db');
  // La clave es hex generado por la app (no es input del usuario).
  await db.execAsync(`PRAGMA key = '${await getDbKey()}';`);
  await db.execAsync(SCHEMA);
  const n = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM categories');
  if (!n?.c) {
    const now = new Date().toISOString();
    for (const [name, icon] of [['Comida', '🍔'], ['Transporte', '🚌'], ['Hogar', '🏠'], ['Ocio', '🎮'], ['Salud', '💊']]) {
      await db.runAsync('INSERT INTO categories(id,name,icon,updated_at) VALUES(?,?,?,?)',
        [Crypto.randomUUID(), name, icon, now]);
    }
  }
  return db;
}

export function getDb() {
  if (_db) return Promise.resolve(_db);
  return (_opening ??= open().then(d => (_db = d)));
}

/** Borra la BD local (al cerrar sesión). */
export async function resetDb() {
  const db = await getDb();
  await db.execAsync('DELETE FROM expenses; DELETE FROM budgets; DELETE FROM categories; DELETE FROM meta;');
  _db = null; _opening = null;
}
