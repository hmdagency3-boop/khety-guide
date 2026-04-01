import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LoadingScarab } from "@/components/LoadingScarab";
import { Button } from "@/components/ui/button";
import {
  Send, Sparkles, Plus, Trash2, Map, Info, ShieldAlert, Phone, Users,
  CalendarDays, Navigation, ImagePlus, X, ScanLine, History, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLandmarks } from "@/hooks/useLandmarks";
import { useTranslation } from "react-i18next";
import { ARCameraModal } from "@/components/ARCameraModal";
import { GoldenAgeModal } from "@/components/GoldenAgeModal";
import { CameraPermissionSheet } from "@/components/CameraPermissionSheet";
import { useCameraPermission } from "@/hooks/useCameraPermission";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS  = 60000;

/* ── Travel profile helpers (pure, defined at module level) ──────── */
const LANG_NAMES: Record<string, string> = {
  ar: "Arabic",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  zh: "Chinese",
  ru: "Russian",
};

function langInstruction(lang: string): string {
  const name = LANG_NAMES[lang] ?? "English";
  return `[Respond in: ${name}]\n`;
}

function isPlanningIntent(text: string): boolean {
  return /plan|itinerary|schedule|trip|tour|route|day|days|visit|travel|suggest|recommend|egypt|خطة|رحلة|برنامج|جدول|زيارة|سفر|أيام|يوم|ترشح|اقترح|مصر/i.test(text);
}

function buildProfileContext(p: {
  trip_duration:    string | null;
  visit_purpose:    string | null;
  tourism_types:    string[];
  preferred_cities: string[];
  budget_range:     string | null;
  travelers_count:  number | null;
  has_children:     boolean | null;
  first_visit:      boolean | null;
  notes:            string | null;
}, lang: string): string {
  const isAr = lang === "ar";
  const durationMap: Record<string, string> = {
    "1-3": isAr ? "1-3 أيام" : "1-3 days",
    "4-7": isAr ? "4-7 أيام" : "4-7 days",
    "8+":  isAr ? "أكثر من 8 أيام" : "8+ days",
  };
  const purposeMap: Record<string, string> = {
    tourism:     isAr ? "السياحة العامة" : "General tourism",
    culture:     isAr ? "الثقافة والتاريخ" : "Culture & history",
    relaxation:  isAr ? "الاسترخاء" : "Relaxation",
    adventure:   isAr ? "المغامرة" : "Adventure",
    religious:   isAr ? "السياحة الدينية" : "Religious tourism",
    business:    isAr ? "الأعمال" : "Business",
    photography: isAr ? "التصوير" : "Photography",
  };
  const typeMap: Record<string, string> = {
    pharaonic: isAr ? "المواقع الفرعونية" : "Pharaonic sites",
    museums:   isAr ? "المتاحف" : "Museums",
    islamic:   isAr ? "التراث الإسلامي" : "Islamic heritage",
    coptic:    isAr ? "التراث القبطي" : "Coptic heritage",
    beaches:   isAr ? "الشواطئ" : "Beaches",
    desert:    isAr ? "الصحراء" : "Desert",
    safari:    isAr ? "السفاري" : "Safari",
    shopping:  isAr ? "التسوق" : "Shopping",
    food:      isAr ? "المطبخ المصري" : "Egyptian cuisine",
    nile:      isAr ? "رحلات النيل" : "Nile cruises",
  };
  const cityMap: Record<string, string> = {
    cairo:      isAr ? "القاهرة" : "Cairo",
    giza:       isAr ? "الجيزة" : "Giza",
    luxor:      isAr ? "الأقصر" : "Luxor",
    aswan:      isAr ? "أسوان" : "Aswan",
    alexandria: isAr ? "الإسكندرية" : "Alexandria",
    sharm:      isAr ? "شرم الشيخ" : "Sharm El Sheikh",
    hurghada:   isAr ? "الغردقة" : "Hurghada",
    siwa:       isAr ? "سيوة" : "Siwa",
  };
  const budgetMap: Record<string, string> = {
    budget:  isAr ? "اقتصادية" : "Budget-friendly",
    mid:     isAr ? "متوسطة" : "Mid-range",
    luxury:  isAr ? "فاخرة" : "Luxury",
  };

  const lines: string[] = [];
  if (p.trip_duration)            lines.push(`- Trip duration: ${durationMap[p.trip_duration] ?? p.trip_duration}`);
  if (p.visit_purpose)            lines.push(`- Main purpose: ${purposeMap[p.visit_purpose] ?? p.visit_purpose}`);
  if (p.tourism_types?.length)    lines.push(`- Interests: ${p.tourism_types.map(t => typeMap[t] ?? t).join(", ")}`);
  if (p.preferred_cities?.length) lines.push(`- Preferred cities: ${p.preferred_cities.map(c => cityMap[c] ?? c).join(", ")}`);
  if (p.budget_range)             lines.push(`- Budget: ${budgetMap[p.budget_range] ?? p.budget_range}`);
  if (p.travelers_count)          lines.push(`- Travelers: ${p.travelers_count}${p.has_children ? (isAr ? " (مع أطفال)" : " (including children)") : ""}`);
  if (p.first_visit != null)      lines.push(`- First visit to Egypt: ${p.first_visit ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")}`);
  if (p.notes)                    lines.push(`- Special notes: ${p.notes}`);

  const header = isAr
    ? "[تفضيلات المسافر — مخصَّص لك]"
    : "[Saved Traveller Preferences — personalised for you]";
  return `${header}\n${lines.join("\n")}\n\n`;
}

