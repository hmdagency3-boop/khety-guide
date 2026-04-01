import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { signIn } = useAuth();
  const { t } = useTranslation("t");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    }
    // Navigation is handled automatically by AuthRoute when user state updates
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <img
              src="/khety-avatar.png"
              alt="Khety"
              className="w-20 h-20 object-cover rounded-full mx-auto mb-4 drop-shadow-xl border-2 border-primary/30"
            />
            <h1 className="text-2xl font-display font-black text-foreground">{t("auth.welcome_back")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("auth.sign_in_account")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t("auth.email")}</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 bg-card border-border/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t("auth.password")}</label>
              <div className="relative">
                {showPass ? (
                  <Input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-12 bg-card border-border/60 pr-11"
                  />
                ) : (
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-12 bg-card border-border/60 pr-11"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" /> {t("auth.sign_in")}</>}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.no_account")}{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t("auth.create_one")}
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-border/30 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("auth.continue_guest")} →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
