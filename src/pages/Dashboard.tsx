import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MonthSummary, Transaction, CategoryExpense, Category } from '@/types';
import MonthSelector from '@/components/MonthSelector';
import TransactionsList from '@/components/TransactionsList';
import TransactionModal from '@/components/TransactionModal';
import ScheduleTab from '@/components/ScheduleTab';
import CategoriesTab from '@/components/CategoriesTab';
import ExpenseChart from '@/components/ExpenseChart';
import FinancialTips from '@/components/FinancialTips';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Load transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (txData) {
      setTransactions(txData as Transaction[]);

      const income = txData.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

      setSummary({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
      });

      // Calculate category expenses
      const { data: categories } = await supabase.from('categories').select('*').eq('user_id', user.id) as { data: Category[] | null };
      
      const expensesByCategory: Record<string, number> = {};
      txData.filter(t => t.type === 'expense').forEach(t => {
        const cat = categories?.find(c => c.id === t.category_id);
        if (cat) {
          expensesByCategory[cat.name] = (expensesByCategory[cat.name] || 0) + Number(t.amount);
        }
      });

      const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))', 'hsl(158 64% 62%)', 'hsl(0 72% 71%)'];
      
      setCategoryExpenses(
        Object.entries(expensesByCategory).map(([category, amount], i) => ({
          category,
          amount,
          color: colors[i % colors.length]
        }))
      );
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/10">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle Financeiro</h1>
            <p className="text-muted-foreground">
              {user ? `Olá, ${user.email}` : 'Modo convidado'}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MonthSelector
              currentDate={currentDate}
              onPrevious={handlePreviousMonth}
              onNext={handleNextMonth}
            />

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

            <FinancialTips
              currentDate={currentDate}
              summary={summary}
              categoryExpenses={categoryExpenses}
            />

            <div className="flex justify-center">
              <Button size="lg" onClick={handleAddTransaction} className="gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Lançamento
              </Button>
            </div>

            <TransactionsList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab currentDate={currentDate} onRefresh={loadData} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
        </Tabs>

        <TransactionModal
          open={isModalOpen}
          onClose={handleCloseModal}
          transaction={editingTransaction}
        />
      </div>
    </div>
  );
}
