import { useRef, useState, type FormEvent } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAuth } from "../../../contexts/AuthContext";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const FEATURES = [
  "Unlimited quotes saved to the cloud",
  "Access from any device",
  "Client & status tracking",
  "PDF export",
];

interface AuthPageProps {
  onGuestContinue: () => void;
}

type Mode = "signin" | "signup";

export function AuthPage({ onGuestContinue }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const turnstileToken = useRef<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && TURNSTILE_SITE_KEY && !turnstileToken.current) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(name, email, password, turnstileToken.current ?? undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      turnstileToken.current = null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-background">
      {/* Branding panel */}
      <div
        className="hidden lg:flex lg:w-[420px] flex-col justify-between p-10 flex-shrink-0"
        style={{ background: "#0F1629" }}
      >
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-white/80" />
          <span className="text-white font-semibold tracking-tight">Presupuestador</span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
              Free account includes
            </p>
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#2563EB" }} />
                  <span className="text-white/80 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-white/20 text-xs">
          Your data is stored securely and never shared.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <FileText className="w-5 h-5 text-foreground" />
            <span className="font-semibold tracking-tight">Presupuestador</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "signin"
              ? "Sign in to your account to continue."
              : "Free forever. No credit card required."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition-colors"
                  style={{ "--tw-ring-color": "rgb(37 99 235 / 0.2)" } as React.CSSProperties}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition-colors"
                style={{ "--tw-ring-color": "rgb(37 99 235 / 0.2)" } as React.CSSProperties}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition-colors"
                style={{ "--tw-ring-color": "rgb(37 99 235 / 0.2)" } as React.CSSProperties}
              />
            </div>

            {mode === "signup" && TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => { turnstileToken.current = token; }}
                onExpire={() => { turnstileToken.current = null; }}
                options={{ theme: "light", size: "flexible" }}
              />
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-60"
              style={{ background: "#2563EB" }}
            >
              {loading
                ? mode === "signin" ? "Signing in…" : "Creating account…"
                : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); turnstileToken.current = null; }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <button
              type="button"
              onClick={onGuestContinue}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue as guest
            </button>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Limited to 3 quotes · data stays in this browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
