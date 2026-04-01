import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ExternalLink, Download, Smartphone, CheckCircle2, Users, Zap, Gift } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export interface Banner {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  image_url: string | null;
  link_url: string | null;
  bg_from: string;
  bg_to: string;
  accent: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
}

const AUTO_PLAY_MS = 4500;

function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("sort_order")
      .then(({ data }) => {
        setBanners((data as Banner[]) || []);
        setReady(true);
      });
  }, []);

  return { banners, ready };
}

// ─── PWA Install Banner ────────────────────────────────────────────────────────
function InstallBanner({ onInstall, canInstall, isInstalled }: {
  onInstall: () => void;
  canInstall: boolean;
  isInstalled: boolean;
}) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canInstall) return;
    setInstalling(true);
    await onInstall();
    setInstalling(false);
  };

  return (
    <div className="relative h-40 rounded-3xl overflow-hidden border border-amber-500/20 shadow-xl shadow-black/40 select-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1005] via-[#2a1a08] to-[#0d0b06]" />

      {/* Grid deco */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#c9a84c 0,#c9a84c 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 1px,transparent 1px,transparent 32px)" }} />

      {/* Glow orb */}
      <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl" />
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-xl" />

      {/* Hieroglyphs deco */}
      <span className="absolute top-2 right-4 text-5xl opacity-[0.08] leading-none pointer-events-none text-amber-400">𓇳</span>
      <span className="absolute bottom-2 right-14 text-3xl opacity-[0.06] leading-none pointer-events-none text-amber-400">𓋹</span>

      {/* Icon */}
      <div className="absolute top-4 left-4">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg",
          isInstalled
            ? "bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20"
            : "bg-amber-500/20 border-amber-500/40 shadow-amber-500/20"
        )}>
          {isInstalled
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            : <Smartphone className="w-5 h-5 text-amber-400" />
          }
        </div>
      </div>

      {/* Dark scrim bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-amber-400">
            Khety · رفيق كيميت
          </p>
          <h3 className="text-sm font-display font-black text-white leading-tight">
            {isInstalled ? "التطبيق مثبّت على جهازك" : "حمّل التطبيق مجاناً"}
          </h3>
          <p className="text-[10px] text-white/60 mt-0.5 line-clamp-1">
            {isInstalled
              ? "رفيقك الذكي في رحلة أرض كيميت"
              : "تجربة أسرع وأفضل بدون إنترنت"
            }
          </p>
        </div>

        {!isInstalled && (
          <button
            onClick={handleInstall}
            disabled={!canInstall || installing}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95",
              canInstall
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 hover:bg-amber-400"
                : "bg-white/10 text-white/50 border border-white/10 cursor-default"
            )}
          >
            {installing ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{installing ? "جاري…" : canInstall ? "تنزيل" : "قريباً"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Invite Banner ────────────────────────────────────────────────────────────
function InviteBanner() {
  return (
    <Link href="/invite">
      <div className="relative h-40 rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-black/60 select-none cursor-pointer">

        {/* ── Base gradient ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e0a1f] via-[#180f2e] to-[#0a0614]" />

        {/* ── Radial light source top-left ── */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-28 h-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* ── Gold shimmer line ── */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

        {/* ── Diagonal rays ── */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(60deg, #c9a84c 0px, #c9a84c 1px, transparent 1px, transparent 28px)"
        }} />

        {/* ── Right decorative panel ── */}
        <div className="absolute top-0 right-0 bottom-0 w-[42%] flex flex-col items-center justify-center gap-1">
          {/* Coin */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="w-12 h-12 rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-300/15 to-transparent flex flex-col items-center justify-center">
                <span className="text-[9px] font-black tracking-widest text-amber-300/80 uppercase">نقطة</span>
                <span className="text-xl font-black text-amber-300 leading-none">50</span>
                <span className="text-[8px] text-amber-400/60">per invite</span>
              </div>
            </div>
            {/* Orbit dots */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400/70" />
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400/60" />
            <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-300/50" />
          </div>
          {/* Stars */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Zap key={i} className="w-2.5 h-2.5 text-amber-400/50 fill-amber-400/30" />
            ))}
          </div>
        </div>

        {/* ── Vertical divider ── */}
        <div className="absolute top-6 bottom-6 right-[42%] w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />

        {/* ── Hieroglyph watermark ── */}
        <span className="absolute -bottom-2 right-[42%] translate-x-1/2 text-7xl opacity-[0.05] leading-none pointer-events-none text-amber-300 select-none">𓂀</span>

        {/* ── Left content ── */}
        <div className="absolute inset-0 right-[42%] flex flex-col justify-center px-4 gap-2">
          {/* Badge */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30">
              <Gift className="w-2.5 h-2.5 text-violet-300" />
              <span className="text-[9px] font-bold tracking-wider text-violet-300 uppercase">دعوة</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-[15px] font-display font-black text-white leading-tight">
              ادعُ أصدقاءك
            </h3>
            <h3 className="text-[15px] font-display font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              واكسب نقاطاً ذهبية
            </h3>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
            <Users className="w-3 h-3 text-black" />
            <span className="text-[10px] font-black text-black tracking-wide">ابدأ الآن</span>
          </div>
        </div>

      </div>
    </Link>
  );
}

