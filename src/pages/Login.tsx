import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, TrendingUp } from 'lucide-react';

const REMEMBER_EMAIL_KEY = 'financas_remember_email';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [rememberEmail, setRememberEmail] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (remembered) {
      setRememberEmail(true);
      setLoginData((prev) => ({ ...prev, email: remembered }));
      setForgotEmail(remembered);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginData.email, loginData.password);

      if (rememberEmail) localStorage.setItem(REMEMBER_EMAIL_KEY, loginData.email);
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(signupData.email, signupData.password, signupData.name);
      setSignupData({ name: '', email: '', password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: 'Informe seu email', description: 'Digite o email para receber o link.', variant: 'destructive' });
      return;
    }

    try {
      setForgotLoading(true);
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo });
      if (error) throw error;

      toast({
        title: 'Email enviado',
        description: 'Se o email estiver cadastrado, você receberá um link para redefinir a senha.',
      });
      setForgotOpen(false);
    } catch (e: any) {
      toast({ title: 'Erro ao enviar email', description: e?.message ?? 'Tente novamente.', variant: 'destructive' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-success">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Controle Financeiro</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Gerencie suas finanças com inteligência
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Entre ou crie sua conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => {
                        const email = e.target.value;
                        setLoginData({ ...loginData, email });
                        setForgotEmail(email);
                      }}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-email"
                        checked={rememberEmail}
                        onCheckedChange={(v) => setRememberEmail(Boolean(v))}
                      />
                      <Label htmlFor="remember-email">Lembrar e-mail</Label>
                    </div>

                    <Button type="button" variant="link" className="px-0" onClick={() => setForgotOpen(true)}>
                      Esqueci minha senha
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Recuperar senha</DialogTitle>
                  <DialogDescription>
                    Enviaremos um link para você redefinir sua senha (se o email estiver cadastrado).
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <Button className="w-full" type="submit" disabled={forgotLoading}>
                    {forgotLoading ? 'Enviando...' : 'Enviar link'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

