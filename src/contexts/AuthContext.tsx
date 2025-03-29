import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: UserRole, companyName: string, nip: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Błąd podczas pobierania profilu:', error);
        setUser(null);
      } else {
        setUser(profile);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania profilu:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userType: UserRole, companyName: string, nip: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Użytkownik o podanym adresie email już istnieje');
      }

      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authUser?.id) throw new Error('Nie otrzymano ID użytkownika');

      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: email,
          user_type: userType,
          company_name: companyName,
          nip: nip,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Błąd podczas rejestracji:', error.message);
        throw new Error(error.message);
      }
      console.error('Wystąpił błąd podczas rejestracji:', error);
      throw new Error('Wystąpił błąd podczas rejestracji');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Błąd podczas logowania:', error.message);
        throw new Error(error.message);
      }
      console.error('Wystąpił błąd podczas logowania:', error);
      throw new Error('Wystąpił błąd podczas logowania');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Błąd podczas wylogowywania:', error.message);
        throw new Error(error.message);
      }
      console.error('Wystąpił błąd podczas wylogowywania:', error);
      throw new Error('Wystąpił błąd podczas wylogowywania');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth musi być używany wewnątrz AuthProvider');
  }
  return context;
}