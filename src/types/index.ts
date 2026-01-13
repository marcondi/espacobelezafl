export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'none' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  recurrence: RecurrenceType | null;
  recurrence_group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledBill {
  id: string;
  user_id: string;
  category_id: string;
  description: string;
  amount: number;
  due_day: number;
  recurrence: 'monthly' | 'yearly';
  is_active: boolean;
  created_at: string;
}

export interface BillPayment {
  id: string;
  user_id: string;
  scheduled_bill_id: string;
  year: number;
  month: number;
  is_paid: boolean;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
}
