import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Loader2, MapPin, Clock, Target, Wallet, Users, Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Trip Basics", "Interests", "Logistics"] as const;

const PURPOSES = [
  { value: "tourism",     label: "سياحة عامة",       emoji: "🏛️" },
  { value: "culture",     label: "ثقافة وتاريخ",      emoji: "📜" },
  { value: "relaxation",  label: "استجمام وراحة",      emoji: "🌊" },
  { value: "adventure",   label: "مغامرات",            emoji: "🏜️" },
  { value: "religious",   label: "سياحة دينية",        emoji: "🕌" },
  { value: "business",    label: "عمل + سياحة",        emoji: "💼" },
  { value: "photography", label: "تصوير",              emoji: "📸" },
];

const TOURISM_TYPES = [
  { value: "pharaonic",  label: "فرعونية وأثرية",   emoji: "𓂀" },
  { value: "museums",    label: "متاحف",             emoji: "🏛️" },
  { value: "islamic",    label: "إسلامية",           emoji: "🕌" },
  { value: "coptic",     label: "قبطية",             emoji: "✝️" },
  { value: "beaches",    label: "شواطئ",             emoji: "🏖️" },
  { value: "desert",     label: "صحراوية",           emoji: "🏜️" },
  { value: "safari",     label: "سفاري",             emoji: "🦁" },
  { value: "shopping",   label: "أسواق وتسوق",       emoji: "🛍️" },
  { value: "food",       label: "طعام وثقافة",       emoji: "🍽️" },
  { value: "nile",       label: "نيلية",             emoji: "🚢" },
];

const CITIES = [
  { value: "cairo",       label: "القاهرة",       emoji: "🏙️" },
  { value: "giza",        label: "الجيزة",        emoji: "𓇳" },
  { value: "luxor",       label: "الأقصر",        emoji: "🏛️" },
  { value: "aswan",       label: "أسوان",         emoji: "⛵" },
  { value: "alexandria",  label: "الإسكندرية",    emoji: "🌊" },
  { value: "sharm",       label: "شرم الشيخ",     emoji: "🤿" },
  { value: "hurghada",    label: "الغردقة",       emoji: "🐠" },
  { value: "siwa",        label: "سيوة",          emoji: "🌴" },
];

const DURATIONS = [
  { value: "1-3", label: "1–3 أيام",  sub: "رحلة قصيرة" },
  { value: "4-7", label: "4–7 أيام",  sub: "أسبوع" },
  { value: "8+",  label: "8+ أيام",   sub: "رحلة طويلة" },
];

const BUDGETS = [
  { value: "budget",  label: "اقتصادية",  emoji: "💰",  sub: "أفضل قيمة" },
  { value: "mid",     label: "متوسطة",    emoji: "💳",  sub: "توازن مثالي" },
  { value: "luxury",  label: "فاخرة",     emoji: "👑",  sub: "بلا حدود" },
];

const LANGUAGES = [
  { value: "ar", label: "عربي" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "zh", label: "中文" },
  { value: "ru", label: "Русский" },
];

interface FormData {
  trip_duration: string;
  visit_purpose: string;
  first_visit: boolean;
  preferred_language: string;
  tourism_types: string[];
  preferred_cities: string[];
  budget_range: string;
  travelers_count: number;
  has_children: boolean;
}

const INITIAL: FormData = {
  trip_duration: "",
  visit_purpose: "",
  first_visit: true,
  preferred_language: "ar",
  tourism_types: [],
  preferred_cities: [],
  budget_range: "",
  travelers_count: 1,
  has_children: false,
};

