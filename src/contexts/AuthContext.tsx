import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: { first_name?: string, last_name?: string }) => Promise<{ data: any, error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Setup auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer Supabase calls to prevent deadlocks
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use a simpler query that doesn't try to set role
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        
        // If the error is that the profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          // Create a new profile with known admin emails
          const knownAdminEmails = ['dotasava@abv.bg', 'admin@example.com'];
          const currentUserEmail = session?.user?.email || '';
          const isKnownAdmin = knownAdminEmails.includes(currentUserEmail);
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId,
              role: isKnownAdmin ? 'admin' : 'user'
            }])
            .select()
            .single();
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            setIsAdmin(false);
            setProfile(null);
            return;
          }
          
          setProfile(newProfile);
          setIsAdmin(isKnownAdmin);
          return;
        }
        
        setIsAdmin(false);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data);
        // Check if the user has the admin role in their profile
        setIsAdmin(data.role === 'admin');
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setIsAdmin(false);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData?: { first_name?: string, last_name?: string }) => {
    try {
      // Create the auth user - profile will be created automatically via database trigger
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || ''
          }
        }
      });
      
      if (response.error) throw response.error;
      
      return response;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, profile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
