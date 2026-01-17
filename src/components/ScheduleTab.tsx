import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduledBill, BillPayment, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ScheduledBillModal from './ScheduledBillModal';
import { ScheduledBillService } from '@/services/scheduledBillService';
import { CategoryService } from '@/services/categoryService';
import { TransactionService } from '@/services/transactionService';
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
    if (user) void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month0 = currentDate.getMonth();

    const [billsData, categoriesData, paymentsData] = await Promise.all([
      ScheduledBillService.getActiveBills(user.id),
      CategoryService.getAll(user.id),
      ScheduledBillService.getAllPayments(user.id),
    ]);

    const monthPayments = paymentsData.filter(p => p.year === year && p.month === month0);

    setBills(billsData);
    setCategories(categoriesData);
    setPayments(monthPayments);
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
    const month0 = currentDate.getMonth();

    const txData = await TransactionService.create(user.id, {
      category_id: bill.category_id,
      description: bill.description,
      amount: bill.amount,
      type: 'expense',
      date: format(new Date(year, month0, bill.due_day), 'yyyy-MM-dd'),
      recurrence: null,
      recurrence_group_id: null,
    });

    await ScheduledBillService.markAsPaid(user.id, bill.id, year, month0, txData.id);

    toast({ title: 'Pago!', description: 'Conta marcada como paga.' });
    await loadData();
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
            <p className="text-center text-muted-foreground py-8">Nenhuma conta agendada</p>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => {
                const isPaid = getPaymentStatus(bill.id);
                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isPaid ? 'border-success/20 bg-success/5' : 'border-border bg-card'
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
                        <Button onClick={() => void handlePayBill(bill)} size="sm">
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
          void loadData();
        }}
      />
    </>
  );
}
