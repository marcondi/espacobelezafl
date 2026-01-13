import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category, TransactionType, RecurrenceType } from '@/types';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
}

export default function TransactionModal({ open, onClose, transaction }: TransactionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none' as RecurrenceType
  });

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: String(transaction.amount),
        category_id: transaction.category_id,
        date: transaction.date,
        recurrence: transaction.recurrence || 'none'
      });
      setActiveTab(transaction.type);
    } else {
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none'
      });
    }
  }, [transaction, open]);

  const loadCategories = async () => {
    if (!user) return;
    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id);
    if (data) setCategories(data as Category[]);
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.description || !formData.amount || !formData.category_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    const data = {
      user_id: user.id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      date: formData.date,
      type: activeTab,
      recurrence: formData.recurrence === 'none' ? null : formData.recurrence,
      recurrence_group_id: formData.recurrence !== 'none' ? crypto.randomUUID() : null
    };

    if (transaction) {
      const { error } = await supabase.from('transactions').update(data).eq('id', transaction.id);
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Atualizado!', description: 'Lançamento atualizado com sucesso.' });
    } else {
      const { error } = await supabase.from('transactions').insert(data);
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Criado!', description: 'Lançamento criado com sucesso.' });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Supermercado"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select value={formData.recurrence} onValueChange={(v) => setFormData({ ...formData, recurrence: v as RecurrenceType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {transaction ? 'Atualizar' : 'Criar'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
