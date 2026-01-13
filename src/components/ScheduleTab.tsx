import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduledBill, BillPayment, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ScheduledBillModal from './ScheduledBillModal';
import { format } from 'date-fns';

interface ScheduleTabProps {
  currentDate: Date;
  onRefresh: () => void;
}

export default function ScheduleTab({ currentDate, onRefresh }: ScheduleTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<ScheduledBill[]>([]);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    const { data: billsData } = await supabase
      .from('scheduled_bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const { data: paymentsData } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month);

    if (billsData) setBills(billsData as ScheduledBill[]);
    if (categoriesData) setCategories(categoriesData as Category[]);
    if (paymentsData) setPayments(paymentsData as BillPayment[]);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const getPaymentStatus = (billId: string) => {
    return payments.find(p => p.scheduled_bill_id === billId)?.is_paid || false;
  };

  const handlePayBill = async (bill: ScheduledBill) => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Create transaction
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        category_id: bill.category_id,
        description: bill.description,
        amount: bill.amount,
        type: 'expense',
        date: format(new Date(year, month - 1, bill.due_day), 'yyyy-MM-dd'),
        recurrence: null
      })
      .select()
      .single();

    if (txError) {
      toast({ title: 'Erro', description: txError.message, variant: 'destructive' });
      return;
    }

    // Create or update payment
    const existingPayment = payments.find(p => p.scheduled_bill_id === bill.id);

    if (existingPayment) {
      await supabase
        .from('bill_payments')
        .update({ is_paid: true, transaction_id: txData.id, paid_at: new Date().toISOString() })
        .eq('id', existingPayment.id);
    } else {
      await supabase.from('bill_payments').insert({
        user_id: user.id,
        scheduled_bill_id: bill.id,
        year,
        month,
        is_paid: true,
        transaction_id: txData.id,
        paid_at: new Date().toISOString()
      });
    }

    toast({ title: 'Pago!', description: 'Conta marcada como paga.' });
    loadData();
    onRefresh();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agenda de Contas</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conta agendada
            </p>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => {
                const isPaid = getPaymentStatus(bill.id);
                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isPaid 
                        ? 'border-success/20 bg-success/5' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${isPaid ? 'bg-success/20' : 'bg-muted'}`}>
                        <Calendar className={`h-5 w-5 ${isPaid ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{bill.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{getCategoryName(bill.category_id)}</span>
                          <span>•</span>
                          <span>Vencimento dia {bill.due_day}</span>
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(bill.amount))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {isPaid ? (
                        <div className="flex items-center gap-2 text-success">
                          <Check className="h-5 w-5" />
                          <span className="text-sm font-medium">Pago</span>
                        </div>
                      ) : (
                        <Button onClick={() => handlePayBill(bill)} size="sm">
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduledBillModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadData();
        }}
      />
    </>
  );
}
