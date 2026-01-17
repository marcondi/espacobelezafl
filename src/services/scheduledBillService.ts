import { supabase } from '@/integrations/supabase/client';
import type { ScheduledBill, BillPayment } from '@/types';

export class ScheduledBillService {
  static async getAllBills(userId: string): Promise<ScheduledBill[]> {
    const { data, error } = await supabase
      .from('scheduled_bills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as ScheduledBill[];
  }

  static async getActiveBills(userId: string): Promise<ScheduledBill[]> {
    const { data, error } = await supabase
      .from('scheduled_bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('due_day', { ascending: true });

    if (error) throw error;
    return (data ?? []) as ScheduledBill[];
  }

  static async createBill(
    userId: string,
    data: Omit<ScheduledBill, 'id' | 'user_id' | 'created_at' | 'is_active'>
  ): Promise<ScheduledBill> {
    const payload = {
      ...data,
      user_id: userId,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('scheduled_bills')
      .insert(payload as any)
      .select('*')
      .single();

    if (error) throw error;
    return created as ScheduledBill;
  }

  static async updateBill(
    userId: string,
    id: string,
    data: Partial<Omit<ScheduledBill, 'id' | 'user_id' | 'created_at'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('scheduled_bills')
      .update(data as any)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async deleteBill(userId: string, id: string): Promise<boolean> {
    const { error } = await supabase.from('scheduled_bills').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  static async getAllPayments(userId: string): Promise<BillPayment[]> {
    const { data, error } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as BillPayment[];
  }

  static async getPaymentStatus(userId: string, billId: string, year: number, month: number): Promise<BillPayment | undefined> {
    const { data, error } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_bill_id', billId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (error) throw error;
    return (data ?? undefined) as any;
  }

  static async markAsPaid(
    userId: string,
    billId: string,
    year: number,
    month: number,
    transactionId: string
  ): Promise<BillPayment> {
    const existing = await this.getPaymentStatus(userId, billId, year, month);

    if (existing) {
      const { data, error } = await supabase
        .from('bill_payments')
        .update({ is_paid: true, paid_at: new Date().toISOString(), transaction_id: transactionId } as any)
        .eq('id', existing.id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data as BillPayment;
    }

    const payload = {
      user_id: userId,
      scheduled_bill_id: billId,
      year,
      month,
      is_paid: true,
      paid_at: new Date().toISOString(),
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bill_payments')
      .insert(payload as any)
      .select('*')
      .single();

    if (error) throw error;
    return data as BillPayment;
  }
}