function ToggleChip({
  selected, onClick, children, className
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
        selected
          ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
          : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className
      )}
    >
      {selected && (
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2 h-2 text-primary-foreground stroke-[3]" />
        </span>
      )}
      {children}
    </button>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            i < current ? "bg-primary text-primary-foreground" :
            i === current ? "bg-primary/20 border-2 border-primary text-primary" :
            "bg-card border border-border/40 text-muted-foreground"
          )}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("h-px w-8 transition-all", i < current ? "bg-primary" : "bg-border/30")} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { saveTravelProfile, user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(field: "tourism_types" | "preferred_cities", value: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }));
  }

  function canNext() {
    if (step === 0) return !!form.trip_duration && !!form.visit_purpose;
    if (step === 1) return form.tourism_types.length > 0 && form.preferred_cities.length > 0;
    if (step === 2) return !!form.budget_range;
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const { error } = await saveTravelProfile(form);
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      navigate("/");
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [dir, setDir] = useState(1);

  function goNext() { setDir(1); setStep(s => s + 1); }
  function goPrev() { setDir(-1); setStep(s => s - 1); }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none select-none flex items-center justify-center text-[20rem] leading-none">𓂀</div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="relative flex-1 overflow-y-auto px-5 pt-10 pb-32">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">𓅓</div>
            <h1 className="text-xl font-display font-black text-foreground">أكمل تفضيلات رحلتك</h1>
            <p className="text-xs text-muted-foreground mt-1">خيتي سيستخدم هذه المعلومات لتخصيص تجربتك</p>
          </div>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">مدة الزيارة</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {DURATIONS.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, trip_duration: d.value }))}
                          className={cn(
                            "rounded-xl border p-3 text-center transition-all",
                            form.trip_duration === d.value
                              ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                              : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          <div className="font-bold text-sm">{d.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">الغرض من الزيارة</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PURPOSES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, visit_purpose: p.value }))}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all",
                            form.visit_purpose === p.value
                              ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                              : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          <span className="text-base">{p.emoji}</span>
                          <span className="font-medium">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">معلومات إضافية</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, first_visit: true }))}
                        className={cn(
                          "rounded-xl border p-3 text-center text-sm transition-all",
                          form.first_visit
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <div className="text-xl mb-1">🇪🇬</div>
                        <div className="font-medium">أول زيارة</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, first_visit: false }))}
                        className={cn(
                          "rounded-xl border p-3 text-center text-sm transition-all",
                          !form.first_visit
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <div className="text-xl mb-1">✈️</div>
                        <div className="font-medium">زرت مصر قبل</div>
                      </button>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">اللغة المفضلة</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, preferred_language: l.value }))}
                          className={cn(
                            "rounded-xl border py-2 text-xs font-medium text-center transition-all",
                            form.preferred_language === l.value
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {step === 1 && (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary text-lg">𓂀</span>
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">أنواع السياحة المفضلة</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">اختر كل ما يناسبك</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TOURISM_TYPES.map(t => (
                        <ToggleChip
                          key={t.value}
                          selected={form.tourism_types.includes(t.value)}
                          onClick={() => toggle("tourism_types", t.value)}
                        >
                          <span className="flex items-center gap-2">
                            <span>{t.emoji}</span>
                            <span>{t.label}</span>
                          </span>
                        </ToggleChip>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">الوجهات المهتم بها</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">اختر المدن التي تريد زيارتها</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CITIES.map(c => (
                        <ToggleChip
                          key={c.value}
                          selected={form.preferred_cities.includes(c.value)}
                          onClick={() => toggle("preferred_cities", c.value)}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.emoji}</span>
                            <span>{c.label}</span>
                          </span>
                        </ToggleChip>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">الميزانية التقريبية</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {BUDGETS.map(b => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, budget_range: b.value }))}
                          className={cn(
                            "rounded-xl border p-3 text-center transition-all",
                            form.budget_range === b.value
                              ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                              : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          <div className="text-xl mb-1">{b.emoji}</div>
                          <div className="font-bold text-sm">{b.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{b.sub}</div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">عدد المسافرين</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-card/60 border border-border/40 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, travelers_count: Math.max(1, f.travelers_count - 1) }))}
                        className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-lg font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-foreground">{form.travelers_count}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {form.travelers_count === 1 ? "مسافر واحد" : `${form.travelers_count} مسافرون`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, travelers_count: Math.min(20, f.travelers_count + 1) }))}
                        className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-lg font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        +
                      </button>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">هل معك أطفال؟</h2>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, has_children: false }))}
                        className={cn(
                          "rounded-xl border p-3 text-center text-sm transition-all",
                          !form.has_children
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <div className="text-xl mb-1">🧑‍🤝‍🧑</div>
                        <div className="font-medium">بدون أطفال</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, has_children: true }))}
                        className={cn(
                          "rounded-xl border p-3 text-center text-sm transition-all",
                          form.has_children
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/40 bg-card/60 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <div className="text-xl mb-1">👨‍👩‍👧</div>
                        <div className="font-medium">مع أطفال</div>
                      </button>
                    </div>
                  </section>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/30 px-5 py-4">
        <div className="max-w-sm mx-auto flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={goPrev}
              className="flex-1 h-12 rounded-xl border-border/40"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              السابق
            </Button>
          )}

          {step < 2 ? (
            <Button
              onClick={goNext}
              disabled={!canNext()}
              className="flex-1 h-12 rounded-xl font-semibold shadow-md shadow-primary/20"
            >
              التالي
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!canNext() || saving}
              className="flex-1 h-12 rounded-xl font-semibold shadow-md shadow-primary/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Check className="w-4 h-4 ml-2" />
              )}
              {saving ? "جاري الحفظ..." : "حفظ والمتابعة"}
            </Button>
          )}
        </div>

        {step === 0 && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
          >
            تخطي الآن
          </button>
        )}
      </div>
    </div>
  );
}
