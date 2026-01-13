import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/userService';
import { CategoryService } from '@/services/categoryService';

interface LocalUser {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const session = UserService.getSession();
    if (session) {
      setUser({
        id: session.userId,
        name: session.name,
        email: session.email,
        isGuest: session.isGuest
      });
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = UserService.signUp(name, email, password);

    if (!result.success) {
      toast({
        title: 'Erro ao cadastrar',
        description: result.error,
        variant: 'destructive'
      });
      throw new Error(result.error);
    }

    // Initialize default categories for new user
    if (result.userId) {
      CategoryService.getAll(result.userId); // This initializes defaults
    }

    toast({
      title: 'Conta criada!',
      description: 'Você já pode fazer login.'
    });
  };

  const signIn = async (email: string, password: string) => {
    const result = UserService.signIn(email, password);

    if (!result.success || !result.user) {
      toast({
        title: 'Erro ao entrar',
        description: result.error,
        variant: 'destructive'
      });
      throw new Error(result.error);
    }

    UserService.setSession(result.user.id, result.user.name, result.user.email, false);
    setUser({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      isGuest: false
    });

    // Initialize default categories if needed
    CategoryService.getAll(result.user.id);

    navigate('/dashboard');
  };

  const signInAsGuest = () => {
    const guestId = UserService.loginAsGuest();
    setUser({
      id: guestId,
      name: 'Convidado',
      email: '',
      isGuest: true
    });

    // Initialize default categories for guest
    CategoryService.getAll(guestId);

    navigate('/dashboard');
  };

  const signOut = () => {
    UserService.clearSession();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
