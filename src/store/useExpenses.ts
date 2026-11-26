import { create } from 'zustand';
import { listExpenses, deleteExpense } from '../data/expenseRepo';
import { syncAll } from '../data/sync';
import { Expense } from '../data/types';

type Status = 'idle' | 'loading' | 'success' | 'error';
interface State {
  items: Expense[]; status: Status; error?: string; syncing: boolean; syncError?: string;
  load: () => Promise<void>; remove: (id: string) => Promise<void>; sync: () => Promise<void>;
}

export const useExpenses = create<State>((set, get) => ({
  items: [], status: 'idle', syncing: false,
  load: async () => {
    set({ status: 'loading', error: undefined });
    try { set({ items: await listExpenses(), status: 'success' }); }
    catch { set({ status: 'error', error: 'No se pudieron cargar los gastos' }); }
  },
  remove: async (id) => { await deleteExpense(id); await get().load(); },
  sync: async () => {
    set({ syncing: true, syncError: undefined });
    try { await syncAll(); await get().load(); }
    catch (e: any) { set({ syncError: 'Sin conexión o error de sincronización. Se reintentará luego.' }); }
    set({ syncing: false });
  },
}));
