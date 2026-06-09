import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthSession {
  userId: string;
  email: string;
  expiresAt: number;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_REQUIRED'
  | 'PASSWORD_REQUIRED'
  | 'EMAIL_IN_USE'
  | 'USER_NOT_FOUND'
  | 'WEAK_PASSWORD'
  | 'SESSION_EXPIRED';

interface AuthContextProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  completePasswordReset: (email: string, newPassword: string) => Promise<void>;
  lastMessage: string | null;
  clearMessage: () => void;
}

const USERS_KEY = 'verba_auth_users';
const SESSION_KEY = 'verba_auth_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const DEMO_EMAIL = 'demo@verba.app';
const DEMO_PASSWORD = 'Verba2024';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const authError = (code: AuthErrorCode): Error => {
  const err = new Error(code);
  (err as Error & { code: AuthErrorCode }).code = code;
  return err;
};

const messageForError = (code: AuthErrorCode): string => {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Incorrect email or password. Please try again.';
    case 'EMAIL_REQUIRED':
      return 'Please enter your email address.';
    case 'PASSWORD_REQUIRED':
      return 'Please enter your password.';
    case 'EMAIL_IN_USE':
      return 'An account with this email already exists. Sign in instead.';
    case 'USER_NOT_FOUND':
      return 'No account found for that email address.';
    case 'WEAK_PASSWORD':
      return 'Password must be at least 6 characters.';
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const loadUsers = async (): Promise<StoredUser[]> => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredUser[];
    }

    const demoUser: StoredUser = {
      id: 'demo-user',
      name: 'Language Explorer',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
    return [demoUser];
  };

  const saveUsers = async (users: StoredUser[]) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const persistSession = async (storedUser: StoredUser) => {
    const session: AuthSession = {
      userId: storedUser.id,
      email: storedUser.email,
      expiresAt: Date.now() + SESSION_MS,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
    });
  };

  const restoreSession = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) {
        setUser(null);
        return;
      }

      const session = JSON.parse(raw) as AuthSession;
      if (session.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
        setLastMessage(messageForError('SESSION_EXPIRED'));
        return;
      }

      const users = await loadUsers();
      const match = users.find((u) => u.id === session.userId);
      if (!match) {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
        return;
      }

      setUser({
        id: match.id,
        name: match.name,
        email: match.email,
      });
    } catch (e) {
      console.error('[Auth] Failed to restore session', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) throw authError('EMAIL_REQUIRED');
    if (!password.trim()) throw authError('PASSWORD_REQUIRED');

    const users = await loadUsers();
    const match = users.find((u) => u.email === normalized);
    if (!match || match.password !== password) {
      throw authError('INVALID_CREDENTIALS');
    }

    await persistSession(match);
    setLastMessage(`Welcome back, ${match.name.split(' ')[0]}!`);
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const guestUser: StoredUser = {
        id: 'guest-user',
        name: 'Guest Explorer',
        email: 'guest@verba.app',
        password: 'guest-no-password',
      };
      // We don't save guest to users list, but we persist session
      await persistSession(guestUser);
      setLastMessage('Welcome, Guest! Enjoy exploring Verba.');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) throw authError('EMAIL_REQUIRED');
    if (!password.trim()) throw authError('PASSWORD_REQUIRED');
    if (password.length < 6) throw authError('WEAK_PASSWORD');

    const users = await loadUsers();
    if (users.some((u) => u.email === normalized)) {
      throw authError('EMAIL_IN_USE');
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Verba Learner',
      email: normalized,
      password,
    };

    await saveUsers([...users, newUser]);
    await persistSession(newUser);
    setLastMessage(`Account created. Welcome to Verba, ${newUser.name.split(' ')[0]}!`);
  };

  const logout = async (options?: { silent?: boolean }) => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
    if (!options?.silent) {
      setLastMessage('You have been signed out successfully.');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const normalized = normalizeEmail(email);
    if (!normalized) throw authError('EMAIL_REQUIRED');

    const users = await loadUsers();
    const exists = users.some((u) => u.email === normalized);
    if (!exists) throw authError('USER_NOT_FOUND');
    return true;
  };

  const completePasswordReset = async (email: string, newPassword: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) throw authError('EMAIL_REQUIRED');
    if (newPassword.length < 6) throw authError('WEAK_PASSWORD');

    const users = await loadUsers();
    const idx = users.findIndex((u) => u.email === normalized);
    if (idx < 0) throw authError('USER_NOT_FOUND');

    users[idx] = { ...users[idx], password: newPassword };
    await saveUsers(users);
    setLastMessage('Your password has been updated. You can sign in with your new password.');
  };

  const clearMessage = () => setLastMessage(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsGuest,
        signUp,
        logout,
        requestPasswordReset,
        completePasswordReset,
        lastMessage,
        clearMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: AuthErrorCode })?.code;
  if (code) return messageForError(code);
  if (error instanceof Error && error.message) return error.message;
  return messageForError('INVALID_CREDENTIALS');
};

export const showAuthAlert = (title: string, message: string) => {
  Alert.alert(title, message);
};
