import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canReset = useMemo(() => {
    // In the recovery flow, Supabase sets a temporary session
    return Boolean(session);
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Use pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Senhas diferentes', description: 'Confirme a mesma senha nos dois campos.', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: 'Senha atualizada!', description: 'Você já pode continuar usando o app.' });
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      toast({ title: 'Erro ao redefinir senha', description: e?.message ?? 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5 p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>
              {canReset
                ? 'Defina uma nova senha para sua conta.'
                : 'Abra o link de recuperação enviado ao seu email para continuar.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canReset ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button className="w-full" type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => navigate('/login', { replace: true })}>
                Voltar para o login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
