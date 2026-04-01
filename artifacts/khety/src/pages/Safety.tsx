import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldAlert, Phone, AlertTriangle, Scale, ChevronDown,
  Shield, Siren, Flame, Stethoscope, Building2, Globe,
  CheckCircle2, XCircle, LightbulbIcon, Sun, Shirt, Banknote, Car,
  Search, HeartPulse, Droplets, Utensils, Bug, Zap, Info,
  Clock, ExternalLink, ChevronRight, TriangleAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  useGetEmergencyContacts,
  useGetCommonScams,
  useGetTouristRights,
  type EmergencyContact,
  type CommonScam,
  type TouristRight,
} from "@workspace/api-client-react";

const CONTACT_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Tourist Police":             { icon: Shield,      color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/25" },
  "Ambulance":                  { icon: Stethoscope, color: "text-red-400",     bg: "bg-red-500/10 border-red-500/25" },
  "Fire Department":            { icon: Flame,       color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/25" },
  "Police":                     { icon: Siren,       color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/25" },
  "Egyptian Tourism Authority": { icon: Globe,       color: "text-primary",     bg: "bg-primary/10 border-primary/25" },
  "Hurghada Hospital":          { icon: Building2,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
  "Cairo International Hospital":{ icon: Building2,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
};

const SEVERITY_STYLE = {
  high:   { dot: "bg-red-500",    ring: "ring-red-500/30",    badge: "bg-red-500/15 text-red-400 border-red-500/30",    bar: "bg-red-500",    label: "text-red-400" },
  medium: { dot: "bg-amber-500",  ring: "ring-amber-500/30",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", bar: "bg-amber-500", label: "text-amber-400" },
  low:    { dot: "bg-emerald-500",ring: "ring-emerald-500/30",badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", bar: "bg-emerald-500", label: "text-emerald-400" },
};

const TRAVEL_TIPS_META = [
  { key: "timing",    icon: Sun,          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  { key: "dress",     icon: Shirt,        color: "text-primary",     bg: "bg-primary/10 border-primary/20" },
  { key: "money",     icon: Banknote,     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "transport", icon: Car,          color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "etiquette", icon: LightbulbIcon,color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "sites",     icon: Zap,          color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
];

const HEALTH_TIPS_META = [
  { key: "water",       icon: Droplets,  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "food",        icon: Utensils,  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  { key: "heat",        icon: Sun,       color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { key: "insects",     icon: Bug,       color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "medical",     icon: HeartPulse,color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/20" },
  { key: "electricity", icon: Zap,       color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
];

function ContactSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="rounded-2xl border border-border/50 p-4 flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-7 w-14" />
        </div>
      ))}
    </div>
  );
}

function ScamCard({ scam, riskLabel, howToStaySafe }: {
  scam: { id: string; title: string; description: string; howToAvoid: string; severity: string };
  riskLabel: string;
  howToStaySafe: string;
}) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_STYLE[scam.severity as keyof typeof SEVERITY_STYLE] || SEVERITY_STYLE.low;

  return (
    <motion.div layout className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot} shadow-sm ring-4 ${cfg.ring}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground leading-snug">{scam.title}</h3>
            <span className={cn("text-[10px] uppercase tracking-wider shrink-0 border px-2 py-0.5 rounded-full font-bold", cfg.badge)}>
              {riskLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{scam.description}</p>
        </div>
        <div className="shrink-0 text-muted-foreground mt-0.5 ml-1">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px bg-border/40" />
              <div className="flex gap-2.5">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{scam.description}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">{howToStaySafe}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{scam.howToAvoid}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RightCard({ right, idx, label }: {
  right: { id: string; title: string; description: string; icon?: string };
  idx: number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
    >
      <Card className="border-border/60 overflow-hidden hover:border-border/80 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{label}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground leading-snug mb-2">{right.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{right.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Safety() {
  const { user, profile } = useAuth();
  const { t } = useTranslation("t");
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);
  const [scamSearch, setScamSearch] = useState("");
  const [scamFilter, setScamFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const { data: contactsData, isLoading: contactsLoading } = useGetEmergencyContacts();
  const { data: scamsData,    isLoading: scamsLoading }    = useGetCommonScams();
  const { data: rightsData,   isLoading: rightsLoading }   = useGetTouristRights();

  const filteredScams = useMemo(() => {
    if (!scamsData) return [];
    return scamsData.filter((s: CommonScam) => {
      const matchFilter = scamFilter === "all" || s.severity === scamFilter;
      const matchSearch = !scamSearch || s.title.toLowerCase().includes(scamSearch.toLowerCase()) || s.description.toLowerCase().includes(scamSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [scamsData, scamSearch, scamFilter]);

  async function handleSOS() {
    if (sosSending) return;
    setSosSending(true);
    setSosError(null);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {}

    try {
      const sosEmail = user?.email || "anonymous@sos.khety";
      const sosName  = profile?.display_name || user?.email || "SOS User";
      const sosToken = crypto.randomUUID();

      await supabase.from("support_chats").insert({
        chat_token: sosToken,
        user_id: user?.id || null,
        user_email: sosEmail,
        user_name: `🆘 SOS — ${sosName}`,
        user_latitude: latitude ?? null,
        user_longitude: longitude ?? null,
        user_device: /mobile/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        user_os: navigator.platform,
        user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "open",
        last_message: "🆘 SOS Emergency Request",
        last_message_at: new Date().toISOString(),
        unread_admin: 1,
      });

      await supabase.rpc("send_support_message_by_token", {
        p_token: sosToken,
        p_content: `🆘 SOS Emergency!\n\nName: ${sosName}\nEmail: ${sosEmail}${latitude ? `\nLocation: https://maps.google.com/?q=${latitude},${longitude}` : ""}`,
        p_sender_name: sosName,
      });

      setSosSent(true);
    } catch {
      setSosError(t("safety.sos_error_msg"));
    }

    setSosSending(false);
    window.location.href = "tel:126";
  }

  const getRiskLabel = (severity: string) => {
    if (severity === "high") return t("safety.risk_high");
    if (severity === "medium") return t("safety.risk_medium");
    return t("safety.risk_low");
  };

  const QUICK_CONTACTS = [
    { label: t("safety.tourist_police"), value: "126", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { label: t("safety.ambulance"),      value: "123", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { label: t("safety.fire"),           value: "180", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  ];

  const TABS = [
    { value: "contacts", icon: Phone,        label: t("safety.tabs.sos") },
    { value: "scams",    icon: AlertTriangle, label: t("safety.tabs.scams") },
    { value: "rights",   icon: Scale,         label: t("safety.tabs.rights") },
    { value: "tips",     icon: LightbulbIcon, label: t("safety.tabs.tips") },
    { value: "health",   icon: HeartPulse,    label: t("safety.tabs.health") },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar pb-24">

      {/* ── Hero ── */}
      <div className="relative pt-10 pb-8 px-5 overflow-hidden shrink-0 bg-gradient-to-b from-[#0a0a0f] via-secondary to-background">
        <div className="absolute inset-0 texture-hieroglyph opacity-[0.07] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-primary/5 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-tight">{t("safety.page_title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed pl-0.5">
            {t("safety.page_subtitle")}
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">
            {QUICK_CONTACTS.map(b => (
              <a key={b.value} href={`tel:${b.value}`}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-opacity active:opacity-60", b.color)}>
                <Phone className="w-3 h-3" />{b.label}: {b.value}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── SOS Block ── */}
      <div className="px-5 -mt-4 mb-5 shrink-0">
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="relative bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 border border-destructive/30 rounded-2xl p-4 overflow-hidden shadow-lg shadow-destructive/5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Siren className="w-3 h-3 animate-pulse" /> {t("safety.emergency")}
              </p>
              <p className="text-3xl font-black text-foreground tracking-tight">
                {t("safety.tourist_police_line")}<span className="text-destructive">126</span>
              </p>
            </div>
            <a
              href="tel:126"
              className="relative w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/40 active:scale-95 transition-transform"
              aria-label={t("safety.tourist_police")}
            >
              <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-20" />
              <Phone className="w-7 h-7 text-white fill-white" />
            </a>
          </div>

          <button
            onClick={handleSOS}
            disabled={sosSending || sosSent}
            className={cn(
              "w-full py-3.5 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg border",
              sosSent
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-emerald-600/10"
                : "bg-destructive text-white border-destructive shadow-destructive/30 hover:bg-destructive/90"
            )}
          >
            {sosSending ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("safety.sos_sending")}</>
            ) : sosSent ? (
              <><CheckCircle2 className="w-5 h-5" /> {t("safety.sos_sent")}</>
            ) : (
              <><Siren className="w-5 h-5" /> {t("safety.sos_btn")}</>
            )}
          </button>

          {sosError && <p className="text-[11px] text-destructive text-center mt-2">{sosError}</p>}
          {sosSent  && <p className="text-[11px] text-emerald-400 text-center mt-2">{t("safety.sos_success")}</p>}
          <p className="text-[11px] text-muted-foreground/70 mt-2">{t("safety.sos_desc_full")}</p>
        </motion.div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex-1 px-5">
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-11 bg-card border border-border/60 rounded-xl mb-5 p-1">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg text-[10px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex flex-col gap-0.5 h-full py-1"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Emergency Contacts ── */}
          <TabsContent value="contacts" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {t("safety.call_direct")}
            </p>

            {contactsLoading ? <ContactSkeleton /> : (
              (contactsData ?? []).map((contact: EmergencyContact, idx: number) => {
                const meta = CONTACT_META[contact.name] || { icon: Phone, color: "text-primary", bg: "bg-primary/10 border-primary/25" };
                const IconComp = meta.icon;
                return (
                  <motion.div key={contact.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <a href={`tel:${contact.number.replace(/[^0-9+]/g, "")}`} className="block group">
                      <Card className="border-border/60 group-hover:border-border active:scale-[0.98] transition-all duration-150 cursor-pointer overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-4 p-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border shrink-0", meta.bg, meta.color)}>
                              <IconComp className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">{contact.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{contact.description}</p>
                              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />24/7
                              </span>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                              <p className={cn("font-black text-xl leading-none", meta.color)}>{contact.number}</p>
                              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border", meta.bg, meta.color)}>
                                <Phone className="w-2.5 h-2.5" /> {t("safety.call_label")}
                              </div>
                            </div>
                          </div>
                          <div className={cn("h-0.5 w-full opacity-30", meta.bg.replace("bg-", "bg-").replace("/10", "/60"))} />
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                );
              })
            )}

            <div className="mt-4 rounded-2xl border border-border/40 bg-muted/20 p-4">
              <div className="flex items-start gap-2.5">
                <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">{t("safety.save_numbers_title")}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t("safety.save_numbers_desc")}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Common Scams ── */}
          <TabsContent value="scams" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("safety.search_placeholder")}
                  value={scamSearch}
                  onChange={e => setScamSearch(e.target.value)}
                  className="pl-9 bg-card border-border/60 rounded-xl h-10 text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {(["all", "high", "medium", "low"] as const).map(f => {
                  const active = scamFilter === f;
                  const cfg = f !== "all" ? SEVERITY_STYLE[f] : null;
                  return (
                    <button
                      key={f}
                      onClick={() => setScamFilter(f)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                        active
                          ? f === "all"
                            ? "bg-foreground text-background border-foreground"
                            : cn(cfg?.badge, "border-current")
                          : "bg-muted/30 text-muted-foreground border-border/40 hover:border-border"
                      )}
                    >
                      {f !== "all" && <div className={cn("w-1.5 h-1.5 rounded-full", cfg?.dot)} />}
                      {f === "all" ? t("safety.filter_all") : getRiskLabel(f)}
                    </button>
                  );
                })}
              </div>
            </div>

            {scamsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
            ) : filteredScams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("safety.no_results")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScams.map((scam: CommonScam) => (
                  <ScamCard
                    key={scam.id}
                    scam={scam}
                    riskLabel={getRiskLabel(scam.severity)}
                    howToStaySafe={t("safety.how_to_stay_safe")}
                  />
                ))}
              </div>
            )}

            {!scamsLoading && scamsData && (
              <div className="mt-4 flex gap-3 text-[11px] text-muted-foreground">
                {(["high","medium","low"] as const).map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", SEVERITY_STYLE[s].dot)} />
                    {getRiskLabel(s)}: {scamsData.filter((x: CommonScam) => x.severity === s).length}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tourist Rights ── */}
          <TabsContent value="rights" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 mb-2">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {t("safety.rights_intro")}
                </p>
              </div>
            </div>

            {rightsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : (
              (rightsData ?? []).map((right: TouristRight, idx: number) => (
                <RightCard
                  key={right.id}
                  right={right}
                  idx={idx}
                  label={t("safety.tourist_right_label")}
                />
              ))
            )}

            <a
              href="https://www.egypt.travel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-2 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {t("safety.rights_source")}
              <ExternalLink className="w-3 h-3" />
            </a>
          </TabsContent>

          {/* ── Travel Tips ── */}
          <TabsContent value="tips" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs text-muted-foreground mb-1">{t("safety.tips_desc")}</p>

            {TRAVEL_TIPS_META.map((tip, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                <Card className="border-border/60 overflow-hidden hover:border-border/80 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 mt-0.5", tip.bg, tip.color)}>
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground mb-1.5">
                        {t(`safety.tips.${tip.key}.title`)}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(`safety.tips.${tip.key}.tip`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Health & Safety ── */}
          <TabsContent value="health" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-3.5 mb-2">
              <div className="flex items-start gap-2.5">
                <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {t("safety.health_intro")}
                </p>
              </div>
            </div>

            {HEALTH_TIPS_META.map((tip, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                <Card className="border-border/60 overflow-hidden hover:border-border/80 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 mt-0.5", tip.bg, tip.color)}>
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground mb-1.5">
                        {t(`safety.health_tips.${tip.key}.title`)}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(`safety.health_tips.${tip.key}.tip`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="mt-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> {t("safety.vaccinations_title")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("safety.vaccinations_desc")}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Floating Mini SOS ── */}
      <AnimatePresence>
        {!sosSent && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring", bounce: 0.3 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <a
              href="tel:126"
              className="flex items-center gap-2 bg-destructive text-white px-4 py-2.5 rounded-full shadow-xl shadow-destructive/30 font-bold text-sm active:scale-95 transition-transform border border-destructive/60"
              aria-label={t("safety.tourist_police")}
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>126</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
