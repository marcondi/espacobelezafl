import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { MigrationService } from '@/services/migrationService';

interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(u: User): AppUser {
  const nameFromMeta = (u.user_metadata as any)?.name as string | undefined;
  const email = u.email ?? '';
  const name = nameFromMeta?.trim() || (email ? email.split('@')[0] : 'Usuário');
  return { id: u.id, name, email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listener FIRST (prevents missing events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ? mapUser(nextSession.user) : null);

      // Avoid calling other auth/db methods inside callback
      if (event === 'SIGNED_IN' && nextSession?.user) {
        setTimeout(() => {
          MigrationService.migrateIfNeeded(nextSession.user.id).catch(() => {
            // Errors are already toasted inside the service when appropriate
          });
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) navigate('/dashboard');
      else navigate('/login');
    }
  }, [user, loading, navigate]);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    toast({
      title: 'Conta criada!',
      description: 'Você já pode entrar com seu email e senha.'
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    // navigation is handled by auth state listener
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const value = useMemo<AuthContextType>(() => ({ user, session, loading, signUp, signIn, signOut }), [user, session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
