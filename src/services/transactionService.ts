import { StorageService } from './storageService';
import { Transaction } from '@/types';

const ENTITY_KEY = 'transactions';

export class TransactionService {
  static getAll(userId: string): Transaction[] {
    return StorageService.get<Transaction[]>(userId, ENTITY_KEY) || [];
  }

  static getById(userId: string, id: string): Transaction | undefined {
    const transactions = this.getAll(userId);
    return transactions.find(t => t.id === id);
  }

  static getByMonth(userId: string, year: number, month: number): Transaction[] {
    const transactions = this.getAll(userId);
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }

  static create(userId: string, data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Transaction {
    const transactions = this.getAll(userId);
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      user_id: userId,
      recurrence_group_id: data.recurrence_group_id || (data.recurrence ? crypto.randomUUID() : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    transactions.push(newTransaction);
    StorageService.set(userId, ENTITY_KEY, transactions);

    // Generate recurring transactions
    if (newTransaction.recurrence && newTransaction.recurrence !== 'none') {
      this.generateRecurringTransactions(userId, newTransaction);
    }

    return newTransaction;
  }

  private static generateRecurringTransactions(userId: string, baseTransaction: Transaction): void {
    if (!baseTransaction.recurrence || baseTransaction.recurrence === 'none') return;

    const transactions = this.getAll(userId);

    const [baseYearStr, baseMonthStr, baseDayStr] = baseTransaction.date.split('-');
    const baseYear = Number(baseYearStr);
    const baseMonth = Number(baseMonthStr); // 1-12
    const baseDay = Number(baseDayStr);

    const monthsToGenerate = baseTransaction.recurrence === 'monthly' ? 12 : 1;

    for (let i = 1; i <= monthsToGenerate; i++) {
      let year = baseYear;
      let month = baseMonth;

      if (baseTransaction.recurrence === 'monthly') {
        const monthIndex = baseMonth - 1 + i; // 0-based
        year = baseYear + Math.floor(monthIndex / 12);
        month = (monthIndex % 12) + 1;
      } else {
        year = baseYear + i;
        month = baseMonth;
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      const day = Math.min(baseDay, daysInMonth);

      const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Evita criar duplicados se já existirem lançamentos dessa série no mesmo mês
      const alreadyExists = transactions.some((t) => {
        if (t.recurrence_group_id !== baseTransaction.recurrence_group_id) return false;

        const [yStr, mStr] = t.date.split('-');
        const existingYear = Number(yStr);
        const existingMonth = Number(mStr);

        const [newYStr, newMStr] = newDate.split('-');
        const newYear = Number(newYStr);
        const newMonth = Number(newMStr);

        return existingYear === newYear && existingMonth === newMonth;
      });

      if (alreadyExists) continue;

      const recurring: Transaction = {
        ...baseTransaction,
        id: crypto.randomUUID(),
        date: newDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      transactions.push(recurring);
    }

    StorageService.set(userId, ENTITY_KEY, transactions);
  }

  static update(userId: string, id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): boolean {
    const transactions = this.getAll(userId);
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    transactions[index] = {
      ...transactions[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    StorageService.set(userId, ENTITY_KEY, transactions);
    return true;
  }

  static delete(userId: string, id: string): boolean {
    const transactions = this.getAll(userId);
    const filtered = transactions.filter(t => t.id !== id);
    if (filtered.length === transactions.length) return false;

    StorageService.set(userId, ENTITY_KEY, filtered);
    return true;
  }

  static deleteRecurringGroup(userId: string, groupId: string): boolean {
    const transactions = this.getAll(userId);
    const filtered = transactions.filter(t => t.recurrence_group_id !== groupId);
    if (filtered.length === transactions.length) return false;

    StorageService.set(userId, ENTITY_KEY, filtered);
    return true;
  }
}
