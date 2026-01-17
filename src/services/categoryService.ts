import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types';

const DEFAULT_CATEGORIES: Array<Pick<Category, 'name' | 'type'>> = [
  { name: 'Alimentação', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Lazer', type: 'expense' },
  { name: 'Outros', type: 'expense' },
  { name: 'Salário', type: 'income' },
  { name: 'Investimentos', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Outros', type: 'income' },
];

export class CategoryService {
  private static async ensureDefaults(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) throw error;
    if ((data ?? []).length > 0) return;

    const payload = DEFAULT_CATEGORIES.map((c) => ({
      user_id: userId,
      name: c.name,
      type: c.type,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from('categories').insert(payload as any);
    if (insertError) throw insertError;
  }

  static async getAll(userId: string): Promise<Category[]> {
    await this.ensureDefaults(userId);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Category[];
  }

  static async create(userId: string, name: string, type: 'income' | 'expense'): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, type, created_at: new Date().toISOString() } as any)
      .select('*')
      .single();

    if (error) throw error;
    return data as Category;
  }

  static async update(userId: string, id: string, name: string, type: 'income' | 'expense'): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .update({ name, type } as any)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  }
}
