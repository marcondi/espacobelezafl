import { StorageService } from './storageService';
import { Category } from '@/types';

const ENTITY_KEY = 'categories';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Salário', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investimentos', type: 'income' },
  { name: 'Alimentação', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Lazer', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Outros', type: 'expense' }
];

export class CategoryService {
  private static initializeDefaults(userId: string): void {
    const existing = StorageService.get<Category[]>(userId, ENTITY_KEY);
    if (!existing || existing.length === 0) {
      const categories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      }));
      StorageService.set(userId, ENTITY_KEY, categories);
    }
  }

  static getAll(userId: string): Category[] {
    this.initializeDefaults(userId);
    return StorageService.get<Category[]>(userId, ENTITY_KEY) || [];
  }

  static getById(userId: string, id: string): Category | undefined {
    const categories = this.getAll(userId);
    return categories.find(c => c.id === id);
  }

  static create(userId: string, name: string, type: 'income' | 'expense'): Category {
    const categories = this.getAll(userId);
    const newCategory: Category = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      type,
      created_at: new Date().toISOString()
    };
    categories.push(newCategory);
    StorageService.set(userId, ENTITY_KEY, categories);
    return newCategory;
  }

  static update(userId: string, id: string, name: string, type: 'income' | 'expense'): boolean {
    const categories = this.getAll(userId);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    categories[index] = { ...categories[index], name, type };
    StorageService.set(userId, ENTITY_KEY, categories);
    return true;
  }

  static delete(userId: string, id: string): boolean {
    const categories = this.getAll(userId);
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;

    StorageService.set(userId, ENTITY_KEY, filtered);
    return true;
  }
}
