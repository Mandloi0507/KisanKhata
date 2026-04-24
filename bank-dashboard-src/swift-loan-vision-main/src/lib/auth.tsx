import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { loginAPI, registerAPI, logoutAPI, saveTokens, clearTokens } from "./api";

export interface Banker {
  name: string;
  email: string;
  branch: string;
  initials: string;
  bank_name?: string;
}

interface AuthCtx {
  banker: Banker | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, branch: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "kk_banker_session";

function toBanker(data: any): Banker {
  const name = data.full_name || data.name || "Banker";
  const initials = name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase() || "B";
  return {
    name,
    email: data.email,
    branch: data.branch || data.bank_name || "Branch",
    bank_name: data.bank_name,
    initials,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [banker, setBanker] = useState<Banker | null>(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const persist = (b: Banker | null) => {
    setBanker(b);
    if (b) localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    // Call real backend API
    const response = await loginAPI(email, password);
    // Save JWT tokens
    saveTokens({ access_token: response.access_token, refresh_token: response.refresh_token });
    // Save banker profile
    persist(toBanker(response.officer));
  };

  const signUp: AuthCtx["signUp"] = async (name, email, password, branch) => {
    // Register via backend API
    await registerAPI(name, email, password, branch);
    // Then auto-login
    await signIn(email, password);
  };

  const signOut = () => {
    logoutAPI().catch(() => {});
    clearTokens();
    persist(null);
  };

  return <Ctx.Provider value={{ banker, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { banker } = useAuth();
  const loc = useLocation();
  if (!banker) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