/* ── Render assistant text with landmark links ──────────────────────── */
function renderWithLandmarkLinks(
  text: string,
  landmarks: { id: string; name: string; name_ar?: string | null }[],
  Link: React.ComponentType<{ href: string; children: React.ReactNode }>
): React.ReactNode {
  if (!landmarks.length) return <span className="whitespace-pre-wrap">{text}</span>;

  /* Build name→id map, sorted longest-first to avoid partial matches */
  type Entry = { pattern: string; id: string };
  const entries: Entry[] = [];
  for (const lm of landmarks) {
    if (lm.name)    entries.push({ pattern: lm.name,    id: lm.id });
    if (lm.name_ar) entries.push({ pattern: lm.name_ar, id: lm.id });
  }
  entries.sort((a, b) => b.pattern.length - a.pattern.length);

  const escaped = entries.map(e => e.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex   = new RegExp(`(${escaped.join("|")})`, "g");

  const parts = text.split(regex);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        const entry = entries.find(e => e.pattern === part);
        if (entry) {
          return (
            <Link key={i} href={`/landmarks/${entry.id}`}>
              <span className="text-primary font-semibold underline underline-offset-2 decoration-primary/40 cursor-pointer hover:text-primary/75 hover:decoration-primary transition-colors">
                {part}
              </span>
            </Link>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

/* ── Types ──────────────────────────────────────────────────────────── */
type ChatMessage = {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string | null;
  response: string | null;
  status: "pending" | "completed";
  created_at: string;
};

type ActionButton = {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
};

type UIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  created_at: string;
  pending?: boolean;
  animating?: boolean;
  actions?: ActionButton[];
};

type ConversationSummary = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

type TravelProfile = {
  trip_duration:    string | null;
  visit_purpose:    string | null;
  tourism_types:    string[];
  preferred_cities: string[];
  budget_range:     string | null;
  travelers_count:  number | null;
  has_children:     boolean | null;
  first_visit:      boolean | null;
  notes:            string | null;
};

/* ── Typewriter ─────────────────────────────────────────────────────── */
const TypewriterText = memo(function TypewriterText({
  text,
  onDone,
}: {
  text: string;
  onDone: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const indexRef  = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const chunkSize = text.length > 600 ? 4 : text.length > 200 ? 2 : 1;
    const interval = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + chunkSize, text.length);
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) { clearInterval(interval); onDoneRef.current(); }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-primary/70 ml-0.5 align-middle animate-pulse" />
    </span>
  );
});

/* ── Quick prompts ──────────────────────────────────────────────────── */
const QUICK_PROMPTS = [
  { icon: "𓃭", text: "Plan my day in Cairo" },
  { icon: "𓂀", text: "Show me historical places in Egypt" },
  { icon: "𓅓", text: "Safety tips for tourists" },
  { icon: "🏥", text: "First aid help" },
  { icon: "𓆙", text: "Find me a local guide" },
  { icon: "🍽️", text: "What Egyptian food should I try?" },
];

/* ── Action detection ───────────────────────────────────────────────── */
function detectActions(text: string, landmarks: { id: string; name: string; name_ar?: string | null }[]): ActionButton[] {
  const actions: ActionButton[] = [];
  const lower = text.toLowerCase();

  for (const lm of landmarks) {
    const matchedEn = lower.includes(lm.name.toLowerCase());
    const matchedAr = lm.name_ar ? text.includes(lm.name_ar) : false;
    if (matchedEn || matchedAr) {
      if (!actions.find(a => a.href.includes(lm.id))) {
        actions.push({ label: `View ${lm.name} on Map`, icon: <Map className="w-3.5 h-3.5" />, href: `/map?landmark=${encodeURIComponent(lm.id)}`, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" });
        if (actions.filter(a => a.href.includes("/landmarks/")).length < 2)
          actions.push({ label: `${lm.name} Details`, icon: <Info className="w-3.5 h-3.5" />, href: `/landmarks/${lm.id}`, color: "text-primary border-primary/30 bg-primary/10" });
      }
    }
  }
  if (/safety|safe|danger|scam|harass|emergency|police|ambulance/i.test(text)) {
    actions.push({ label: "Safety Tips",         icon: <ShieldAlert className="w-3.5 h-3.5" />, href: "/safety",           color: "text-amber-400 border-amber-500/30 bg-amber-500/10" });
    actions.push({ label: "Emergency Numbers",   icon: <Phone       className="w-3.5 h-3.5" />, href: "/safety#emergency", color: "text-red-400 border-red-500/30 bg-red-500/10" });
  }
  if (/itinerary|route|plan|day trip|schedule|visit/i.test(text)) {
    if (!actions.find(a => a.href === "/map"))
      actions.push({ label: "Show Route on Map",  icon: <Navigation   className="w-3.5 h-3.5" />, href: "/map",     color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" });
    actions.push({ label: "Open Full Itinerary", icon: <CalendarDays className="w-3.5 h-3.5" />, href: "/explore", color: "text-primary border-primary/30 bg-primary/10" });
  }
  if (/guide|tour guide|local guide|licensed guide/i.test(text))
    actions.push({ label: "Find a Local Guide", icon: <Users className="w-3.5 h-3.5" />, href: "/guides", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" });

  return actions.slice(0, 4);
}

/* ── Image upload ───────────────────────────────────────────────────── */
async function uploadChatImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("chat-images").upload(path, file, { upsert: false, contentType: file.type });
  if (error) return null;
  return supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;
}

/* ── Format relative date ───────────────────────────────────────────── */
function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Chat Page                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const { data: landmarks } = useLandmarks();
  const { t, i18n } = useTranslation("t");

  const [input,        setInput]        = useState("");
  const [messages,     setMessages]     = useState<UIMessage[]>([]);
  const [isSending,    setIsSending]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading,  setIsUploading]  = useState(false);
  const [showARCamera,      setShowARCamera]      = useState(false);
  const [showCamPermSheet,  setShowCamPermSheet]  = useState(false);
  const [showGoldenAge,     setShowGoldenAge]     = useState(false);
  const [cameraStream,      setCameraStream]      = useState<MediaStream | null>(null);
  const { state: camPerm } = useCameraPermission();
  const [travelProfile, setTravelProfile] = useState<TravelProfile | null>(null);

  /* ── Conversation state ─────────────────────────────────────────── */
  const [conversationId,  setConversationId]  = useState<string | null>(null);
  const [conversations,   setConversations]   = useState<ConversationSummary[]>([]);
  const [showHistory,     setShowHistory]     = useState(false);
  const [historyLoading,  setHistoryLoading]  = useState(false);

  const scrollRef       = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLTextAreaElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const pollTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const autoSentRef     = useRef(false);
  const convIdRef       = useRef<string | null>(null); // mirror for async callbacks

  const searchStr = useSearch();
  const [, navigate] = useLocation();

  /* keep ref in sync */
  useEffect(() => { convIdRef.current = conversationId; }, [conversationId]);

  /* ── Polling helpers ────────────────────────────────────────────── */
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current)   { clearInterval(pollTimerRef.current);  pollTimerRef.current  = null; }
    if (pollTimeoutRef.current) { clearTimeout(pollTimeoutRef.current); pollTimeoutRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  /* ── Load conversations list ────────────────────────────────────── */
  const loadConversationsList = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data as ConversationSummary[]);
    setHistoryLoading(false);
  }, [user]);

  useEffect(() => { loadConversationsList(); }, [loadConversationsList]);

  /* ── Load travel preferences ────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("travel_profiles")
      .select("trip_duration, visit_purpose, tourism_types, preferred_cities, budget_range, travelers_count, has_children, first_visit, notes")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setTravelProfile(data as TravelProfile); });
  }, [user]);

  /* ── Load messages for a specific conversation ──────────────────── */
  const loadConversation = useCallback(async (convId: string) => {
    stopPolling();
    setIsSending(false);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, prompt, image_url, response, status, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!data) return;

    const uiMsgs: UIMessage[] = [];
    for (const row of data as ChatMessage[]) {
      uiMsgs.push({
        id:       row.id + "_u",
        role:     "user",
        content:  row.prompt,
        imageUrl: row.image_url ?? undefined,
        created_at: row.created_at,
      });
      if (row.response) {
        uiMsgs.push({
          id:       row.id + "_a",
          role:     "assistant",
          content:  row.response,
          created_at: row.created_at,
          actions:  detectActions(row.response, landmarks ?? []),
        });
      } else if (row.status === "pending") {
        uiMsgs.push({
          id: row.id + "_a", role: "assistant", content: "", pending: true, created_at: row.created_at,
        });
      }
    }
    setMessages(uiMsgs);
    setConversationId(convId);
    setShowHistory(false);
  }, [stopPolling, landmarks]);

  /* ── Ensure a conversation exists ───────────────────────────────── */
  const ensureConversation = useCallback(async (firstPrompt: string): Promise<string | null> => {
    if (convIdRef.current) return convIdRef.current;
    const title = firstPrompt.replace(/\[Image[^\]]*\]\n?/g, "").trim().slice(0, 60) || "New chat";
    const { data, error: err } = await supabase
      .from("conversations")
      .insert({ user_id: user!.id, title })
      .select("id")
      .single();
    if (err || !data) return null;
    const newId = (data as { id: string }).id;
    setConversationId(newId);
    convIdRef.current = newId;
    setConversations(prev => [{ id: newId, title, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...prev]);
    return newId;
  }, [user]);

  /* ── Touch conversation's updated_at ───────────────────────────── */
  const touchConversation = useCallback(async (convId: string) => {
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    setConversations(prev =>
      [...prev.map(c => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c)]
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    );
  }, []);

  /* ── Delete conversation ────────────────────────────────────────── */
  const deleteConversation = useCallback(async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (convIdRef.current === convId) {
      stopPolling();
      setMessages([]);
      setConversationId(null);
      convIdRef.current = null;
      setShowHistory(false);
    }
  }, [stopPolling]);

  /* ── Image helpers ──────────────────────────────────────────────── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be smaller than 5MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImage = () => { setImageFile(null); setImagePreview(null); };

  /* ── Poll for AI response ───────────────────────────────────────── */
  const pollForResponse = useCallback((rowId: string, tempAssistantId: string) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      const { data, error: fetchErr } = await supabase
        .from("chat_messages").select("id, response, status").eq("id", rowId).single();
      if (fetchErr || !data) return;
      if (data.status === "completed" && data.response) {
        stopPolling();
        const actions = detectActions(data.response, landmarks ?? []);
        setMessages(prev =>
          prev.map(m => m.id === tempAssistantId
            ? { ...m, content: data.response!, pending: false, animating: true, actions: actions.length ? actions : undefined }
            : m
          )
        );
        setIsSending(false);
        if (convIdRef.current) touchConversation(convIdRef.current);
      }
    }, POLL_INTERVAL_MS);

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setMessages(prev =>
        prev.map(m => m.id === tempAssistantId
          ? { ...m, content: "⚠️ Request timed out. Please try again.", pending: false }
          : m
        )
      );
      setIsSending(false);
    }, POLL_TIMEOUT_MS);
  }, [stopPolling, landmarks, touchConversation]);

  /* ── Send message ───────────────────────────────────────────────── */
  const sendMessage = useCallback(async (content: string, imgFile?: File | null, imgPreview?: string | null) => {
    const hasText  = content.trim().length > 0;
    const hasImage = !!imgFile;
    if ((!hasText && !hasImage) || isSending || !user) return;

    setInput("");
    clearImage();
    setIsSending(true);
    setError(null);

    const userMsgId      = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const now = new Date().toISOString();

    setMessages(prev => [
      ...prev,
      { id: userMsgId,      role: "user",      content: content.trim(), imageUrl: imgPreview ?? undefined, created_at: now },
      { id: assistantMsgId, role: "assistant",  content: "",             pending: true,                     created_at: now },
    ]);

    /* Upload image */
    let uploadedUrl: string | null = null;
    if (imgFile) {
      setIsUploading(true);
      uploadedUrl = await uploadChatImage(imgFile, user.id);
      setIsUploading(false);
      if (uploadedUrl)
        setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, imageUrl: uploadedUrl! } : m));
    }

    /* Build prompt — include conversation history + travel profile + language */
    const imageNote = uploadedUrl
      ? `[Image attached: ${uploadedUrl}]\n`
      : imgFile ? "[Note: image upload failed]\n" : "";

    /* Conversation history — last 10 messages (5 exchanges), skip pending/empty */
    const historyMsgs = messages
      .filter(m => !m.pending && m.content.trim().length > 0)
      .slice(-10);

    let historyBlock = "";
    if (historyMsgs.length > 0) {
      const lines = historyMsgs.map(m => {
        const role = m.role === "user" ? "User" : "Khety";
        /* Strip [Image attached: ...] meta-lines for cleaner history */
        const text = m.content.replace(/\[Image attached:[^\]]*\]\n?/g, "").trim();
        return text ? `${role}: ${text}` : null;
      }).filter(Boolean);

      if (lines.length > 0)
        historyBlock = `[Conversation history]\n${lines.join("\n")}\n[End of history]\n\n`;
    }

    const profileContext = (travelProfile && isPlanningIntent(content.trim()))
      ? buildProfileContext(travelProfile, i18n.language)
      : "";

    const prompt = langInstruction(i18n.language) + historyBlock + profileContext + imageNote + content.trim();

    /* Ensure conversation */
    const convId = await ensureConversation(prompt);
    if (!convId) {
      setError("Could not create conversation. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId));
      setIsSending(false);
      return;
    }

    /* Insert message */
    const { data, error: insertErr } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, conversation_id: convId, prompt, image_url: uploadedUrl ?? null, status: "pending" })
      .select("id")
      .single();

    if (insertErr || !data) {
      setError("Failed to send: " + (insertErr?.message ?? "Unknown error"));
      setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId));
      setIsSending(false);
      return;
    }

    pollForResponse((data as { id: string }).id, assistantMsgId);
  }, [isSending, user, ensureConversation, pollForResponse, travelProfile, i18n.language, messages]);

  const handleSend    = () => sendMessage(input.trim(), imageFile, imagePreview);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── New chat ───────────────────────────────────────────────────── */
  const clearChat = () => {
    stopPolling();
    setMessages([]);
    setIsSending(false);
    setError(null);
    clearImage();
    setConversationId(null);
    convIdRef.current = null;
    navigate("/chat", { replace: true });
    autoSentRef.current = false;
  };

  /* ── Auto-send from URL ?about= ─────────────────────────────────── */
  useEffect(() => {
    if (!user || autoSentRef.current) return;
    const params = new URLSearchParams(searchStr);
    const about = params.get("about");
    if (!about) return;
    autoSentRef.current = true;
    const isGuide = about.startsWith("guide:");
    const name    = isGuide ? about.replace("guide:", "") : about;
    const prompt  = isGuide
      ? `Tell me about the guide ${name} and how to book a tour with them in Egypt.`
      : `Tell me all about ${name} — its history, what to expect when visiting, best time to go, and any important tips.`;
    const timer = setTimeout(() => sendMessage(prompt), 600);
    return () => clearTimeout(timer);
  }, [user, searchStr, sendMessage]);

  /* ── Auth gate ──────────────────────────────────────────────────── */
  if (authLoading) return <LoadingScarab message={t("common.loading")} />;

  if (!user) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center text-[18rem] leading-none">𓂀</div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-150 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full border-2 border-primary/60 overflow-hidden shadow-2xl bg-card">
              <img src="/khety-avatar.png" alt="Khety" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">{t("chat.sign_in_title")}</h1>
          <p className="text-sm text-primary font-semibold mb-1">خيتي — {t("chat.subtitle")}</p>
          <p className="text-xs text-muted-foreground/60 mb-8 max-w-[260px]">{t("chat.sign_in_desc")}</p>
          <div className="grid grid-cols-2 gap-2 mb-8 w-full max-w-[300px]">
            {[
              { icon: "𓂀", label: t("chat.features.landmarks") },
              { icon: "𓅓", label: t("chat.features.tips") },
              { icon: "𓃭", label: t("chat.features.safety") },
              { icon: "🍽️", label: t("chat.features.food") }
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-card/60 border border-primary/15 rounded-xl px-3 py-2">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 w-full max-w-[300px]">
            <Link href="/login"    className="flex-1"><Button className="w-full rounded-2xl h-12 font-semibold shadow-lg shadow-primary/20">{t("chat.sign_in_btn")}</Button></Link>
            <Link href="/register" className="flex-1"><Button variant="outline" className="w-full rounded-2xl h-12 border-primary/30 hover:bg-primary/10">{t("chat.register_btn")}</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="shrink-0 bg-card/95 backdrop-blur-sm border-b border-primary/25 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-8 pb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border-2 border-primary/60 overflow-hidden shadow-lg shadow-primary/30">
              <img src="/khety-avatar.png" alt="Khety" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-foreground leading-none">Khety — خيتي</h1>
            <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {conversationId
                ? (conversations.find(c => c.id === conversationId)?.title ?? "Current session")
                : "Your Ancient Guide · Available now"}
            </p>
          </div>
          {/* History button */}
          <button
            onClick={() => { setShowHistory(true); loadConversationsList(); }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors border border-primary/20"
            title="Chat history"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          {/* New chat */}
          <button
            onClick={clearChat}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors border border-primary/20"
            title="New chat"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
        <div className="px-4 pb-2 flex gap-3 text-primary/20 text-lg select-none overflow-hidden">
          {"𓂀 𓃭 𓅓 𓆙 𓇋 𓈖 𓉐 𓊪 𓋹 𓌀 𓍯 𓎟 𓏏".split(" ").map((g, i) => (
            <span key={i} className="shrink-0">{g}</span>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mx-4 mt-3 px-4 py-2.5 rounded-2xl bg-destructive/10 border border-destructive/25 text-sm text-destructive flex items-center gap-2"
          >
            <span>⚠️</span><span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-6 px-4">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <img src="/khety-avatar.png" alt="Khety" className="relative w-20 h-20 rounded-full object-cover border-2 border-primary/40 shadow-lg" />
            </div>
            <p className="font-display font-bold text-xl text-foreground mb-1">I am Khety</p>
            <p className="text-sm text-primary font-semibold mb-2">Your Ancient Egyptian Guide</p>
            <p className="text-xs text-muted-foreground mb-6 max-w-[270px] leading-relaxed">
              "I will walk with you step by step through the land of Kemet. Ask me anything — history, routes, food, or safety."
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {QUICK_PROMPTS.map(s => (
                <button key={s.text} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/80 border border-primary/15 hover:border-primary/40 hover:bg-primary/5 text-sm text-foreground/80 text-left transition-all">
                  <span className="text-lg shrink-0">{s.icon}</span>
                  <span className="flex-1">{s.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 self-end mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 overflow-hidden shadow-sm">
                      <img src="/khety-avatar.png" alt="Khety" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="shrink-0 self-end mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </div>
                  </div>
                )}
                <div className={`flex flex-col max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20"
                      : "bg-card border border-border/60 text-foreground rounded-tl-sm"
                  }`}>
                    {msg.imageUrl && (
                      <div className="mb-2">
                        <img src={msg.imageUrl} alt="Attached"
                             className="rounded-xl max-w-[220px] max-h-[200px] object-cover border border-white/20"
                             onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    {msg.pending ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      </span>
                    ) : msg.animating && msg.role === "assistant" ? (
                      <TypewriterText text={msg.content} onDone={() =>
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, animating: false } : m))
                      } />
                    ) : msg.content ? (
                      msg.role === "assistant"
                        ? renderWithLandmarkLinks(msg.content, landmarks ?? [], Link)
                        : <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : null}
                  </div>

                  {!msg.pending && !msg.animating && msg.actions && msg.actions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map((action, i) => (
                        <Link key={i} href={action.href}>
                          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors hover:opacity-80 ${action.color}`}>
                            {action.icon}{action.label}
                          </button>
                        </Link>
                      ))}
                    </motion.div>
                  )}

                  {!msg.pending && !msg.animating && (
                    <span className="text-[10px] text-muted-foreground/50 mt-1.5 px-1">
                      {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      {showCamPermSheet && (
        <CameraPermissionSheet
          language={i18n.language}
          onGranted={(stream) => {
            setCameraStream(stream);
            setShowCamPermSheet(false);
            setShowARCamera(true);
          }}
          onClose={() => setShowCamPermSheet(false)}
        />
      )}
      {showARCamera && (
        <ARCameraModal
          userId={user.id}
          language={i18n.language}
          initialStream={cameraStream}
          onClose={() => {
            setShowARCamera(false);
            setCameraStream(null);
          }}
        />
      )}
      {showGoldenAge && (
        <GoldenAgeModal userId={user.id} language={i18n.language} onClose={() => setShowGoldenAge(false)} />
      )}

      {/* ── History Panel ────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[82vw] max-w-xs flex flex-col"
              style={{ background: "rgba(8,6,4,0.97)", borderLeft: "1px solid rgba(202,163,84,0.25)" }}
            >
              {/* Panel header */}
              <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4"
                   style={{ borderBottom: "1px solid rgba(202,163,84,0.15)" }}>
                <div>
                  <p className="text-white font-display font-bold text-base">𓂀 Chat History</p>
                  <p className="text-white/35 text-[11px] mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowHistory(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* New chat button */}
              <div className="shrink-0 px-3 py-3">
                <button
                  onClick={() => { clearChat(); setShowHistory(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all"
                  style={{ background: "rgba(202,163,84,0.12)", border: "1px solid rgba(202,163,84,0.35)", color: "#CAA354" }}
                >
                  <Plus className="w-4 h-4" /> New conversation
                </button>
              </div>

              {/* Conversations list */}
              <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-8 h-8 text-white/15 mb-3" />
                    <p className="text-white/30 text-sm">No conversations yet</p>
                    <p className="text-white/20 text-xs mt-1">Start chatting with Khety</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const isActive = conv.id === conversationId;
                    return (
                      <motion.button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left flex items-start gap-3 px-3.5 py-3 rounded-2xl transition-all group"
                        style={{
                          background: isActive ? "rgba(202,163,84,0.15)" : "rgba(255,255,255,0.04)",
                          border: isActive ? "1px solid rgba(202,163,84,0.45)" : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30">
                            <img src="/khety-avatar.png" alt="" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/85 text-[13px] font-medium leading-snug truncate">
                            {conv.title ?? "Untitled conversation"}
                          </p>
                          <p className="text-white/30 text-[10.5px] mt-0.5">{relativeDate(conv.updated_at)}</p>
                        </div>
                        <button
                          onClick={e => deleteConversation(conv.id, e)}
                          className="shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Input area ───────────────────────────────────────────── */}
      <div className="shrink-0 bg-card/95 backdrop-blur-sm border-t border-primary/20 px-4 py-3">
        {/* Travel profile indicator */}
        <AnimatePresence>
          {travelProfile && (
            <motion.div
              key="profile-badge"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-1.5 mb-2"
            >
              {isPlanningIntent(input) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
                  <Sparkles className="w-3 h-3" />
                  {i18n.language === "ar" ? "سيُخصَّص الرد حسب تفضيلاتك" : "Your preferences will be applied"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-muted-foreground/60 border border-border/30">
                  <Users className="w-3 h-3" />
                  {i18n.language === "ar" ? "تفضيلات الرحلة محفوظة" : "Travel profile loaded"}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative inline-block"
            >
              <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-primary/40 shadow-md" />
              <button onClick={clearImage}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:bg-destructive/80 transition-colors">
                <X className="w-3 h-3" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <button onClick={() => fileInputRef.current?.click()} disabled={isSending}
                  className="shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mb-0.5 disabled:opacity-40" title="Attach image">
            <ImagePlus className="w-4 h-4" />
          </button>

          <button
            onClick={async () => {
              // Always call getUserMedia directly inside the click handler —
              // this is required for iOS Safari's user-gesture restriction.
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
                  audio: false,
                });
                setCameraStream(stream);
                setShowARCamera(true);
              } catch (e: any) {
                // Permission denied or not yet requested → show explanation sheet
                setShowCamPermSheet(true);
              }
            }}
            disabled={isSending}
            className="shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mb-0.5 disabled:opacity-40 relative" title="AR Scanner"
          >
            <ScanLine className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </button>

          <button onClick={() => setShowGoldenAge(true)} disabled={isSending}
                  className="shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors mb-0.5 disabled:opacity-40 relative"
                  title={i18n.language === "ar" ? "العصر الذهبي" : "Golden Age"}>
            <Sparkles className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          </button>

          <div className="flex-1 relative bg-muted/30 border border-border/50 focus-within:border-primary/50 rounded-2xl transition-colors overflow-hidden shadow-inner">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none max-h-32 leading-relaxed"
              style={{ minHeight: "44px" }}
              disabled={isSending}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !imageFile) || isSending}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
          >
            <Send className="w-4 h-4 ml-0.5 -rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
