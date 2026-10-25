"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthContextType {
  user: any;
  loading: boolean;
  mounted: boolean;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: false, // Don't default to true to avoid full screen flash
  mounted: false,
  checkUser: async () => {},
  signOut: async () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read cached session synchronously from localStorage immediately to eliminate initial flicker!
  const getInitialUser = () => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem("aayup_admin_cached_user");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any }; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null }, error: null }), 1800)
      );

      const res = await Promise.race([sessionPromise, timeoutPromise]);
      const session = res?.data?.session;

      if (session?.user) {
        setUser(session.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("aayup_admin_cached_user", JSON.stringify(session.user));
          localStorage.setItem("aayup_admin_auth_token", session.access_token);
        }
      } else {
        if (typeof window !== "undefined") {
          const rawSb = localStorage.getItem("sb-auth-token");
          if (!rawSb) {
            setUser(null);
            localStorage.removeItem("aayup_admin_cached_user");
            localStorage.removeItem("aayup_admin_auth_token");
          }
        }
      }
    } catch (e) {
      console.warn("Auth check warning:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const cachedUser = getInitialUser();
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("aayup_admin_cached_user", JSON.stringify(session.user));
          localStorage.setItem("aayup_admin_auth_token", session.access_token);
        }
      } else if (_event === "SIGNED_OUT") {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("aayup_admin_cached_user");
          localStorage.removeItem("aayup_admin_auth_token");
          localStorage.removeItem("sb-auth-token");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("aayup_admin_cached_user");
        localStorage.removeItem("aayup_admin_auth_token");
        localStorage.removeItem("sb-auth-token");
      }
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, mounted, checkUser, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
