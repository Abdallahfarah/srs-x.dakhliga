import React, { useState, createContext, useContext, useEffect } from "react";
import { User, UserStatus } from "../types";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      setCurrentUser({
        id: data.id,
        name: data.full_name,
        username: data.username || "",
        email: data.email,
        role: data.role as "ADMIN" | "SUPER_ADMIN",
        status: data.status as UserStatus,
        phone: data.phone || "",
        avatar: "",
        createdDate: new Date(data.created_at).toLocaleDateString()
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    
    // 1. Transform username to internal identity if needed
    // If it doesn't already contain @, append our internal domain
    const email = identifier.includes('@') ? identifier : `${identifier.trim().toLowerCase()}@srs.local`;

    // 2. Perform Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || ''
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
