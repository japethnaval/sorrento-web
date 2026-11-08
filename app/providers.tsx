"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  getAuthStatus,
  getServerAuthStatus,
  refreshAuth,
  signOutUser,
  subscribeAuth,
  type AuthStatus,
} from "@/lib/auth-store";

interface AuthContextValue {
  status: AuthStatus;
  refresh: () => Promise<AuthStatus>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useSyncExternalStore(
    subscribeAuth,
    getAuthStatus,
    getServerAuthStatus,
  );

  const value = useMemo(
    () => ({ status, refresh: refreshAuth, signOutUser }),
    [status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
