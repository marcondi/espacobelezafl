import { supabase } from '@/integrations/supabase/client';
import { StorageService } from '@/services/storageService';
import type { BillPayment, Category, ScheduledBill, Transaction } from '@/types';
import { toast as sonnerToast } from 'sonner';

const MIGRATION_FLAG_PREFIX = 'financas_cloud_migrated_';
const LEGACY_SESSION_KEY = 'financas_session';

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export class MigrationService {
  /**
   * Migra os dados do navegador (antigo armazenamento local) para o backend.
   * Segurança: só migra se o usuário ainda não tem dados no backend (evita duplicar).
   */
  static async migrateIfNeeded(targetUserId: string): Promise<void> {
    const flagKey = `${MIGRATION_FLAG_PREFIX}${targetUserId}`;
    if (localStorage.getItem(flagKey) === '1') return;

    // 1) Descobrir qual "userId local" deve ser migrado
    const legacySession = safeParseJson<{ userId: string }>(localStorage.getItem(LEGACY_SESSION_KEY));
    const sourceUserId = legacySession?.userId ?? this.guessLegacyUserIdFromKeys();
    if (!sourceUserId) {
      localStorage.setItem(flagKey, '1');
      return;
    }

    // 2) Se já houver dados no backend para esse usuário, não migrar automaticamente (evita duplicação)
    const { data: existingTx, error: txErr } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', targetUserId)
      .limit(1);
    if (txErr) throw txErr;

    const { data: existingCats, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', targetUserId)
      .limit(1);
    if (catErr) throw catErr;

    const hasAnyData = (existingTx?.length ?? 0) > 0 || (existingCats?.length ?? 0) > 0;
    if (hasAnyData) {
      localStorage.setItem(flagKey, '1');
      return;
    }

    // 3) Ler dados do storage local legado
    const categories = StorageService.get<Category[]>(sourceUserId, 'categories') ?? [];
    const transactions = StorageService.get<Transaction[]>(sourceUserId, 'transactions') ?? [];
    const bills = StorageService.get<ScheduledBill[]>(sourceUserId, 'scheduled_bills') ?? [];
    const payments = StorageService.get<BillPayment[]>(sourceUserId, 'bill_payments') ?? [];

    if (categories.length === 0 && transactions.length === 0 && bills.length === 0 && payments.length === 0) {
      localStorage.setItem(flagKey, '1');
      return;
    }

    // 4) Inserir preservando IDs para manter referências
    const catsPayload = categories.map((c) => ({
      id: c.id,
      user_id: targetUserId,
      name: c.name,
      type: c.type,
      created_at: c.created_at ?? new Date().toISOString(),
    }));

    const billsPayload = bills.map((b) => ({
      id: b.id,
      user_id: targetUserId,
      category_id: b.category_id,
      description: b.description,
      due_day: b.due_day,
      amount: b.amount,
      recurrence: b.recurrence,
      is_active: b.is_active ?? true,
      created_at: b.created_at ?? new Date().toISOString(),
    }));

    const txPayload = transactions.map((t) => ({
      id: t.id,
      user_id: targetUserId,
      category_id: t.category_id,
      description: t.description,
      amount: t.amount,
      date: t.date,
      type: t.type,
      recurrence: t.recurrence,
      recurrence_group_id: t.recurrence_group_id,
      created_at: t.created_at ?? new Date().toISOString(),
      updated_at: t.updated_at ?? new Date().toISOString(),
    }));

    const paymentsPayload = payments.map((p) => ({
      id: p.id,
      user_id: targetUserId,
      scheduled_bill_id: p.scheduled_bill_id,
      year: p.year,
      month: p.month,
      is_paid: p.is_paid,
      paid_at: p.paid_at,
      transaction_id: p.transaction_id,
      created_at: p.created_at ?? new Date().toISOString(),
    }));

    // Ordem importa por causa das referências
    if (catsPayload.length) {
      const { error } = await supabase.from('categories').insert(catsPayload as any);
      if (error) throw error;
    }

    if (billsPayload.length) {
      const { error } = await supabase.from('scheduled_bills').insert(billsPayload as any);
      if (error) throw error;
    }

    if (txPayload.length) {
      const { error } = await supabase.from('transactions').insert(txPayload as any);
      if (error) throw error;
    }

    if (paymentsPayload.length) {
      const { error } = await supabase.from('bill_payments').insert(paymentsPayload as any);
      if (error) throw error;
    }

    localStorage.setItem(flagKey, '1');

    sonnerToast('Dados importados', {
      description: 'Seus dados locais foram migrados para sua conta.'
    });
  }

  private static guessLegacyUserIdFromKeys(): string | null {
    // finanças_{userId}_transactions
    const keys = Object.keys(localStorage);
    const prefixes: string[] = [];

    for (const k of keys) {
      const match = k.match(/^financas_(.+?)_(transactions|categories|scheduled_bills|bill_payments)$/);
      if (match?.[1]) prefixes.push(match[1]);
    }

    return prefixes[0] ?? null;
  }
}