// ─── Main BannerCarousel ───────────────────────────────────────────────────────
export function BannerCarousel() {
  const { banners, ready } = useBanners();
  const { i18n } = useTranslation("t");
  const isRTL = i18n.language === "ar";
  const { canInstall, isInstalled, install } = usePWAInstall();

  const [idx, setIdx]             = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX                = useRef<number | null>(null);
  const isDragging                = useRef(false);

  // Total slides: install banner + invite banner + supabase banners
  const totalCount = 2 + banners.length;

  const go = useCallback((next: number, dir = 1) => {
    setDirection(dir);
    setIdx(next);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        setDirection(1);
        return (prev + 1) % totalCount;
      });
    }, AUTO_PLAY_MS);
  }, [totalCount]);

  const goNext = useCallback(() => {
    setDirection(1);
    setIdx(prev => (prev + 1) % totalCount);
    startTimer();
  }, [totalCount, startTimer]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIdx(prev => (prev - 1 + totalCount) % totalCount);
    startTimer();
  }, [totalCount, startTimer]);

  // Swipe / drag handlers (touch + mouse)
  const SWIPE_THRESHOLD = 40;

  const onDragStart = useCallback((x: number) => {
    dragStartX.current = x;
    isDragging.current = false;
  }, []);

  const onDragMove = useCallback((x: number) => {
    if (dragStartX.current === null) return;
    if (Math.abs(x - dragStartX.current) > 5) isDragging.current = true;
  }, []);

  const onDragEnd = useCallback((x: number) => {
    if (dragStartX.current === null) return;
    const delta = x - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else           goPrev();
  }, [goNext, goPrev]);

  useEffect(() => {
    if (totalCount < 2) return;
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalCount, startTimer]);

  if (!ready) return null;

  const isInstallSlide = idx === 0;
  const isInviteSlide  = idx === 1;
  const bannerIdx      = idx - 2;
  const banner         = (!isInstallSlide && !isInviteSlide) ? banners[bannerIdx] : null;

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: {                  x: 0,                         opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  // Regular banner content
  const regularContent = banner ? (
    <div className="relative h-40 rounded-3xl overflow-hidden border border-white/10 shadow-xl shadow-black/40 select-none">
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${banner.bg_from}, ${banner.bg_to})` }} />
      {banner.image_url && (
        <img src={banner.image_url} alt={isRTL && banner.title_ar ? banner.title_ar : banner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40" draggable={false} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <span className="absolute -top-3 -right-3 text-[6rem] opacity-[0.07] leading-none pointer-events-none"
        style={{ color: banner.accent }}>𓇳</span>
      <div className={cn("absolute bottom-0 left-0 right-0 p-4", isRTL ? "text-right" : "text-left")}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: banner.accent }}>
          Khety · رفيق كيميت
        </p>
        <h3 className="text-base font-display font-black text-white leading-tight line-clamp-1">
          {isRTL && banner.title_ar ? banner.title_ar : banner.title}
        </h3>
        {(isRTL ? banner.subtitle_ar : banner.subtitle) && (
          <p className="text-[11px] text-white/70 mt-0.5 line-clamp-1">
            {isRTL ? banner.subtitle_ar : banner.subtitle}
          </p>
        )}
        {banner.link_url && (
          <div className="flex items-center gap-1 mt-1.5" style={{ color: banner.accent }}>
            <ExternalLink className="w-3 h-3" />
            <span className="text-[10px] font-semibold">اعرف أكثر</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const slideKey = isInstallSlide ? "__install__" : isInviteSlide ? "__invite__" : banner!.id;

  return (
    <div className="px-5 pt-5">
      {/* Carousel */}
      <div
        className="relative overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing select-none"
        onTouchStart={e => onDragStart(e.touches[0].clientX)}
        onTouchMove={e => onDragMove(e.touches[0].clientX)}
        onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX)}
        onMouseDown={e => onDragStart(e.clientX)}
        onMouseMove={e => onDragMove(e.clientX)}
        onMouseUp={e => {
          if (!isDragging.current) {
            // it was a tap/click — advance normally
            if (totalCount > 1) { const next = (idx + 1) % totalCount; go(next, 1); startTimer(); }
          }
          onDragEnd(e.clientX);
        }}
        onMouseLeave={e => onDragEnd(e.clientX)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slideKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
          >
            {isInstallSlide ? (
              <InstallBanner
                onInstall={install}
                canInstall={canInstall}
                isInstalled={isInstalled}
              />
            ) : isInviteSlide ? (
              <InviteBanner />
            ) : banner?.link_url ? (
              banner.link_url.startsWith("/") ? (
                <Link href={banner.link_url}>{regularContent}</Link>
              ) : (
                <a href={banner.link_url} target="_blank" rel="noopener noreferrer">{regularContent}</a>
              )
            ) : (
              regularContent
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      {totalCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {Array.from({ length: totalCount }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); go(i, i > idx ? 1 : -1); startTimer(); }}
              className={cn(
                "rounded-full transition-all duration-300",
                i === idx
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
