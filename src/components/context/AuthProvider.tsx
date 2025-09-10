"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/api/client";
import { AuthContextType, AuthState, User } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await updateUserState(session);
        } else {
          setAuthState({ user: null, loading: false });
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setAuthState({ user: null, loading: false });
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await updateUserState(session);
      } else {
        setAuthState({ user: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserState = async (session: Session) => {
    try {
      // Get or create user profile
      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          // If table doesn't exist, create a temporary user object
          if (insertError.code === '42P01') { // Table doesn't exist
            const tempUser: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setAuthState({ user: tempUser, loading: false });
            return;
          }
          setAuthState({ user: null, loading: false });
          return;
        }
        profile = newProfile;
      } else if (error) {
        console.error("Error fetching profile:", error);
        // If table doesn't exist, create a temporary user object
        if (error.code === '42P01') { // Table doesn't exist
          const tempUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setAuthState({ user: tempUser, loading: false });
          return;
        }
        setAuthState({ user: null, loading: false });
        return;
      }

      if (!profile) {
        setAuthState({ user: null, loading: false });
        return;
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name || undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      setAuthState({ user, loading: false });
    } catch (error) {
      console.error("Error updating user state:", error);
      setAuthState({ user: null, loading: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "",
          },
        },
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
