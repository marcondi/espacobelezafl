import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Category, TransactionType } from '@/types';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
}

export default function CategoryModal({ open, onClose, category }: CategoryModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as TransactionType
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type
      });
    } else {
      setFormData({
        name: '',
        type: 'expense'
      });
    }
  }, [category, open]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite o nome da categoria',
        variant: 'destructive'
      });
      return;
    }

    if (category) {
      const { error } = await supabase
        .from('categories')
        .update({ name: formData.name, type: formData.type })
        .eq('id', category.id);

      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Atualizado!', description: 'Categoria atualizada com sucesso.' });
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type
        });

      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Criado!', description: 'Categoria criada com sucesso.' });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Alimentação"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as TransactionType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {category ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
