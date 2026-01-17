import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Calendar, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduledBill, BillPayment, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ScheduledBillModal from './ScheduledBillModal';
import { ScheduledBillService } from '@/services/scheduledBillService';
import { CategoryService } from '@/services/categoryService';
import { TransactionService } from '@/services/transactionService';
import { differenceInCalendarDays, format } from 'date-fns';

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
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const dueSoonThresholdDays = 3;

  const monthMeta = useMemo(() => {
    const year = currentDate.getFullYear();
    const month0 = currentDate.getMonth();
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();
    return { year, month0, month1: month0 + 1, daysInMonth };
  }, [currentDate]);

  const dueSoonSummary = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const unpaid = bills.filter((b) => !getPaymentStatus(b.id));

    const dueSoon = unpaid.filter((b) => {
      const dueDay = Math.min(b.due_day, monthMeta.daysInMonth);
      const dueDate = new Date(monthMeta.year, monthMeta.month0, dueDay);
      const diff = differenceInCalendarDays(dueDate, todayStart);
      return diff >= 0 && diff <= dueSoonThresholdDays;
    });

    const total = dueSoon.reduce((sum, b) => sum + Number(b.amount), 0);
    return { count: dueSoon.length, total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, payments, monthMeta]);

  useEffect(() => {
    if (user) void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    const [billsData, categoriesData, paymentsData] = await Promise.all([
      ScheduledBillService.getActiveBills(user.id),
      CategoryService.getAll(user.id),
      ScheduledBillService.getAllPayments(user.id),
    ]);

    const monthPayments = paymentsData.filter((p) => p.year === monthMeta.year && p.month === monthMeta.month1);

    setBills(billsData);
    setCategories(categoriesData);
    setPayments(monthPayments);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Sem categoria';
  };

  const getPaymentStatus = (billId: string) => {
    return payments.find((p) => p.scheduled_bill_id === billId)?.is_paid || false;
  };

  const handlePayBill = async (bill: ScheduledBill) => {
    if (!user) return;

    try {
      setPayingBillId(bill.id);

      const dueDay = Math.min(bill.due_day, monthMeta.daysInMonth);

      const txData = await TransactionService.create(user.id, {
        category_id: bill.category_id,
        description: bill.description,
        amount: bill.amount,
        type: 'expense',
        date: format(new Date(monthMeta.year, monthMeta.month0, dueDay), 'yyyy-MM-dd'),
        recurrence: null,
        recurrence_group_id: null,
      });

      await ScheduledBillService.markAsPaid(user.id, bill.id, monthMeta.year, monthMeta.month1, txData.id);

      toast({ title: 'Pago!', description: 'Conta marcada como paga.' });
      await loadData();
      onRefresh();
    } catch (e: any) {
      toast({
        title: 'Não foi possível pagar',
        description: e?.message ?? 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setPayingBillId(null);
    }
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
          {dueSoonSummary.count > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <div className="space-y-1">
                <AlertTitle>Vencimentos próximos</AlertTitle>
                <AlertDescription>
                  {dueSoonSummary.count} conta(s) vencem nos próximos {dueSoonThresholdDays} dias, totalizando{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dueSoonSummary.total)}.
                </AlertDescription>
              </div>
            </Alert>
          )}

          {bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma conta agendada</p>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => {
                const isPaid = getPaymentStatus(bill.id);

                const dueDay = Math.min(bill.due_day, monthMeta.daysInMonth);
                const dueDate = new Date(monthMeta.year, monthMeta.month0, dueDay);
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const daysToDue = differenceInCalendarDays(dueDate, todayStart);
                const isDueSoon = !isPaid && daysToDue >= 0 && daysToDue <= dueSoonThresholdDays;

                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isPaid
                        ? 'border-success/20 bg-success/5'
                        : isDueSoon
                          ? 'border-accent/40 bg-accent/10'
                          : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          isPaid ? 'bg-success/20' : isDueSoon ? 'bg-accent/20' : 'bg-muted'
                        }`}
                      >
                        {isDueSoon ? (
                          <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                        ) : (
                          <Calendar className={`h-5 w-5 ${isPaid ? 'text-success' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{bill.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{getCategoryName(bill.category_id)}</span>
                          <span>•</span>
                          <span>Vencimento dia {bill.due_day}</span>
                          {isDueSoon && (
                            <span className="ml-0 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs text-foreground">
                              Vence em {daysToDue} dia(s)
                            </span>
                          )}
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
                        <Button onClick={() => void handlePayBill(bill)} size="sm" disabled={payingBillId === bill.id}>
                          {payingBillId === bill.id ? 'Pagando…' : 'Pagar'}
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
