import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { MonthSummary, CategoryExpense } from '@/types';
import { Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialTipsProps {
  currentDate: Date;
  summary: MonthSummary;
  categoryExpenses: CategoryExpense[];
}

export default function FinancialTips({ currentDate, summary, categoryExpenses }: FinancialTipsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError(null);

      try {
        const monthLabel = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });

        const { data, error } = await supabase.functions.invoke<{
          tips?: string[];
          error?: string;
        }>('financial-tips', {
          body: {
            monthLabel,
            summary,
            categoryExpenses: categoryExpenses.map((c) => ({
              category: c.category,
              amount: c.amount,
            })),
          },
        });

        if (error) {
          console.error(error);
          setError(error.message ?? 'Não foi possível carregar as dicas no momento.');
          setTips([]);
          return;
        }

        if (data?.error) {
          setError(data.error);
          setTips([]);
          return;
        }

        setTips(data?.tips ?? []);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as dicas no momento.');
        setTips([]);
      } finally {
        setLoading(false);
      }
    };

    // Só chama a IA se houver algum movimento no mês
    if (summary.totalIncome > 0 || summary.totalExpense > 0) {
      fetchTips();
    } else {
      setTips([]);
      setError(null);
    }
  }, [currentDate, summary.totalIncome, summary.totalExpense, categoryExpenses.map(c => `${c.category}-${c.amount}`).join('|')]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Lightbulb className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Dicas financeiras com IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading && <p className="text-muted-foreground">Analisando seus gastos do mês...</p>}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && tips.length === 0 && (
          <p className="text-muted-foreground">
            Comece registrando suas receitas e despesas deste mês para receber dicas personalizadas de economia.
          </p>
        )}

        {!loading && !error && tips.length > 0 && (
          <ul className="list-disc space-y-1 pl-4">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
