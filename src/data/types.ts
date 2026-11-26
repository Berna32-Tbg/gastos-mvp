// Filas tal como están en SQLite (snake_case) para evitar mapeos.
interface Base { id: string; synced: 0 | 1; deleted: 0 | 1; updated_at: string }
export interface Category extends Base { name: string; icon: string | null }
export interface Budget extends Base { category_id: string; amount: number; period: 'weekly' | 'monthly'; start_date: string }
export interface Expense extends Base {
  category_id: string; amount: number; description: string | null; date: string; receipt_path: string | null;
}
