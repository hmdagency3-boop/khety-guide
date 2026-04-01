import { useState } from "react";
import { useLandmarks } from "@/hooks/useLandmarks";
import { Link } from "wouter";
import {
  ArrowRight, Star, MapPin, Sparkles,
  Landmark, Library, TreePine, ShoppingBag, MoonStar, Church,
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind,
  MessageSquareText, Map, Shield, Compass, Search,
} from "lucide-react";
import { LoadingScarab } from "@/components/LoadingScarab";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/components/NotificationBell";
import { BannerCarousel } from "@/components/BannerCarousel";
import { useWeather, useLocalTime } from "@/hooks/useWeather";

/* ── Weather icon ─────────────────────────────── */
function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className ?? "w-4 h-4";
  if (code === 0)  return <Sun className={cls} />;
  if (code <= 3)   return <Cloud className={cls} />;
  if (code <= 48)  return <Wind className={cls} />;
  if (code <= 67)  return <CloudRain className={cls} />;
  if (code <= 77)  return <CloudSnow className={cls} />;
  if (code <= 82)  return <CloudDrizzle className={cls} />;
  return <CloudLightning className={cls} />;
}

/* ── Categories ───────────────────────────────── */
const CATEGORIES = [
  { id: "ancient", key: "ancient", Icon: Landmark,    from: "#78350f", to: "#1c0a00", accent: "#fbbf24" },
  { id: "museum",  key: "museum",  Icon: Library,     from: "#44403c", to: "#0c0a09", accent: "#d6d3d1" },
  { id: "nature",  key: "nature",  Icon: TreePine,    from: "#14532d", to: "#052e16", accent: "#6ee7b7" },
  { id: "market",  key: "market",  Icon: ShoppingBag, from: "#7f1d1d", to: "#1a0000", accent: "#fca5a5" },
  { id: "mosque",  key: "mosque",  Icon: MoonStar,    from: "#134e4a", to: "#022c22", accent: "#5eead4" },
  { id: "church",  key: "church",  Icon: Church,      from: "#1e1b4b", to: "#0d0b2e", accent: "#a5b4fc" },
];

/* ── Quick actions ────────────────────────────── */
const QUICK = [
  { href: "/explore", Icon: Compass,           label: "nav.explore", color: "#d97706" },
  { href: "/map",     Icon: Map,               label: "nav.map",     color: "#3b82f6" },
  { href: "/chat",    Icon: MessageSquareText, label: "nav.chat",    color: "#8b5cf6" },
  { href: "/safety",  Icon: Shield,            label: "nav.safety",  color: "#10b981" },
];

