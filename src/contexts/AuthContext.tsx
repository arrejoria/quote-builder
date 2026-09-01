import { createContext, useContext, type ReactNode } from "react";
import { useSession } from "../lib/auth-client";
import { authClient } from "../lib/auth-client";

interface AuthContextValue {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, turnstileToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const handleSignIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message ?? "Sign in failed");
  };

  const handleSignUp = async (name: string, email: string, password: string, turnstileToken?: string) => {
    const headers: Record<string, string> = {};
    if (turnstileToken) headers["x-turnstile-token"] = turnstileToken;
    const result = await authClient.signUp.email(
      { name, email, password },
      { headers }
    );
    if (result.error) throw new Error(result.error.message ?? "Sign up failed");
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: isPending,
        signIn: handleSignIn,
        signUp: handleSignUp as AuthContextValue["signUp"],
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
