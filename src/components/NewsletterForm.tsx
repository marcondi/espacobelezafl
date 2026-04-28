import { useState } from 'react';
import { z } from 'zod';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Informe seu e-mail' })
  .email({ message: 'E-mail inválido' })
  .max(255, { message: 'E-mail muito longo' });

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: 'Verifique seu e-mail',
        description: result.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Salva no banco
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: result.data.toLowerCase(), source: 'website_footer' });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Você já está inscrita! ✨',
            description: 'Este e-mail já recebe nossas novidades.',
          });
          setEmail('');
          return;
        }
        throw error;
      }

      // 2. Dispara e-mails via Edge Function
      const { error: fnError } = await supabase.functions.invoke('newsletter-welcome', {
        body: { email: result.data.toLowerCase() },
      });

      if (fnError) {
        console.error('Erro ao enviar e-mails:', fnError);
      }

      toast({
        title: 'Inscrição confirmada! 💖',
        description: 'Verifique sua caixa de entrada — enviamos um e-mail de boas-vindas.',
      });
      setEmail('');
    } catch (err) {
      console.error('Erro ao inscrever:', err);
      toast({
        title: 'Ops, algo deu errado',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <div className="relative flex-1 min-w-0 sm:min-w-[260px]">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/50" />
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          maxLength={255}
          required
          aria-label="E-mail para newsletter"
          className="pl-9 bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-primary"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="rounded-md gradient-primary border-0 text-primary-foreground font-semibold whitespace-nowrap"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Inscrever'
        )}
      </Button>
    </form>
  );
}
