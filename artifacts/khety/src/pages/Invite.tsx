import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvitations } from "@/hooks/useInvitations";
import { LoadingScarab } from "@/components/LoadingScarab";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Share2, MessageCircle, Users,
  Trophy, Zap, ArrowLeft, Gift, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// ─── Rank config (labels are i18n keys) ────────────────────────────────────────
const RANKS = [
  { pts: 0,   key: "novice",      glyph: "𓆙", color: "#9ca3af", gold: false },
  { pts: 50,  key: "spreader",    glyph: "𓅓", color: "#c9a84c", gold: true  },
  { pts: 100, key: "herald",      glyph: "𓃭", color: "#f97316", gold: false },
  { pts: 200, key: "ambassador",  glyph: "𓂀", color: "#eab308", gold: true  },
  { pts: 500, key: "pharaoh",     glyph: "𓇳", color: "#fbbf24", gold: true  },
] as const;

type RankKey = (typeof RANKS)[number]["key"];

function getRank(pts: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (pts >= RANKS[i].pts) return RANKS[i];
  }
  return RANKS[0];
}

function getNext(pts: number) {
  return RANKS.find(r => r.pts > pts) ?? null;
}

// ─── Animated number ───────────────────────────────────────────────────────────
function AnimNum({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {value}
    </motion.span>
  );
}

