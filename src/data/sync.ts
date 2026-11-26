import { supabase } from '../core/supabase';
import { getDb } from './db';

const TABLES = [
  { name: 'categories', cols: ['id', 'name', 'icon'] },
  { name: 'budgets', cols: ['id', 'category_id', 'amount', 'period', 'start_date'] },
  { name: 'expenses', cols: ['id', 'category_id', 'amount', 'description', 'date'] },
] as const; // receipt_path es solo local

async function push() {
  const db = await getDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida');
  for (const t of TABLES) {
    const rows = await db.getAllAsync<any>(`SELECT * FROM ${t.name} WHERE synced=0`);
    if (!rows.length) continue;
    const payload = rows.map(r => {
      const o: any = { user_id: user.id, deleted: !!r.deleted, updated_at: r.updated_at };
      t.cols.forEach(c => (o[c] = r[c]));
      return o;
    });
    const { error } = await supabase.from(t.name).upsert(payload);
    if (error) throw error;
    await db.runAsync(`UPDATE ${t.name} SET synced=1 WHERE id IN (${rows.map(() => '?').join(',')})`, rows.map(r => r.id));
  }
}

/** Last-write-wins por updated_at. */
async function pull() {
  const db = await getDb();
  const meta = await db.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key='last_sync'");
  const since = meta?.value ?? '1970-01-01T00:00:00Z';
  const started = new Date().toISOString();
  for (const t of TABLES) {
    const { data, error } = await supabase.from(t.name).select('*').gt('updated_at', since);
    if (error) throw error;
    for (const r of data ?? []) {
      const local = await db.getFirstAsync<{ updated_at: string }>(`SELECT updated_at FROM ${t.name} WHERE id=?`, [r.id]);
      if (local && Date.parse(local.updated_at) >= Date.parse(r.updated_at)) continue;
      const cols = [...t.cols, 'deleted', 'updated_at', 'synced'];
      const vals = [...t.cols.map(c => r[c]), r.deleted ? 1 : 0, new Date(r.updated_at).toISOString(), 1];
      const upd = cols.filter(c => c !== 'id').map(c => `${c}=excluded.${c}`).join(',');
      await db.runAsync(
        `INSERT INTO ${t.name}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})
         ON CONFLICT(id) DO UPDATE SET ${upd}`, vals);
    }
  }
  await db.runAsync("INSERT OR REPLACE INTO meta(key,value) VALUES('last_sync',?)", [started]);
}

export async function syncAll() {
  await push();
  await pull();
}
