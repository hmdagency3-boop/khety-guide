import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type Profile, type TravelProfile } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  travelProfile: TravelProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  saveTravelProfile: (data: Omit<TravelProfile, "id" | "user_id" | "created_at" | "updated_at">) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [travelProfile, setTravelProfile] = useState<TravelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function fetchProfile(userId: string) {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data as Profile);
    setProfileLoading(false);
  }

  async function fetchTravelProfile(userId: string) {
    const { data } = await supabase
      .from("travel_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setTravelProfile(data as TravelProfile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchTravelProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchTravelProfile(session.user.id);
      } else {
        setProfile(null);
        setTravelProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName, display_name: displayName } },
    });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
      });
    }
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setTravelProfile(null);
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
      await fetchTravelProfile(user.id);
    }
  }

  async function updateProfile(updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, ...updates, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    if (!error) await fetchProfile(user.id);
    return { error: error?.message ?? null };
  }

  async function saveTravelProfile(data: Omit<TravelProfile, "id" | "user_id" | "created_at" | "updated_at">) {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("travel_profiles")
      .upsert({ ...data, user_id: user.id }, { onConflict: "user_id" });
    if (!error) await fetchTravelProfile(user.id);
    return { error: error?.message ?? null };
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, travelProfile, loading, profileLoading,
      signIn, signUp, signOut, updateProfile, refreshProfile, saveTravelProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
