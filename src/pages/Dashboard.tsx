import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet, Moon, Sun, Calendar, X } from 'lucide-react';
import { MonthSummary, Transaction, CategoryExpense } from '@/types';
import { TransactionService } from '@/services/transactionService';
import { CategoryService } from '@/services/categoryService';
import { ScheduledBillService } from '@/services/scheduledBillService';
import MonthSelector from '@/components/MonthSelector';
import TransactionsList from '@/components/TransactionsList';
import TransactionModal from '@/components/TransactionModal';
import ScheduleTab from '@/components/ScheduleTab';
import CategoriesTab from '@/components/CategoriesTab';
import ExpenseChart from '@/components/ExpenseChart';
import FinancialTips from '@/components/FinancialTips';

export default function Dashboard() {
  const { theme = 'system', setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  // Banner de agendamentos (dispensável e reseta ao mudar de mês)
  const monthKey = useMemo(
    () => `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
    [currentDate]
  );
  const [dismissedBannerMonthKey, setDismissedBannerMonthKey] = useState<string | null>(null);
  const [scheduleBanner, setScheduleBanner] = useState<{ unpaidCount: number; unpaidTotal: number } | null>(null);

  useEffect(() => {
    // reseta quando muda de mês
    setDismissedBannerMonthKey(null);
  }, [monthKey]);

  useEffect(() => {
    if (user) {
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    try {
      const year = currentDate.getFullYear();
      const month0 = currentDate.getMonth();
      const month1 = month0 + 1;

      const [txData, categories, bills, payments] = await Promise.all([
        TransactionService.getByMonth(user.id, year, month0),
        CategoryService.getAll(user.id),
        ScheduledBillService.getActiveBills(user.id),
        ScheduledBillService.getAllPayments(user.id),
      ]);

      setTransactions(txData);

      const income = txData.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

      setSummary({ totalIncome: income, totalExpense: expense, balance: income - expense });

      const expensesByCategory: Record<string, number> = {};
      txData
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const cat = categories.find(c => c.id === t.category_id);
          if (cat) expensesByCategory[cat.name] = (expensesByCategory[cat.name] || 0) + Number(t.amount);
        });

      const colors = [
        'hsl(var(--primary))',
        'hsl(var(--success))',
        'hsl(var(--destructive))',
        'hsl(var(--accent))',
        'hsl(158 64% 62%)',
        'hsl(0 72% 71%)',
      ];

      setCategoryExpenses(
        Object.entries(expensesByCategory).map(([category, amount], i) => ({
          category,
          amount,
          color: colors[i % colors.length],
        }))
      );

      // Banner: agendamentos do mês (somente mês atual)
      const now = new Date();
      const isCurrentMonth = year === now.getFullYear() && month0 === now.getMonth();

      if (!isCurrentMonth) {
        setScheduleBanner(null);
      } else {
        const monthPayments = payments.filter((p) => p.year === year && p.month === month1);
        const paidSet = new Set(monthPayments.filter((p) => p.is_paid).map((p) => p.scheduled_bill_id));

        const unpaid = bills.filter((b) => !paidSet.has(b.id));
        const unpaidTotal = unpaid.reduce((sum, b) => sum + Number(b.amount), 0);

        setScheduleBanner({ unpaidCount: unpaid.length, unpaidTotal });
      }
    } catch (e: any) {
      setScheduleBanner(null);
      toast({
        title: 'Erro ao carregar dados',
        description: e?.message ?? 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
    void loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/10">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle Financeiro</h1>
            <p className="text-muted-foreground">{user ? `Olá, ${user.name}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => void signOut()} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {scheduleBanner && dismissedBannerMonthKey !== monthKey && scheduleBanner.unpaidCount > 0 && (
          <Alert className="mb-6">
            <Calendar className="h-4 w-4" />
            <div className="flex items-start justify-between gap-4 w-full">
              <div>
                <AlertTitle>Agendamentos deste mês</AlertTitle>
                <AlertDescription>
                  Você tem {scheduleBanner.unpaidCount} conta(s) agendada(s) pendente(s), totalizando{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scheduleBanner.unpaidTotal)}.
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar banner"
                onClick={() => setDismissedBannerMonthKey(monthKey)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MonthSelector currentDate={currentDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-success/20 bg-gradient-to-br from-card to-success/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalIncome)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-gradient-to-br from-card to-destructive/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalExpense)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {categoryExpenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpenseChart data={categoryExpenses} />
                </CardContent>
              </Card>
            )}

            <FinancialTips currentDate={currentDate} summary={summary} categoryExpenses={categoryExpenses} />

            <div className="flex justify-center">
              <Button size="lg" onClick={handleAddTransaction} className="gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Lançamento
              </Button>
            </div>

            <TransactionsList transactions={transactions} onEdit={handleEditTransaction} onRefresh={() => void loadData()} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab currentDate={currentDate} onRefresh={() => void loadData()} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
        </Tabs>

        <TransactionModal open={isModalOpen} onClose={handleCloseModal} transaction={editingTransaction} />
      </div>
    </div>
  );
}
