import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ProfileSchema, logger, type Profile, type ProfileMode } from "shared";

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName?: string;
  phone: string;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileMode: (mode: ProfileMode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

      // No row (e.g. trigger didn't run) – create profile from user metadata
      if (error?.code === "PGRST116") {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const meta = authUser?.user_metadata ?? {};
        const { data: inserted, error: insertErr } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            display_name: meta.first_name ?? meta.display_name ?? authUser?.email ?? null,
            username: meta.username ?? null,
          })
          .select()
          .single();
        if (!insertErr && inserted) {
          const parsed = ProfileSchema.safeParse(inserted);
          if (parsed.success) {
            setProfile(parsed.data);
            return;
          }
          logger.error("Profile validation failed after insert", parsed.error);
          setProfile(null);
          return;
        }
      }

      if (error) {
        logger.error("Error loading profile", error.message ?? error);
        setProfile(null);
        return;
      }

      const parsed = ProfileSchema.safeParse(data);
      if (!parsed.success) {
        logger.error("Profile validation failed", parsed.error);
        setProfile(null);
        return;
      }

      setProfile(parsed.data);
    } catch (error) {
      logger.error("Error in loadProfile", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let timeoutId: ReturnType<typeof setTimeout>;

    const initAuth = async () => {
      try {
        timeoutId = setTimeout(() => setIsLoading(false), 2000);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error("Error getting session", error);
          setIsLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) await loadProfile(session.user.id);

        clearTimeout(timeoutId);
        setIsLoading(false);
      } catch (error) {
        logger.error("Auth init error", error);
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          username: payload.username,
          first_name: payload.firstName,
          last_name: payload.lastName ?? null,
          phone: payload.phone,
          gender: payload.gender,
        },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const setProfileMode = useCallback(
    async (mode: ProfileMode) => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ profile_mode: mode }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
    },
    [user, refreshProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        logout,
        refreshProfile,
        setProfileMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
