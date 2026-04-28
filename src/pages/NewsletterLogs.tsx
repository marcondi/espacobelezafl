import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Send, Mail } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  is_active: boolean;
  created_at: string;
}

export default function NewsletterLogs() {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  // login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // logs
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // test send
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadSubscribers = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLoadingList(false);
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    } else {
      setSubscribers(data ?? []);
    }
  };

  useEffect(() => {
    if (session) loadSubscribers();
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error) {
      toast({ title: 'Falha no acesso', description: error.message, variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const sendTest = async (target?: string) => {
    const to = (target ?? testEmail).trim().toLowerCase();
    if (!to) {
      toast({ title: 'Informe um e-mail', variant: 'destructive' });
      return;
    }
    setSending(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-welcome', {
        body: { email: to },
      });
      if (error) throw error;
      setLastResult(data);
      toast({
        title: data?.success ? 'E-mails enviados ✅' : 'Envio parcial ⚠️',
        description: `Boas-vindas: ${data?.welcomeSent ? 'OK' : 'falhou'} · Notificação admin: ${data?.adminNotified ? 'OK' : 'falhou'}`,
      });
    } catch (err: any) {
      console.error(err);
      setLastResult({ error: err?.message ?? String(err) });
      toast({ title: 'Erro ao chamar função', description: err?.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Helmet>
          <title>Logs Newsletter — Acesso restrito</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Acesso restrito</h1>
              <p className="text-sm text-muted-foreground">Faça login para visualizar os logs da newsletter.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" disabled={loggingIn} className="w-full">
                {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Logs Newsletter — Studio Fernanda Lima</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Logs da Newsletter</h1>
            <p className="text-sm text-muted-foreground">Inscritos e teste de envio dos e-mails automáticos.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
        </header>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Testar envio</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Dispara a função <code className="bg-muted px-1 rounded">newsletter-welcome</code> com o e-mail informado.
            Envia (1) boas-vindas para o destinatário e (2) notificação para
            <code className="bg-muted px-1 rounded"> espacodebelezafernandalima@gmail.com</code>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="email-de-teste@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => sendTest()} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar teste'}
            </Button>
          </div>
          {lastResult && (
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          )}
          <p className="text-xs text-muted-foreground">
            ⚠️ Em modo sandbox do Resend (remetente <code>onboarding@resend.dev</code>), a entrega só funciona
            para o e-mail dono da conta Resend. Para enviar a qualquer destinatário, verifique um domínio próprio.
          </p>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Inscritos recentes ({subscribers.length})</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={loadSubscribers} disabled={loadingList}>
              <RefreshCw className={`h-4 w-4 ${loadingList ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {loadingList ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum inscrito ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">E-mail</th>
                    <th className="py-2 pr-3">Origem</th>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 break-all">{s.email}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{s.source ?? '—'}</td>
                      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                        {new Date(s.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => sendTest(s.email)} disabled={sending}>
                          Reenviar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
