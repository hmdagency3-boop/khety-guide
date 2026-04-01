import { useState } from "react";
import { Train, Bus, Car, Clock, Ticket, Info, ChevronDown, ChevronUp, AlertTriangle, Phone, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

// ─── Static data (proper nouns & numbers — remain in Arabic) ──────────────────

const METRO_LINES = [
  {
    id: 1,
    nameKey: "line1",
    nameEn: "Line 1",
    color: "#2563EB",
    from: "حلوان",
    to: "المرج الجديدة",
    stations: 29,
    key_stations: [
      { name: "حلوان", transfer: false },
      { name: "المعصرة", transfer: false },
      { name: "دار السلام", transfer: false },
      { name: "مار جرجس", transfer: false },
      { name: "الملك الصالح", transfer: false },
      { name: "السيدة زينب", transfer: false },
      { name: "سعد زغلول", transfer: false },
      { name: "السادات", transfer: true, transferLines: [2] },
      { name: "ناصر", transfer: true, transferLines: [3] },
      { name: "الشهداء", transfer: false },
      { name: "العباسية", transfer: false },
      { name: "الكلية الحربية", transfer: false },
      { name: "المرج الجديدة", transfer: false },
    ],
    hours: "٥:٠٠ ص — ١٢:٠٠ م",
    length: "٤٤ كم",
  },
  {
    id: 2,
    nameKey: "line2",
    nameEn: "Line 2",
    color: "#DC2626",
    from: "شبرا الخيمة",
    to: "المنيب",
    stations: 18,
    key_stations: [
      { name: "شبرا الخيمة", transfer: false },
      { name: "كولية", transfer: false },
      { name: "رود الفرج", transfer: false },
      { name: "مسرة", transfer: false },
      { name: "الشهداء / عتبة", transfer: true, transferLines: [3] },
      { name: "السادات", transfer: true, transferLines: [1] },
      { name: "البهوس", transfer: false },
      { name: "جامعة القاهرة", transfer: false },
      { name: "الدقي", transfer: false },
      { name: "العمرانية", transfer: false },
      { name: "المنيب", transfer: false },
    ],
    hours: "٥:٠٠ ص — ١٢:٠٠ م",
    length: "٢١ كم",
  },
  {
    id: 3,
    nameKey: "line3",
    nameEn: "Line 3",
    color: "#16A34A",
    from: "عدلي منصور",
    to: "كيت كات",
    stations: 34,
    key_stations: [
      { name: "عدلي منصور", transfer: false },
      { name: "ألف مسكن", transfer: false },
      { name: "هليوبوليس", transfer: false },
      { name: "مطار القاهرة", transfer: false, note: "✈️ المطار" },
      { name: "العباسية", transfer: false },
      { name: "بنها", transfer: false },
      { name: "الشهداء", transfer: true, transferLines: [2] },
      { name: "العتبة", transfer: true, transferLines: [2] },
      { name: "ناصر", transfer: true, transferLines: [1] },
      { name: "ماسبيرو", transfer: false },
      { name: "زهراء المعادي", transfer: false },
      { name: "كيت كات ★", transfer: false, note: "🚧 قيد الإنشاء" },
    ],
    hours: "٥:٠٠ ص — ١٢:٠٠ م",
    length: "٦٦ كم (مكتمل جزئياً)",
  },
];

const TICKET_PRICES = [
  { zones: "١–٩ محطات", price: "٧ جنيه", priceEn: "7 EGP" },
  { zones: "١٠–١٦ محطة", price: "١٠ جنيه", priceEn: "10 EGP" },
  { zones: "١٧+ محطة", price: "١٥ جنيه", priceEn: "15 EGP" },
];

const TRAINS = [
  { from: "القاهرة", to: "الإسكندرية", duration: "٢–٣ ساعات", price: "٧٥–٢٥٠ ج", freq: "كل ساعة تقريباً", class: "AC / Turbini" },
  { from: "القاهرة", to: "الأقصر", duration: "٩–١١ ساعة", price: "١٦٠–٤٥٠ ج", freq: "٣ قطارات يومياً", class: "نوم / AC" },
  { from: "القاهرة", to: "أسوان", duration: "١٢–١٤ ساعة", price: "٢٢٠–٥٥٠ ج", freq: "قطارين يومياً", class: "نوم / AC" },
  { from: "القاهرة", to: "الغردقة", duration: "٦–٨ ساعات", price: "بالأتوبيس فقط", freq: "أتوبيسات منتظمة", class: "أتوبيس VIP" },
  { from: "القاهرة", to: "شرم الشيخ", duration: "٦–٨ ساعات", price: "بالأتوبيس فقط", freq: "٣–٥ رحلات يومياً", class: "أتوبيس VIP" },
];

const GO_BUS_ROUTES = ["القاهرة ← الغردقة", "القاهرة ← شرم", "الإسكندرية ← القاهرة"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title, subtitle, icon, children, defaultOpen = false
}: {
  title: string; subtitle?: string; icon: React.ReactNode;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-black text-sm text-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-4 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Transit() {
  const { t } = useTranslation();
  const [activeMetroLine, setActiveMetroLine] = useState<number>(1);
  const activeLine = METRO_LINES.find(l => l.id === activeMetroLine)!;

  const tips = t("transit.tips.items", { returnObjects: true }) as string[];

  const APPS = [
    {
      name: "Uber",
      icon: "🚗",
      color: "from-slate-800 to-slate-900",
      border: "border-slate-600/40",
      desc: t("transit.apps.uber_desc"),
      tips: [t("transit.apps.uber_tip1"), t("transit.apps.uber_tip2"), t("transit.apps.uber_tip3")],
    },
    {
      name: "Careem",
      icon: "🟢",
      color: "from-emerald-900 to-emerald-950",
      border: "border-emerald-600/40",
      desc: t("transit.apps.careem_desc"),
      tips: [t("transit.apps.careem_tip1"), t("transit.apps.careem_tip2"), t("transit.apps.careem_tip3")],
    },
    {
      name: "InDrive",
      icon: "🚕",
      color: "from-yellow-900 to-yellow-950",
      border: "border-yellow-600/40",
      desc: t("transit.apps.indrive_desc"),
      tips: [t("transit.apps.indrive_tip1"), t("transit.apps.indrive_tip2"), t("transit.apps.indrive_tip3")],
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1117] to-[#111827] border-b border-primary/10 px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Train className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-foreground">{t("transit.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("transit.subtitle")}</p>
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { label: t("transit.stats.metro_lines"), emoji: "🚇" },
            { label: t("transit.stats.careem_cities"), emoji: "🚗" },
            { label: t("transit.stats.daily_trains"), emoji: "🚂" },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11px] font-semibold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full">
              <span>{s.emoji}</span> {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">

        {/* ── Cairo Metro ── */}
        <Section title={t("transit.metro.title")} subtitle={t("transit.metro.subtitle")} icon={<Train className="w-5 h-5" />} defaultOpen>

          {/* Line tabs */}
          <div className="flex gap-2 mb-4">
            {METRO_LINES.map(line => (
              <button
                key={line.id}
                onClick={() => setActiveMetroLine(line.id)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all",
                  activeMetroLine === line.id
                    ? "text-white border-transparent"
                    : "bg-muted text-muted-foreground border-border/40 hover:border-primary/30"
                )}
                style={activeMetroLine === line.id ? { background: line.color, borderColor: line.color } : {}}
              >
                {t(`transit.metro.${line.nameKey}`)}
              </button>
            ))}
          </div>

          {/* Line info header */}
          <div
            className="rounded-xl p-3 mb-3 border"
            style={{ background: activeLine.color + "15", borderColor: activeLine.color + "40" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-black text-sm" style={{ color: activeLine.color }}>
                {t(`transit.metro.${activeLine.nameKey}`)}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">{activeLine.nameEn}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <span className="font-semibold text-foreground">{activeLine.from}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="font-semibold text-foreground">{activeLine.to}</span>
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Train className="w-3 h-3" /> {activeLine.stations} {t("transit.metro.stations_suffix")}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {activeLine.length}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeLine.hours}</span>
            </div>
          </div>

          {/* Visual station list */}
          <div className="relative pr-4">
            <div
              className="absolute right-[7px] top-0 bottom-0 w-0.5 rounded-full"
              style={{ background: activeLine.color + "40" }}
            />
            {activeLine.key_stations.map((st, i) => (
              <div key={i} className="flex items-center gap-3 mb-2 relative">
                <div
                  className={cn("w-3.5 h-3.5 rounded-full border-2 bg-card shrink-0 z-10", st.transfer && "w-4 h-4")}
                  style={{ borderColor: activeLine.color, ...(st.transfer ? { background: activeLine.color } : {}) }}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className={cn("text-xs", st.transfer ? "font-bold text-foreground" : "text-muted-foreground")}>
                    {st.name}
                  </span>
                  {st.transfer && (
                    <div className="flex gap-1">
                      {st.transferLines?.map(l => {
                        const ln = METRO_LINES.find(x => x.id === l);
                        return (
                          <span
                            key={l}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: ln?.color }}
                          >
                            {t("transit.metro.transfer_line")} {l}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {(st as any).note && (
                    <span className="text-[9px] text-muted-foreground">{(st as any).note}</span>
                  )}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground/60 mt-1 pr-7">{t("transit.metro.more_stations")}</p>
          </div>

          {/* Ticket prices */}
          <div className="mt-4 pt-3 border-t border-border/40">
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-primary" /> {t("transit.metro.ticket_prices")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TICKET_PRICES.map((tk, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-2.5 text-center border border-border/30">
                  <p className="text-base font-display font-black text-primary">{tk.price}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{tk.zones}</p>
                  <p className="text-[9px] text-muted-foreground/60">{tk.priceEn}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              {t("transit.metro.prices_note")}
            </p>
          </div>
        </Section>

        {/* ── Ride Apps ── */}
        <Section title={t("transit.apps.title")} subtitle={t("transit.apps.subtitle")} icon={<Car className="w-5 h-5" />}>
          <div className="space-y-3">
            {APPS.map((app) => (
              <div
                key={app.name}
                className={cn("rounded-xl p-4 bg-gradient-to-br border", app.color, app.border)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{app.icon}</span>
                  <h3 className="font-display font-black text-sm text-white">{app.name}</h3>
                </div>
                <p className="text-[11px] text-white/70 mb-3">{app.desc}</p>
                <div className="space-y-1">
                  {app.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-white/80">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Buses / Microbuses ── */}
        <Section title={t("transit.buses.title")} subtitle={t("transit.buses.subtitle")} icon={<Bus className="w-5 h-5" />}>
          <div className="space-y-3">
            {/* CTA Bus */}
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4">
              <h3 className="font-bold text-sm text-blue-300 mb-1">🚌 {t("transit.buses.cta_name")}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">{t("transit.buses.cta_desc")}</p>
              <div className="flex gap-2">
                <span className="bg-blue-500/15 text-blue-300 text-[10px] px-2 py-1 rounded-lg border border-blue-500/25">{t("transit.buses.cta_price")}</span>
                <span className="bg-blue-500/15 text-blue-300 text-[10px] px-2 py-1 rounded-lg border border-blue-500/25">{t("transit.buses.cta_hours")}</span>
              </div>
            </div>

            {/* Go Bus */}
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
              <h3 className="font-bold text-sm text-amber-300 mb-1">🚌 {t("transit.buses.gobus_name")}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">{t("transit.buses.gobus_desc")}</p>
              <div className="flex gap-2 flex-wrap">
                {GO_BUS_ROUTES.map(r => (
                  <span key={r} className="bg-amber-500/15 text-amber-300 text-[10px] px-2 py-1 rounded-lg border border-amber-500/25">{r}</span>
                ))}
              </div>
            </div>

            {/* Microbus warning */}
            <div className="bg-muted/40 border border-border/40 rounded-xl p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{t("transit.buses.microbus_label")} </span>
                {t("transit.buses.microbus_warning")}
              </p>
            </div>
          </div>
        </Section>

        {/* ── Intercity Trains ── */}
        <Section title={t("transit.trains.title")} subtitle={t("transit.trains.subtitle")} icon={<Train className="w-5 h-5" />}>
          <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            {t("transit.trains.booking")}
          </p>
          <div className="space-y-2">
            {TRAINS.map((tr, i) => (
              <div key={i} className="bg-muted/40 border border-border/40 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-foreground">{tr.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold text-sm text-foreground">{tr.to}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t("transit.trains.duration")}</p>
                    <p className="text-xs font-bold text-foreground">{tr.duration}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t("transit.trains.price")}</p>
                    <p className="text-xs font-bold text-primary">{tr.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t("transit.trains.class")}</p>
                    <p className="text-xs font-bold text-foreground">{tr.class}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">🕐 {tr.freq}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tips ── */}
        <Section title={t("transit.tips.title")} subtitle={t("transit.tips.subtitle")} icon={<Info className="w-5 h-5" />}>
          <div className="space-y-2">
            {Array.isArray(tips) && tips.map((tip, i) => {
              const icons = ["🕐", "💳", "👩", "💵", "📱", "🚖", "🔒", "🚌"];
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
                  <span className="text-lg leading-none shrink-0">{icons[i] ?? "💡"}</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Emergency numbers ── */}
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-red-400 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" /> {t("transit.emergency.title")}
          </h3>
          <div className="space-y-2">
            {[
              { nameKey: "tourist_police", num: "126" },
              { nameKey: "ambulance", num: "123" },
              { nameKey: "metro_hotline", num: "202-35787070" },
              { nameKey: "child_rescue", num: "16000" },
            ].map(e => (
              <div key={e.nameKey} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t(`transit.emergency.${e.nameKey}`)}</span>
                <a
                  href={`tel:${e.num}`}
                  className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  📞 {e.num}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to map */}
        <Link href="/map">
          <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/15 transition-colors active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{t("transit.map_cta.title")}</p>
              <p className="text-[11px] text-muted-foreground">{t("transit.map_cta.subtitle")}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </Link>

      </div>
    </div>
  );
}
