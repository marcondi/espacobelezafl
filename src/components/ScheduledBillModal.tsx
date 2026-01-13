import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

interface ScheduledBillModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ScheduledBillModal({ open, onClose }: ScheduledBillModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    due_day: '',
    recurrence: 'monthly' as 'monthly' | 'yearly'
  });

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        due_day: '',
        recurrence: 'monthly'
      });
    }
  }, [open]);

  const loadCategories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense');
    if (data) setCategories(data as Category[]);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.description || !formData.amount || !formData.category_id || !formData.due_day) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    const dueDay = parseInt(formData.due_day);
    if (dueDay < 1 || dueDay > 31) {
      toast({
        title: 'Dia inválido',
        description: 'O dia de vencimento deve estar entre 1 e 31',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase.from('scheduled_bills').insert({
      user_id: user.id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      due_day: dueDay,
      recurrence: formData.recurrence,
      is_active: true
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Criado!', description: 'Conta agendada criada com sucesso.' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta Agendada</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Aluguel"
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
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dia de Vencimento</Label>
            <Input
              type="number"
              min="1"
              max="31"
              placeholder="5"
              value={formData.due_day}
              onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Recorrência</Label>
            <Select value={formData.recurrence} onValueChange={(v) => setFormData({ ...formData, recurrence: v as 'monthly' | 'yearly' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Criar Conta Agendada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
