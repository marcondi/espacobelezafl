import { StorageService } from './storageService';
import { ScheduledBill, BillPayment } from '@/types';

const BILLS_KEY = 'scheduled_bills';
const PAYMENTS_KEY = 'bill_payments';

export class ScheduledBillService {
  static getAllBills(userId: string): ScheduledBill[] {
    return StorageService.get<ScheduledBill[]>(userId, BILLS_KEY) || [];
  }

  static getActiveBills(userId: string): ScheduledBill[] {
    return this.getAllBills(userId).filter(b => b.is_active);
  }

  static createBill(userId: string, data: Omit<ScheduledBill, 'id' | 'user_id' | 'created_at' | 'is_active'>): ScheduledBill {
    const bills = this.getAllBills(userId);
    const newBill: ScheduledBill = {
      ...data,
      id: crypto.randomUUID(),
      user_id: userId,
      is_active: true,
      created_at: new Date().toISOString()
    };

    bills.push(newBill);
    StorageService.set(userId, BILLS_KEY, bills);
    return newBill;
  }

  static updateBill(userId: string, id: string, data: Partial<Omit<ScheduledBill, 'id' | 'user_id' | 'created_at'>>): boolean {
    const bills = this.getAllBills(userId);
    const index = bills.findIndex(b => b.id === id);
    if (index === -1) return false;

    bills[index] = { ...bills[index], ...data };
    StorageService.set(userId, BILLS_KEY, bills);
    return true;
  }

  static deleteBill(userId: string, id: string): boolean {
    const bills = this.getAllBills(userId);
    const filtered = bills.filter(b => b.id !== id);
    if (filtered.length === bills.length) return false;

    StorageService.set(userId, BILLS_KEY, filtered);
    return true;
  }

  // Bill Payments
  static getAllPayments(userId: string): BillPayment[] {
    return StorageService.get<BillPayment[]>(userId, PAYMENTS_KEY) || [];
  }

  static getPaymentStatus(userId: string, billId: string, year: number, month: number): BillPayment | undefined {
    const payments = this.getAllPayments(userId);
    return payments.find(p => 
      p.scheduled_bill_id === billId && 
      p.year === year && 
      p.month === month
    );
  }

  static markAsPaid(
    userId: string, 
    billId: string, 
    year: number, 
    month: number, 
    transactionId: string
  ): BillPayment {
    const payments = this.getAllPayments(userId);
    
    const existing = payments.find(p => 
      p.scheduled_bill_id === billId && 
      p.year === year && 
      p.month === month
    );

    if (existing) {
      existing.is_paid = true;
      existing.paid_at = new Date().toISOString();
      existing.transaction_id = transactionId;
    } else {
      const newPayment: BillPayment = {
        id: crypto.randomUUID(),
        user_id: userId,
        scheduled_bill_id: billId,
        year,
        month,
        is_paid: true,
        paid_at: new Date().toISOString(),
        transaction_id: transactionId,
        created_at: new Date().toISOString()
      };
      payments.push(newPayment);
    }

    StorageService.set(userId, PAYMENTS_KEY, payments);
    return payments[payments.length - 1];
  }
}
