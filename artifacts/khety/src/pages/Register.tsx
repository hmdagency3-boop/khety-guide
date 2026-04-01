import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { redeemInviteCode } from "@/hooks/useInvitations";
import { storeVipWelcome } from "@/components/VipWelcomeModal";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2, XCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type CodeStatus = "idle" | "checking" | "valid_vip" | "valid_invite" | "invalid";

interface VipValidationData {
  welcome_title: string;
  welcome_msg: string;
  welcome_glyph: string;
}

export default function Register() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { t } = useTranslation("t");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [refCode, setRefCode]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  const [codeStatus, setCodeStatus]       = useState<CodeStatus>("idle");
  const [vipData, setVipData]             = useState<VipValidationData | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read ?ref=CODE from URL or sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(search);
    const urlRef = params.get("ref");
    if (urlRef) {
      const up = urlRef.toUpperCase();
      setRefCode(up);
      sessionStorage.setItem("khety_ref", up);
    } else {
      const stored = sessionStorage.getItem("khety_ref");
      if (stored) setRefCode(stored);
    }
  }, [search]);

  // Validate code via RPC (works for anon) with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const code = refCode.trim().toUpperCase();
    if (!code) {
      setCodeStatus("idle");
      setVipData(null);
      return;
    }

    setCodeStatus("checking");
    setVipData(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error: rpcErr } = await supabase.rpc("validate_invite_code", { p_code: code });
        if (rpcErr) {
          console.error("[validate_invite_code] RPC error:", rpcErr.message, rpcErr);
          setCodeStatus("invalid");
          return;
        }
        if (!data) { setCodeStatus("invalid"); return; }

        console.log("[validate_invite_code] result:", data);

        if (data.type === "vip") {
          setCodeStatus("valid_vip");
          setVipData({
            welcome_title: data.welcome_title,
            welcome_msg:   data.welcome_msg,
            welcome_glyph: data.welcome_glyph,
          });
          return;
        }
        if (data.type === "invite") { setCodeStatus("valid_invite"); return; }
        setCodeStatus("invalid");
      } catch (ex) {
        console.error("[validate_invite_code] unexpected error:", ex);
        setCodeStatus("invalid");
      }
    }, 600);
  }, [refCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) { setError("كلمة المرور غير متطابقة"); return; }
    if (password.length < 6)  { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }

    const code = refCode.trim().toUpperCase();

    if (code && codeStatus === "invalid") {
      setError("الكود المُدخَل غير صالح أو منتهي — أزله أو أدخل كوداً صحيحاً للمتابعة");
      return;
    }
    if (code && codeStatus === "checking") {
      setError("جاري التحقق من الكود... انتظر لحظة ثم حاول مجدداً");
      return;
    }

    // Store VIP welcome NOW (before signUp) so modal dispatches immediately
    if (code && codeStatus === "valid_vip" && vipData) {
      storeVipWelcome({
        name:          displayName,
        welcome_title: vipData.welcome_title,
        welcome_msg:   vipData.welcome_msg,
        welcome_glyph: vipData.welcome_glyph,
      });
    }

    setLoading(true);
    const { error: signUpErr } = await signUp(email, password, displayName);
    if (signUpErr) {
      setLoading(false);
      setError(signUpErr);
      return;
    }

    // Redeem codes after successful signUp
    if (code) {
      if (codeStatus === "valid_vip") {
        // Fire in background — updates profile is_vip flag + increments counter
        (async () => { try { await supabase.rpc("check_vip_code", { p_code: code }); } catch {} })();
      } else {
        redeemInviteCode(code).catch(() => {});
      }
      sessionStorage.removeItem("khety_ref");
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/onboarding"), 1500);
  }

  // Code field UI helpers
  const codeStatusUI = (() => {
    if (!refCode.trim()) return null;
    switch (codeStatus) {
      case "checking":
        return { icon: <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />, text: "جاري التحقق...", color: "text-muted-foreground", border: "border-border/60" };
      case "valid_vip":
        return { icon: <Crown className="w-4 h-4 text-yellow-400" />, text: "كود VIP صالح ✓", color: "text-yellow-400", border: "border-yellow-400/50" };
      case "valid_invite":
        return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: "كود دعوة صالح ✓", color: "text-emerald-400", border: "border-emerald-400/50" };
      case "invalid":
        return { icon: <XCircle className="w-4 h-4 text-destructive" />, text: "كود غير صالح أو منتهي", color: "text-destructive", border: "border-destructive/50" };
      default:
        return null;
    }
  })();

  if (success) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-5xl mb-4">𓂀</div>
          <h1 className="text-2xl font-display font-black text-foreground">أهلاً، {displayName}!</h1>
          <p className="text-muted-foreground mt-2">تم إنشاء حسابك. جاري تحديد تفضيلاتك...</p>
          {refCode && (
            <p className="text-xs text-primary mt-2 font-semibold">تم تطبيق الكود ✓</p>
          )}
        </motion.div>
      </div>
    );
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
            <div className="text-4xl mb-3">𓅓</div>
            <h1 className="text-2xl font-display font-black text-foreground">{t("auth.create_account")}</h1>
            <p className="text-sm text-muted-foreground mt-1">Join Khety — your AI companion in Kemet</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t("auth.full_name")}</label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={t("auth.name_placeholder")}
                required
                className="h-12 bg-card border-border/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t("auth.email")}</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
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
                    placeholder="٦ أحرف على الأقل"
                    required
                    autoComplete="new-password"
                    className="h-12 bg-card border-border/60 pr-11"
                  />
                ) : (
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="٦ أحرف على الأقل"
                    required
                    autoComplete="new-password"
                    className="h-12 bg-card border-border/60 pr-11"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t("auth.confirm_password")}</label>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="أعد كتابة كلمة المرور"
                required
                className="h-12 bg-card border-border/60"
              />
            </div>

            {/* Invite / VIP code field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                كود الدعوة <span className="normal-case text-muted-foreground/60">(اختياري)</span>
              </label>
              <div className="relative">
                <Input
                  value={refCode}
                  onChange={e => setRefCode(e.target.value.toUpperCase())}
                  placeholder="أدخل الكود هنا"
                  maxLength={60}
                  className={`h-12 bg-card font-mono tracking-widest pr-10 transition-colors ${codeStatusUI?.border ?? "border-border/60"}`}
                />
                {codeStatusUI && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    {codeStatusUI.icon}
                  </span>
                )}
              </div>
              {codeStatusUI && (
                <p className={`text-[11px] mt-1 font-medium ${codeStatusUI.color}`}>
                  {codeStatusUI.text}
                </p>
              )}
              {codeStatus === "invalid" && (
                <button
                  type="button"
                  onClick={() => { setRefCode(""); setVipData(null); sessionStorage.removeItem("khety_ref"); }}
                  className="text-[11px] text-muted-foreground underline mt-0.5"
                >
                  إزالة الكود
                </button>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || (!!refCode.trim() && (codeStatus === "invalid" || codeStatus === "checking"))}
              className="w-full h-12 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : codeStatus === "checking" && refCode.trim()
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> جاري التحقق من الكود...</>
                  : <><UserPlus className="w-4 h-4 mr-2" /> {t("auth.create_account")}</>
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.already_account")}{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t("auth.sign_in_link")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