/* ── Featured card ────────────────────────────── */
function FeaturedCard({ landmark, index }: { landmark: any; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 140, damping: 18 }}
      className="snap-start shrink-0"
    >
      <Link href={`/landmarks/${landmark.id}`} className="block group w-[190px]">
        <div className="relative w-[190px] h-[240px] rounded-3xl overflow-hidden shadow-xl shadow-black/50">
          {!imgError && landmark.image_url ? (
            <img
              src={landmark.image_url}
              alt={landmark.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-active:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
              <Landmark className="w-12 h-12 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
          <div className="absolute top-3 end-3 flex items-center gap-1 bg-black/55 backdrop-blur-sm px-2 py-1 rounded-full border border-amber-400/20">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-amber-300 text-[11px] font-bold">{landmark.rating?.toFixed(1)}</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-3.5">
            <h3 className="font-display font-black text-white text-[13px] leading-snug line-clamp-2 mb-1">
              {landmark.name}
            </h3>
            <div className="flex items-center gap-1 text-white/50 text-[11px]">
              <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate">{landmark.location?.city}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main ─────────────────────────────────────── */
export default function Home() {
  const { data: landmarks, isLoading } = useLandmarks();
  const { t } = useTranslation("t");
  const weather = useWeather();
  const { time, date } = useLocalTime(weather.data?.timezone ?? null);
  const featured = landmarks?.filter((l: any) => l.rating >= 4.5).slice(0, 8) || [];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-24">

      {/* ── Top bar ───────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        {/* Weather */}
        <div className="flex items-center gap-2 min-w-0">
          {weather.loading ? (
            <div className="h-8 w-28 bg-white/5 rounded-xl animate-pulse" />
          ) : weather.data ? (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-2.5 py-1.5">
              <WeatherIcon code={weather.data.weatherCode} className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-sm font-bold text-foreground">{weather.data.temp}°</span>
              <span className="text-[11px] text-muted-foreground truncate max-w-[75px]">
                {weather.data.city}
              </span>
            </div>
          ) : null}
        </div>

        {/* Time + Bell */}
        <div className="flex items-center gap-2.5 shrink-0">
          {time && (
            <div className="text-end leading-none">
              <div className="text-sm font-display font-black text-foreground tabular-nums">{time}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{date}</div>
            </div>
          )}
          <NotificationBell />
        </div>
      </div>

      {/* ── Search bar ────────────────────────── */}
      <div className="px-4 pb-4">
        <Link href="/explore">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-2xl px-4 py-3 hover:border-primary/25 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[13px] text-muted-foreground">
              {t("home.search_placeholder", "Search landmarks, cities…")}
            </span>
          </div>
        </Link>
      </div>

      {/* ── Quick actions ─────────────────────── */}
      <div className="px-4 pb-5">
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map(({ href, Icon, label, color }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
            >
              <Link href={href} className="block">
                <div className="flex flex-col items-center gap-2 py-3 rounded-2xl border border-white/6 bg-white/3 active:scale-95 transition-transform">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center leading-none">
                    {t(label, label.split(".")[1])}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Banner ────────────────────────────── */}
      <BannerCarousel />

      {/* ── Featured ──────────────────────────── */}
      <div className="pt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-display font-black text-foreground">
              {t("home.featured")}
            </span>
          </div>
          <Link href="/explore" className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
            {t("home.see_all")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <LoadingScarab message={t("common.loading")} />
        ) : (
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-1 -mx-4 px-4 snap-x snap-mandatory">
            {featured.map((l: any, i: number) => (
              <FeaturedCard key={l.id} landmark={l} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Categories ────────────────────────── */}
      <div className="pt-5 px-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-display font-black text-foreground">
            {t("home.explore_category", "Explore by Category")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 + 0.1, type: "spring", stiffness: 200, damping: 22 }}
            >
              <Link href={`/explore?category=${cat.id}`} className="block">
                <div
                  className="relative h-[84px] rounded-2xl overflow-hidden active:scale-95 transition-transform duration-150"
                  style={{
                    background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
                    border: `1px solid ${cat.accent}20`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cat.accent}15`, border: `1px solid ${cat.accent}25` }}
                    >
                      <cat.Icon style={{ width: 18, height: 18, color: cat.accent }} />
                    </div>
                    <span className="font-display font-bold text-[10px] text-center px-1 leading-none" style={{ color: `${cat.accent}cc` }}>
                      {t(`home.categories.${cat.key}`)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AI CTA ────────────────────────────── */}
      <div className="px-4 pt-5 pb-2">
        <Link href="/chat">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden border border-primary/15 p-4"
            style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 50%, transparent 100%)" }}
          >
            <div className="absolute -bottom-3 -end-1 text-[6rem] opacity-[0.05] leading-none select-none pointer-events-none text-primary">𓂀</div>
            <div className="relative flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute -top-1 -end-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">AI Assistant</span>
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-1.5 py-0.5">LIVE</span>
                </div>
                <h3 className="text-sm font-display font-black text-foreground">{t("home.ask_khety")}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t("home.ask_khety_sub", "Travel plans, history & insider tips")}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

    </div>
  );
}