export default function Invite() {
  const { t } = useTranslation("t");
  const { user } = useAuth();
  const { invite_code, invite_points, invitees, loading } = useInvitations();
  const [copied, setCopied] = useState(false);

  const BASE = window.location.origin + (import.meta.env.BASE_URL || "/");
  const inviteLink = invite_code ? `${BASE}register?ref=${invite_code}` : "";

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      const el = document.createElement("textarea");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function shareNative() {
    if (!inviteLink) return;
    if (navigator.share) {
      await navigator.share({
        title: t("invite.share_title"),
        text: t("invite.share_text") + invite_code,
        url: inviteLink,
      });
    } else {
      copyLink();
    }
  }

  function shareWhatsApp() {
    if (!inviteLink) return;
    const text = encodeURIComponent(t("invite.whatsapp_text") + inviteLink);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (loading) return <LoadingScarab message={t("invite.loading")} />;

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-4">
        <span className="text-6xl">𓅓</span>
        <h1 className="text-xl font-display font-bold">{t("invite.login_required")}</h1>
        <p className="text-sm text-muted-foreground">{t("invite.login_required_desc")}</p>
        <Link href="/login">
          <button className="h-11 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
            {t("invite.login_btn")}
          </button>
        </Link>
      </div>
    );
  }

  const rank = getRank(invite_points);
  const next = getNext(invite_points);
  const progress = next ? Math.min(100, ((invite_points - rank.pts) / (next.pts - rank.pts)) * 100) : 100;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#09080f]">

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1230] via-[#110d20] to-[#09080f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_0%,rgba(201,168,76,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "repeating-linear-gradient(55deg,#c9a84c 0,#c9a84c 1px,transparent 1px,transparent 30px)"
        }} />
        <div className="absolute inset-0 flex items-start justify-center pt-2 pointer-events-none select-none overflow-hidden">
          <span className="text-[14rem] leading-none text-amber-400/[0.04] font-serif">𓇳</span>
        </div>

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-5 pt-6 pb-2">
          <Link href="/profile">
            <button className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/60">
            {t("invite.page_label")}
          </span>
          <div className="w-9" />
        </div>

        {/* Central stats */}
        <div className="relative flex flex-col items-center px-5 pt-4 pb-8 gap-5">

          {/* Coin */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-amber-400/10 blur-xl" />
            <div className="relative w-28 h-28 rounded-full border-2 border-amber-400/40 bg-gradient-to-br from-[#1f1600] to-[#0d0a00] shadow-2xl shadow-black/60 flex flex-col items-center justify-center">
              <div className="absolute inset-2 rounded-full border border-amber-400/20" />
              <span className="text-[9px] font-black tracking-widest text-amber-400/60 uppercase mb-0.5">
                {t("invite.points_label")}
              </span>
              <span className="text-4xl font-black text-amber-300 leading-none">
                <AnimNum value={invite_points} />
              </span>
              <span className="text-[9px] text-amber-400/40 mt-0.5">{rank.glyph}</span>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-full border border-dashed border-amber-400/10"
            />
          </div>

          {/* Rank badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-sm"
            style={{ background: `${rank.color}15`, borderColor: `${rank.color}35` }}>
            <Crown className="w-3.5 h-3.5" style={{ color: rank.color }} />
            <span className="text-[12px] font-black" style={{ color: rank.color }}>
              {t(`invite.ranks.${rank.key}`)}
            </span>
          </div>

          {/* Counters row */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">{invitees.length}</span>
              <span className="text-[10px] text-white/40">{t("invite.successful_invites")}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-amber-300">{invite_points}</span>
              <span className="text-[10px] text-white/40">{t("invite.earned_points")}</span>
            </div>
            {next && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white/40">{next.pts - invite_points}</span>
                  <span className="text-[10px] text-white/40">{t("invite.to_next_level")}</span>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          {next && (
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-[9px] text-white/30 font-semibold">
                <span>{t(`invite.ranks.${rank.key}`)}</span>
                <span>{t(`invite.ranks.${next.key}`)} ({next.pts} {t("invite.pts_suffix")})</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BODY
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 px-4 pb-10 space-y-4 pt-2">

        {/* ── Code Card ── */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-400/15 shadow-xl shadow-black/40">
          <div className="absolute inset-0 bg-gradient-to-br from-[#130f00] to-[#0d0a06]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white tracking-wide">{t("invite.your_code")}</span>
            </div>

            {/* Code + copy */}
            <div className="flex items-center gap-3">
              <div className="flex-1 py-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-center">
                <span className="text-3xl font-black tracking-[0.35em] text-amber-300 font-mono">
                  {invite_code ?? "——————"}
                </span>
              </div>
              <button
                onClick={copyLink}
                className={cn(
                  "w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-200 shrink-0",
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                    : "bg-amber-400/8 border-amber-400/25 hover:bg-amber-400/15"
                )}
              >
                <AnimatePresence mode="wait">
                  {copied
                    ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="w-5 h-5 text-amber-300" />
                      </motion.div>
                  }
                </AnimatePresence>
              </button>
            </div>

            {/* Reward hint */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-400/5 border border-amber-400/15">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/20" />
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                {t("invite.reward_hint_pre")} <span className="text-amber-400 font-black">+50 {t("invite.points_label")}</span> {t("invite.reward_hint_post")}
              </p>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={copyLink}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-95",
                  copied
                    ? "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-white/4 border-white/8 hover:bg-white/8"
                )}
              >
                {copied
                  ? <Check className="w-5 h-5 text-emerald-400" />
                  : <Copy className="w-5 h-5 text-white/60" />}
                <span className="text-[10px] font-bold text-white/50">{copied ? t("invite.copied") : t("invite.copy")}</span>
              </button>

              <button
                onClick={shareWhatsApp}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#128C7E]/15 border border-[#128C7E]/30 hover:bg-[#128C7E]/25 transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-[10px] font-bold text-[#25D366]/80">{t("invite.whatsapp")}</span>
              </button>

              <button
                onClick={shareNative}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 transition-all active:scale-95"
              >
                <Share2 className="w-5 h-5 text-violet-400" />
                <span className="text-[10px] font-bold text-violet-400/80">{t("invite.share")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-black text-white">{t("invite.how_it_works")}</span>
          </div>
          <div className="space-y-1">
            {([
              { n: "01", key: "step1", accent: "#c9a84c" },
              { n: "02", key: "step2", accent: "#818cf8" },
              { n: "03", key: "step3", accent: "#34d399" },
            ] as const).map(({ n, key, accent }, i) => (
              <div key={n} className="flex items-start gap-4 relative">
                {i < 2 && (
                  <div className="absolute right-[18px] top-8 bottom-0 w-px bg-white/5" />
                )}
                <div className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{ background: `${accent}10`, borderColor: `${accent}25` }}>
                  <span className="text-[10px] font-black" style={{ color: accent }}>{n}</span>
                </div>
                <p className="text-[12px] text-white/50 leading-relaxed pt-2.5">{t(`invite.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Milestones ── */}
        <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white">{t("invite.milestones")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {RANKS.filter(r => r.pts > 0).map(({ pts, key, glyph, color }) => {
              const reached = invite_points >= pts;
              const isCurrent = getRank(invite_points).pts === pts;
              return (
                <motion.div
                  key={pts}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-center transition-all",
                    reached
                      ? "border-opacity-40 shadow-lg"
                      : "border-white/5 bg-white/[0.02] opacity-40"
                  )}
                  style={reached ? {
                    background: `${color}08`,
                    borderColor: `${color}30`,
                    boxShadow: `0 0 20px ${color}08`,
                  } : {}}
                >
                  {isCurrent && (
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: color }} />
                  )}
                  <span className="text-2xl leading-none">{glyph}</span>
                  <div>
                    <p className="text-[11px] font-black leading-tight"
                      style={{ color: reached ? color : undefined }}>
                      {t(`invite.ranks.${key}`)}
                    </p>
                    <p className="text-[9px] text-white/30 mt-0.5">{pts} {t("invite.pts_suffix")}</p>
                  </div>
                  {reached && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Invitees list ── */}
        {invitees.length > 0 ? (
          <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">{t("invite.joined_via_you")}</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                {invitees.length}
              </span>
            </div>
            <div className="space-y-2">
              {invitees.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-black text-amber-300">
                      {(inv.display_name || "?").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">
                      {inv.display_name || t("invite.unknown_user")}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {new Date(inv.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    <Zap className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/20" />
                    <span className="text-[10px] font-black text-emerald-400">+50</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-10 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/8 flex items-center justify-center">
              <span className="text-3xl leading-none">𓆙</span>
            </div>
            <p className="text-[13px] font-semibold text-white/40">{t("invite.no_invitees")}</p>
            <p className="text-[11px] text-white/20">{t("invite.no_invitees_desc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
