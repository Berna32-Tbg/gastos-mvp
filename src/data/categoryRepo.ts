import { getDb } from './db';
import { Category } from './types';

export async function listCategories() {
  return (await getDb()).getAllAsync<Category>('SELECT * FROM categories WHERE deleted=0 ORDER BY name');
}
