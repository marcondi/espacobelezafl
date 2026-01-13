import { StorageService } from './storageService';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface AuthSession {
  userId: string;
  name: string;
  email: string;
  isGuest: boolean;
}

const USERS_KEY = 'financas_all_users';
const SESSION_KEY = 'financas_session';

export class UserService {
  private static getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  private static saveAllUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  static signUp(name: string, email: string, password: string): { success: boolean; error?: string; userId?: string } {
    const users = this.getAllUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email já cadastrado' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAllUsers(users);

    return { success: true, userId: newUser.id };
  }

  static signIn(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    return { success: true, user };
  }

  static setSession(userId: string, name: string, email: string, isGuest: boolean = false): void {
    const session: AuthSession = { userId, name, email, isGuest };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  static loginAsGuest(): string {
    const guestId = crypto.randomUUID();
    this.setSession(guestId, 'Convidado', '', true);
    return guestId;
  }
}
