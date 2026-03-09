import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  phone: string;
  points: number;
  role?: string; // ✅ أضفنا role كحقل اختياري
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (name: string, phone: string, password: string) => Promise<{ error: string | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  codeVerified: boolean;
  setCodeVerified: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const phoneToEmail = (phone: string) => `${phone.replace(/\s+/g, "")}@mroj.app`;

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data as Profile);
    }
  };

  // ✅ دالة checkAdmin المعدلة - بتجرب أكثر من مصدر
  const checkAdmin = async (userId: string) => {
    try {
      // 1. نجرب نجيب الـ role من جدول profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileData?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // 2. لو مفيش في profiles، نجرب من user metadata
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || user?.raw_user_meta_data?.role;
      
      if (role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // 3. لو لسه مفيش، نستخدم RPC كـ fallback (لو موجود)
      const { data: rpcData } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });
      
      setIsAdmin(!!rpcData);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  // ✅ دالة checkModerator المعدلة بنفس الطريقة
  const checkModerator = async (userId: string) => {
    try {
      // 1. نجرب نجيب الـ role من جدول profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileData?.role === 'moderator') {
        setIsModerator(true);
        return;
      }

      // 2. لو مفيش في profiles، نجرب من user metadata
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || user?.raw_user_meta_data?.role;
      
      if (role === 'moderator') {
        setIsModerator(true);
        return;
      }

      // 3. لو لسه مفيش، نستخدم RPC كـ fallback
      const { data: rpcData } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'moderator' });
      
      setIsModerator(!!rpcData);
    } catch (error) {
      console.error('Error checking moderator role:', error);
      setIsModerator(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          fetchProfile(session.user.id);
          checkAdmin(session.user.id);
          checkModerator(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsModerator(false);
        setCodeVerified(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
        checkModerator(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (name: string, phone: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: phoneToEmail(phone),
      password,
      options: { data: { name, phone } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (phone: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile, isAdmin, isModerator, codeVerified, setCodeVerified }}>
      {children}
    </AuthContext.Provider>
  );
};