import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, type UserFavorite, type UserVisited } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LoadingScarab } from "@/components/LoadingScarab";
import { useInvitations } from "@/hooks/useInvitations";
import { useSubscription } from "@/hooks/useSubscription";
import {
  LogOut, Edit3, X, Heart, CheckCircle2, MessageSquare,
  Globe, ChevronRight, Languages, Trash2,
  Shield, User2, Star, Map, LayoutDashboard, Trophy, Sparkles, Gift, Zap, Crown, Compass
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OfficialBadge } from "@/components/OfficialBadge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ProfileEditSheet from "@/components/ProfileEditSheet";

type RankKey = "pharaoh" | "wanderer" | "seeker" | "desert" | "novice";

function getExplorerRankKey(visitedCount: number): { key: RankKey; glyph: string; from: string; to: string; badge: string; glow: string } {
  if (visitedCount >= 10) return { key: "pharaoh", glyph: "𓇳", from: "#f59e0b", to: "#d97706", badge: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",   glow: "shadow-yellow-500/30" };
  if (visitedCount >= 6)  return { key: "wanderer", glyph: "𓂀", from: "#f97316", to: "#ea580c", badge: "from-orange-500/20 to-amber-500/10 border-orange-500/30",  glow: "shadow-orange-500/30" };
  if (visitedCount >= 3)  return { key: "seeker",   glyph: "𓃭", from: "#8b5cf6", to: "#7c3aed", badge: "from-violet-500/20 to-purple-500/10 border-violet-500/30", glow: "shadow-violet-500/30" };
  if (visitedCount >= 1)  return { key: "desert",   glyph: "𓅓", from: "#6366f1", to: "#4f46e5", badge: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",   glow: "shadow-indigo-500/30" };
  return                         { key: "novice",   glyph: "𓆙", from: "#94a3b8", to: "#64748b", badge: "from-slate-500/20 to-slate-500/10 border-slate-500/30",   glow: "shadow-slate-500/20" };
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

export default function Profile() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const [, navigate] = useLocation();
  const [editing, setEditing] = useState(false);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [visited,   setVisited]   = useState<UserVisited[]>([]);
  const [convCount, setConvCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "favorites" | "visited">("overview");
  const { invite_code, invite_points, invitees } = useInvitations();
  const subscription = useSubscription();
  const { t } = useTranslation("t");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_favorites").select("*").eq("user_id", user.id).then(({ data }) => setFavorites(data || []));
    supabase.from("user_visited").select("*").eq("user_id", user.id).then(({ data }) => setVisited(data || []));
    supabase.from("conversations").select("id").eq("user_id", user.id).then(({ data }) => setConvCount(data?.length || 0));
  }, [user]);

  async function removeFavorite(landmarkId: string) {
    if (!user) return;
    await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("landmark_id", landmarkId);
    setFavorites(f => f.filter(x => x.landmark_id !== landmarkId));
  }

  async function removeVisited(landmarkId: string) {
    if (!user) return;
    await supabase.from("user_visited").delete().eq("user_id", user.id).eq("landmark_id", landmarkId);
    setVisited(v => v.filter(x => x.landmark_id !== landmarkId));
  }

  async function handleSignOut() { await signOut(); navigate("/"); }

  if (loading) return <LoadingScarab message={t("common.loading")} />;

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    const FEATS = [
      { icon: Heart,         key: "feat_save",  color: "text-rose-400",    bg: "bg-rose-400/8",    border: "border-rose-400/15" },
      { icon: CheckCircle2,  key: "feat_track", color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/15" },
      { icon: MessageSquare, key: "feat_chat",  color: "text-blue-400",    bg: "bg-blue-400/8",    border: "border-blue-400/15" },
      { icon: Trophy,        key: "feat_rank",  color: "text-amber-400",   bg: "bg-amber-400/8",   border: "border-amber-400/15" },
    ];
    return (
      <div className="relative flex flex-col h-full items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none text-[18rem] leading-none">𓂀</div>
        <motion.div className="absolute top-20 right-8 text-6xl opacity-[0.04]" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity }}>𓇳</motion.div>
        <motion.div className="absolute bottom-32 left-6 text-5xl opacity-[0.04]" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>𓅓</motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center w-full max-w-[320px]">
          <div className="relative mb-7">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-3xl scale-150" />
            <motion.div
              className="relative w-24 h-24 rounded-full border-2 border-primary/40 bg-gradient-to-br from-primary/20 to-violet-900/40 flex items-center justify-center shadow-2xl shadow-primary/20"
              animate={{ boxShadow: ["0 0 20px rgba(99,102,241,0.2)", "0 0 40px rgba(99,102,241,0.35)", "0 0 20px rgba(99,102,241,0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <User2 className="w-10 h-10 text-primary/50" />
            </motion.div>
            <motion.div className="absolute -inset-3 rounded-full border border-dashed border-primary/20" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
          </div>

          <p className="text-[10px] tracking-[0.25em] text-primary/60 font-semibold uppercase mb-2">{t("nav.brand")}</p>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">{t("profile.join_community")}</h1>
          <p className="text-xs text-muted-foreground mb-8 leading-relaxed">{t("profile.join_subtitle")}</p>

          <div className="grid grid-cols-2 gap-2 mb-7 w-full">
            {FEATS.map(({ icon: Icon, key, color, bg, border }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className={cn("flex items-center gap-2.5 bg-card/50 border rounded-2xl px-3 py-2.5", border)}
              >
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium leading-tight">{t(`profile.${key}`)}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2.5 w-full">
            <Link href="/login" className="flex-1">
              <Button className="w-full h-11 rounded-2xl font-semibold text-sm shadow-lg shadow-primary/25">{t("profile.login_btn")}</Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="outline" className="w-full h-11 rounded-2xl border-primary/25 text-sm hover:bg-primary/8">{t("profile.register_btn")}</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  const displayName = profile?.display_name || t("profile.default_name");
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const rank = getExplorerRankKey(visited.length);
  const rankTitle = t(`profile.ranks.${rank.key}`);
  const rankPct = Math.min(100, (visited.length / 10) * 100);
  const isVip = (profile as any)?.is_vip === true;

  const TABS = [
    { id: "overview"  as const, label: t("profile.overview"),   emoji: "𓂀" },
    { id: "favorites" as const, label: t("profile.favorites"),  emoji: "𓃀", count: favorites.length },
    { id: "visited"   as const, label: t("profile.visited"),    emoji: "𓅓", count: visited.length },
  ];

  const STATS = [
    { label: t("profile.favorites"),    count: favorites.length, tab: "favorites" as const, from: "#f43f5e", to: "#e11d48",  icon: Heart,        iconCls: "text-rose-400" },
    { label: t("profile.visited"),      count: visited.length,   tab: "visited"   as const, from: "#10b981", to: "#059669",  icon: CheckCircle2, iconCls: "text-emerald-400" },
    { label: t("profile.conversations"),count: convCount,         tab: "overview"  as const, from: "#3b82f6", to: "#2563eb",  icon: MessageSquare,iconCls: "text-blue-400" },
  ];

  const QUICK_LINKS = [
    { href: "/explore",  labelKey: "quick_explore",  icon: Compass,       color: "text-amber-400",   bg: "from-amber-500/20 to-orange-500/10",  border: "border-amber-500/20" },
    { href: "/chat",     labelKey: "quick_chat",     icon: MessageSquare, color: "text-blue-400",    bg: "from-blue-500/20 to-indigo-500/10",   border: "border-blue-500/20" },
    { href: "/map",      labelKey: "quick_map",      icon: Map,           color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10",  border: "border-emerald-500/20" },
    { href: "/safety",   labelKey: "quick_safety",   icon: Shield,        color: "text-rose-400",    bg: "from-rose-500/20 to-pink-500/10",     border: "border-rose-500/20" },
    { href: "/guides",   labelKey: "quick_guide",    icon: Star,          color: "text-violet-400",  bg: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/20" },
    { href: "/invite",   labelKey: "quick_invite",   icon: Gift,          color: "text-primary",     bg: "from-primary/20 to-primary/10",       border: "border-primary/20" },
  ];

  const RANK_LADDER = [
    { glyph: "𓆙", key: "rank_short_novice",   needed: 0  },
    { glyph: "𓅓", key: "rank_short_desert",   needed: 1  },
    { glyph: "𓃭", key: "rank_short_seeker",   needed: 3  },
    { glyph: "𓂀", key: "rank_short_wanderer", needed: 6  },
    { glyph: "𓇳", key: "rank_short_pharaoh",  needed: 10 },
  ];

  function getRankProgress() {
    if (visited.length >= 10) return t("profile.rank_max");
    if (visited.length >= 6)  return t("profile.rank_to_pharaoh", { n: 10 - visited.length });
    if (visited.length >= 3)  return t("profile.rank_to_wanderer", { n: 6  - visited.length });
    if (visited.length >= 1)  return t("profile.rank_to_seeker",   { n: 3  - visited.length });
    return t("profile.rank_first");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0f0726] to-[#07051a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(99,102,241,0.12),transparent)]" />

        <motion.div className="absolute top-6 right-6 w-32 h-32 rounded-full bg-violet-600/8 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute -bottom-4 left-4 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl"
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} />

        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(55deg,#a78bfa 0,#a78bfa 1px,transparent 1px,transparent 32px)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

        <div className="relative px-5 pt-10 pb-6">
          {/* Top action row */}
          <div className="flex justify-between items-center mb-7">
            <div className="flex items-center gap-1.5">
              <span className="text-lg leading-none">𓇳</span>
              <span className="text-[10px] tracking-[0.2em] font-semibold text-violet-300/60 uppercase">{t("nav.brand")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {profile?.role === "admin" && (
                <Link href="/admin">
                  <motion.button whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 border border-white/15 text-white/80 text-[11px] font-semibold backdrop-blur-sm">
                    <LayoutDashboard className="w-3 h-3" /> {t("profile.admin_panel")}
                  </motion.button>
                </Link>
              )}
              {!editing ? (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 border border-white/15 text-white/80 text-[11px] font-semibold backdrop-blur-sm">
                  <Edit3 className="w-3 h-3" /> {t("profile.edit_btn")}
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 border border-rose-400/30 text-rose-300 text-[11px] font-semibold">
                  <X className="w-3 h-3" /> {t("profile.cancel")}
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300 text-[11px] font-semibold">
                <LogOut className="w-3 h-3" /> {t("profile.sign_out")}
              </motion.button>
            </div>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center">
            <motion.div className="relative mb-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <div className="absolute inset-0 rounded-full blur-2xl scale-150"
                style={{ background: `radial-gradient(circle, ${rank.from}33, transparent)` }} />
              <motion.div className="absolute -inset-3 rounded-full border border-dashed border-violet-400/25"
                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
              {[0, 72, 144, 216, 288].map(deg => (
                <motion.div key={deg} className="absolute w-1.5 h-1.5 rounded-full bg-violet-400/60"
                  style={{ top: "50%", left: "50%", transform: `rotate(${deg}deg) translateX(42px) translateY(-50%)` }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2.5, delay: deg / 360 * 2, repeat: Infinity }}
                />
              ))}
              <motion.div
                className="relative w-[82px] h-[82px] rounded-full border-2 overflow-hidden shadow-2xl"
                style={{ borderColor: rank.from }}
                animate={{ boxShadow: [`0 0 20px ${rank.from}44`, `0 0 40px ${rank.from}66`, `0 0 20px ${rank.from}44`] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${rank.from}33, ${rank.to}22)` }} />
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/80">{initials}</span>
                  </div>
                )}
              </motion.div>
              {isVip ? (
                <motion.div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/40"
                  animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Crown className="w-3 h-3 text-black" />
                </motion.div>
              ) : (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border border-violet-300/30 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-display font-bold text-white leading-tight">
                {displayName}
              </h1>
              {profile?.is_verified && (
                <VerifiedBadge size={20} />
              )}
              {(profile as any)?.is_official && (
                <OfficialBadge size="md" />
              )}
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[11px] text-white/40 mt-0.5 mb-3">{user.email}</motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
              className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-gradient-to-r text-xs font-bold shadow-lg", rank.badge, rank.glow)}>
              <span className="text-base leading-none">{rank.glyph}</span>
              <span className="text-white/90">{rankTitle}</span>
              {isVip && <span className="text-[9px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.5 rounded-full font-black tracking-wider">VIP</span>}
            </motion.div>

            {(profile?.country || profile?.bio) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5">
                {profile?.country && (
                  <span className="flex items-center gap-1 text-[11px] text-white/40">
                    <Globe className="w-3 h-3 text-violet-400/60" /> {profile.country}
                  </span>
                )}
                {profile?.bio && (
                  <span className="text-[11px] text-white/30 italic line-clamp-1 max-w-[200px]">
                    "{profile.bio}"
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mt-6">
            {STATS.map(({ label, count, tab, from, to, icon: Icon, iconCls }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex flex-col items-center py-3.5 rounded-2xl border transition-all overflow-hidden",
                  activeTab === tab ? "border-white/20 bg-white/8" : "border-white/8 bg-white/4 hover:bg-white/7"
                )}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
                )}
                <Icon className={cn("w-4 h-4 mb-1.5", activeTab === tab ? iconCls : "text-white/30")} />
                <span className={cn("text-lg font-black leading-none", activeTab === tab ? "text-white" : "text-white/60")}>
                  <CountUp value={count} />
                </span>
                <span className="text-[10px] text-white/35 mt-1 font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 shrink-0">
        <div className="flex bg-card/60 border border-border/30 rounded-2xl p-1 gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <span className="text-sm leading-none">{tab.emoji}</span>
              {tab.label}
              {(tab as any).count !== undefined && (tab as any).count > 0 && (
                <span className={cn("min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/15 text-primary")}>
                  {(tab as any).count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 pt-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ── Overview ─────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">

              {/* Rank progress card */}
              <div className="p-4 bg-card rounded-2xl border border-border/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-foreground">{t("profile.explorer_rank")}</span>
                  </div>
                  <span className="text-xs font-black" style={{ color: rank.from }}>{rankTitle}</span>
                </div>

                <div className="h-2 bg-muted/40 rounded-full overflow-hidden mb-2 relative">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${rankPct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    style={{ background: `linear-gradient(90deg, ${rank.from}, ${rank.to})` }}
                  >
                    <motion.div className="absolute inset-0 opacity-50"
                      style={{ background: "linear-gradient(90deg, transparent, white, transparent)", backgroundSize: "200% 100%" }}
                      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>

                <p className="text-[11px] text-muted-foreground">{getRankProgress()}</p>

                <div className="flex justify-between mt-3 pt-3 border-t border-border/30">
                  {RANK_LADDER.map(({ glyph, key, needed }) => (
                    <div key={key} className={cn("flex flex-col items-center gap-0.5", visited.length >= needed ? "opacity-100" : "opacity-25")}>
                      <span className="text-base leading-none">{glyph}</span>
                      <span className="text-[8px] text-muted-foreground">{t(`profile.${key}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscription card */}
              <Link href={subscription.isActive ? "/subscription" : "/pricing"}>
                <motion.div whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 p-4 rounded-2xl border border-yellow-500/25 overflow-hidden cursor-pointer group">
                  <div className={cn("absolute inset-0", subscription.isActive ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/5" : "bg-gradient-to-r from-amber-500/8 to-orange-500/5")} />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-500/25 to-amber-600/20 border border-yellow-500/25 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground">
                      {subscription.isActive
                        ? t("pricing.current_plan") + " " + t(`pricing.${subscription.tier}.name`)
                        : t("pricing.subscribe")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {subscription.isActive
                        ? t("pricing.manage")
                        : t("pricing.subtitle").slice(0, 45) + "…"}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    {subscription.isActive ? (
                      <span className="text-[10px] bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold capitalize">
                        {subscription.tier}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </motion.div>
              </Link>

              {/* Invite card */}
              <Link href="/invite">
                <motion.div whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 p-4 rounded-2xl border border-primary/25 overflow-hidden cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-violet-500/5" />
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))" }} />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/25 to-violet-600/20 border border-primary/25 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground">{t("profile.invite_friends")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {invitees.length > 0
                        ? t("profile.invite_success", { count: invitees.length, points: invite_points })
                        : t("profile.invite_subtitle")}
                    </p>
                  </div>
                  <div className="relative flex items-center gap-2 shrink-0">
                    {invite_points > 0 && (
                      <motion.div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/20"
                        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400">{invite_points}</span>
                      </motion.div>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              </Link>

              {/* Quick links */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">{t("profile.quick_access")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_LINKS.map(({ href, labelKey, icon: Icon, color, bg, border }, i) => (
                    <Link key={`${href}-${labelKey}`} href={href}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.94 }}
                        className={cn("flex flex-col items-center gap-2 p-3 bg-card rounded-xl border transition-all cursor-pointer", border, "hover:scale-[1.03]")}
                      >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br", bg)}>
                          <Icon className={cn("w-4 h-4", color)} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight">{t(`profile.${labelKey}`)}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Language card */}
              <div className="p-4 bg-card rounded-2xl border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-bold text-foreground">{t("profile.language_label")}</span>
                </div>
                <LanguageSwitcher compact />
              </div>

              {/* Member since */}
              <div className="flex items-center gap-3 p-3.5 bg-card rounded-2xl border border-border/30">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <span className="text-base leading-none">𓂀</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">{t("profile.member_since")}</p>
                  <p className="text-xs font-bold text-foreground">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">{t("profile.status_active")}</span>
              </div>
            </motion.div>
          )}

          {/* ── Favorites ────────────────────────────────────────────────────── */}
          {activeTab === "favorites" && (
            <motion.div key="favorites" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
                {t("profile.favorites_header")} · {favorites.length}
              </p>
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                    className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500/15 to-pink-500/8 border border-rose-500/20 flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-rose-400/50" />
                  </motion.div>
                  <p className="text-sm font-bold text-foreground mb-1">{t("profile.no_favorites")}</p>
                  <p className="text-xs text-muted-foreground mb-5 max-w-[200px] leading-relaxed">{t("profile.no_favorites_desc")}</p>
                  <Link href="/explore">
                    <Button size="sm" className="rounded-xl px-6 h-9 text-xs bg-gradient-to-r from-rose-500 to-pink-600 border-0">{t("profile.start_exploring")}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((fav, i) => (
                    <motion.div key={fav.id} layout
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3.5 py-3 bg-card rounded-xl border border-border/25 hover:border-rose-400/20 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/8 border border-rose-500/15 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-rose-400 fill-rose-400/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground capitalize truncate">{fav.landmark_id.replace(/-/g, " ")}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(fav.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Link href={`/landmarks/${fav.landmark_id}`}>
                          <button className="w-7 h-7 rounded-lg bg-primary/8 hover:bg-primary/15 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </Link>
                        <button onClick={() => removeFavorite(fav.landmark_id)}
                          className="w-7 h-7 rounded-lg bg-destructive/8 hover:bg-destructive/15 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Visited ──────────────────────────────────────────────────────── */}
          {activeTab === "visited" && (
            <motion.div key="visited" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
                {t("profile.visited_header")} · {visited.length}
              </p>
              {visited.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                    className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/8 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400/50" />
                  </motion.div>
                  <p className="text-sm font-bold text-foreground mb-1">{t("profile.no_visited")}</p>
                  <p className="text-xs text-muted-foreground mb-5 max-w-[200px] leading-relaxed">{t("profile.no_visited_desc")}</p>
                  <Link href="/explore">
                    <Button size="sm" className="rounded-xl px-6 h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 border-0">{t("profile.start_exploring")}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {visited.map((v, i) => (
                    <motion.div key={v.id} layout
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3.5 py-3 bg-card rounded-xl border border-border/25 hover:border-emerald-400/20 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/8 border border-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground capitalize truncate">{v.landmark_id.replace(/-/g, " ")}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(v.visited_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Link href={`/landmarks/${v.landmark_id}`}>
                          <button className="w-7 h-7 rounded-lg bg-primary/8 hover:bg-primary/15 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </Link>
                        <button onClick={() => removeVisited(v.landmark_id)}
                          className="w-7 h-7 rounded-lg bg-destructive/8 hover:bg-destructive/15 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Profile edit sheet */}
      <ProfileEditSheet
        open={editing}
        onClose={() => setEditing(false)}
        profile={profile}
        userId={user.id}
        updateProfile={updateProfile}
      />
    </div>
  );
}
