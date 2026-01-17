import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types';

export class TransactionService {
  static async getAll(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  }

  static async getByMonth(userId: string, year: number, month0: number): Promise<Transaction[]> {
    await this.ensureRecurringUpTo(userId, year, month0);

    const start = new Date(year, month0, 1);
    const end = new Date(year, month0 + 1, 0);

    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startIso)
      .lte('date', endIso)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  }

  private static async ensureRecurringUpTo(userId: string, targetYear: number, targetMonth0: number): Promise<void> {
    // Fetch all recurring transactions for the user (we need the full series map).
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .not('recurrence_group_id', 'is', null)
      .not('recurrence', 'is', null)
      .order('date', { ascending: true });

    if (error) throw error;

    const transactions = (data ?? []) as Transaction[];

    // Pick the oldest transaction as base per series
    const seriesBase = new Map<string, Transaction>();
    for (const t of transactions) {
      if (!t.recurrence_group_id) continue;
      if (!t.recurrence || t.recurrence === 'none') continue;

      const existing = seriesBase.get(t.recurrence_group_id);
      if (!existing || t.date < existing.date) seriesBase.set(t.recurrence_group_id, t);
    }

    const toInsert: Array<Omit<Transaction, 'id'>> = [];

    for (const [groupId, base] of seriesBase.entries()) {
      const [baseYStr, baseMStr, baseDStr] = base.date.split('-');
      const baseYear = Number(baseYStr);
      const baseMonth = Number(baseMStr); // 1-12
      const baseDay = Number(baseDStr);

      const existingMonths = new Set<string>();
      for (const t of transactions) {
        if (t.recurrence_group_id !== groupId) continue;
        const [yStr, mStr] = t.date.split('-');
        existingMonths.add(`${yStr}-${mStr}`);
      }

      if (base.recurrence === 'monthly') {
        const baseKey = baseYear * 12 + (baseMonth - 1);
        const targetKey = targetYear * 12 + targetMonth0;
        if (targetKey <= baseKey) continue;

        for (let key = baseKey + 1; key <= targetKey; key++) {
          const year = Math.floor(key / 12);
          const month = (key % 12) + 1; // 1-12

          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          if (existingMonths.has(monthKey)) continue;

          const daysInMonth = new Date(year, month, 0).getDate();
          const day = Math.min(baseDay, daysInMonth);
          const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          toInsert.push({
            user_id: userId,
            category_id: base.category_id,
            amount: base.amount,
            date: newDate,
            description: base.description,
            type: base.type,
            recurrence: base.recurrence,
            recurrence_group_id: base.recurrence_group_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);

          existingMonths.add(monthKey);
        }
      }

      if (base.recurrence === 'yearly') {
        if (targetYear <= baseYear) continue;

        for (let year = baseYear + 1; year <= targetYear; year++) {
          const monthKey = `${year}-${String(baseMonth).padStart(2, '0')}`;
          if (existingMonths.has(monthKey)) continue;

          const daysInMonth = new Date(year, baseMonth, 0).getDate();
          const day = Math.min(baseDay, daysInMonth);
          const newDate = `${year}-${String(baseMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          toInsert.push({
            user_id: userId,
            category_id: base.category_id,
            amount: base.amount,
            date: newDate,
            description: base.description,
            type: base.type,
            recurrence: base.recurrence,
            recurrence_group_id: base.recurrence_group_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);

          existingMonths.add(monthKey);
        }
      }
    }

    if (toInsert.length === 0) return;

    // Insert missing months in bulk; duplicates are already prevented by our in-memory month map.
    const { error: insertError } = await supabase.from('transactions').insert(toInsert as any);
    if (insertError) throw insertError;
  }

  static async create(userId: string, data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const recurrence_group_id = data.recurrence_group_id || (data.recurrence ? crypto.randomUUID() : null);

    const payload = {
      ...data,
      user_id: userId,
      recurrence_group_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('transactions')
      .insert(payload as any)
      .select('*')
      .single();

    if (error) throw error;
    return created as Transaction;
  }

  static async update(
    userId: string,
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .update({ ...data, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  static async deleteRecurringGroup(userId: string, groupId: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('recurrence_group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}
