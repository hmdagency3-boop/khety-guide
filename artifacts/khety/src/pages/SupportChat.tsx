import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, MessageCircle, CheckCheck, Clock, X, AlertCircle, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { LocationMapBubble } from "@/components/LocationMapBubble";
import { isLocationMessage } from "@/lib/locationUtils";
import { useTranslation } from "react-i18next";

const CHAT_TOKEN_KEY = "khety_support_token";

type Message = {
  id: number;
  chat_id: number;
  sender_type: "user" | "admin";
  sender_name: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

type Chat = {
  id: number;
  chat_token: string;
  user_email: string;
  user_name: string;
  status: string;
  unread_user: number;
};

export default function SupportChat() {
  const { user, profile } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation("t");

  const [step, setStep] = useState<"form" | "chat">("form");
  const [nameInput, setNameInput] = useState(profile?.display_name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [sharingLocation, setSharingLocation] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Track message IDs we added optimistically so we don't double-add from Realtime
  const optimisticIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (user?.email) setEmailInput(user.email);
    if (profile?.display_name) setNameInput(profile.display_name);
  }, [user, profile]);

  // Try to restore existing session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(CHAT_TOKEN_KEY);
    if (savedToken) {
      restoreChatFromToken(savedToken);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Polling fallback (3 s) — works even when Realtime isn't configured ──
  useEffect(() => {
    if (!chat) return;
    const token = chat.chat_token;
    const id = setInterval(async () => {
      const { data } = await supabase.rpc("get_support_messages_by_token", { p_token: token });
      if (!data) return;
      const incoming = data as Message[];
      setMessages((prev) => {
        if (incoming.length === prev.length) return prev;
        if (incoming.length > prev.length) {
          const last = incoming[incoming.length - 1];
          if (last.sender_type === "admin") {
            setHasNewMessage(true);
            setTimeout(() => setHasNewMessage(false), 3000);
          }
        }
        return incoming;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [chat?.chat_token]);

  // ─── Supabase Realtime subscription (instant, requires support_realtime.sql) ─
  useEffect(() => {
    if (!chat || chat.id <= 0) return;

    // Tear down previous channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const token = chat.chat_token;
    const chatId = chat.id;

    const channel = supabase
      .channel(`support_messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const incoming = payload.new as Message;

          // Skip if we already added this message optimistically
          if (optimisticIds.current.has(incoming.id)) {
            optimisticIds.current.delete(incoming.id);
            return;
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            if (incoming.sender_type === "admin") {
              setHasNewMessage(true);
              setTimeout(() => setHasNewMessage(false), 3000);
            }
            return [...prev, incoming];
          });

          if (incoming.sender_type === "admin") {
            await supabase.rpc("mark_messages_read_by_token", {
              p_token: token,
              p_side: "user",
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chat?.id]);

  async function restoreChatFromToken(token: string) {
    const { data } = await supabase.rpc("get_support_chat_by_token", { p_token: token });
    if (data && data.length > 0) {
      const c = data[0] as Chat;
      if (c.status !== "closed") {
        setChat(c);
        setNameInput(c.user_name);
        setEmailInput(c.user_email);
        setStep("chat");
        await fetchMessages(token);
      } else {
        localStorage.removeItem(CHAT_TOKEN_KEY);
      }
    } else {
      localStorage.removeItem(CHAT_TOKEN_KEY);
    }
  }

  const fetchMessages = useCallback(async (token: string) => {
    const { data } = await supabase.rpc("get_support_messages_by_token", { p_token: token });
    if (!data) return;
    setMessages(data as Message[]);
    await supabase.rpc("mark_messages_read_by_token", { p_token: token, p_side: "user" });
  }, []);

  async function startChat() {
    if (!nameInput.trim() || !emailInput.trim()) {
      setError(t("support.error_fields"));
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const chatToken: string = crypto.randomUUID();

      const { error: insertErr } = await supabase.from("support_chats").insert({
        chat_token: chatToken,
        user_id: user?.id || null,
        user_email: emailInput.trim(),
        user_name: nameInput.trim(),
        user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        user_device: /mobile/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        user_browser: navigator.userAgent.split(" ").pop() || "",
        user_os: navigator.platform,
        status: "open",
      });

      if (insertErr) throw new Error(insertErr.message);

      localStorage.setItem(CHAT_TOKEN_KEY, chatToken);

      // Send greeting via SECURITY DEFINER RPC (bypasses RLS)
      await supabase.rpc("send_support_message_by_token", {
        p_token: chatToken,
        p_content: `Hello! I'm ${nameInput.trim()}, I need assistance.`,
        p_sender_name: nameInput.trim(),
      });

      // Fetch real chat object to get the proper id (needed for Realtime filter)
      const { data: chatData } = await supabase.rpc("get_support_chat_by_token", {
        p_token: chatToken,
      });
      const realChat = (chatData?.[0] as Chat) ?? {
        id: 0,
        chat_token: chatToken,
        user_email: emailInput.trim(),
        user_name: nameInput.trim(),
        status: "open",
        unread_user: 0,
      };

      setChat(realChat);
      setStep("chat");
      await fetchMessages(chatToken);
    } catch (e: any) {
      setError(e.message);
    }
    setStarting(false);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !chat || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic insert with a temporary negative id
    const tempId = -Date.now();
    const optimistic: Message = {
      id: tempId,
      chat_id: chat.id,
      sender_type: "user",
      sender_name: nameInput,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const { data: sent, error: rpcErr } = await supabase.rpc("send_support_message_by_token", {
        p_token: chat.chat_token,
        p_content: content,
        p_sender_name: nameInput,
      });
      if (rpcErr) throw new Error(rpcErr.message);

      // Replace optimistic message with real one (Realtime might also fire — track real id)
      if (sent?.id) {
        optimisticIds.current.add(sent.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...sent } : m))
        );
      } else {
        // Fallback: refetch
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        await fetchMessages(chat.chat_token);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(t("support.error_send"));
    }
    setSending(false);
  }

  async function shareLocation(msgId: number) {
    if (!chat) return;
    setSharingLocation(msgId);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const content = `📍 موقعي الحالي:\nhttps://maps.google.com/?q=${latitude},${longitude}\n(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
      await supabase.rpc("send_support_message_by_token", {
        p_token: chat.chat_token,
        p_content: content,
        p_sender_name: nameInput,
      });
      await fetchMessages(chat.chat_token);
    } catch (e: any) {
      if (e.code === 1) {
        setError(t("support.location_denied"));
      } else {
        setError(t("support.location_fail"));
      }
    }
    setSharingLocation(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  const statusColor: Record<string, string> = {
    open: "text-amber-400 bg-amber-400/10",
    active: "text-emerald-400 bg-emerald-400/10",
    resolved: "text-blue-400 bg-blue-400/10",
    closed: "text-muted-foreground bg-muted",
  };
  const statusLabel: Record<string, string> = {
    open: t("support.status_open"),
    active: t("support.status_active"),
    resolved: t("support.status_resolved"),
    closed: t("support.status_closed"),
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 bg-card border-b border-border/40 px-4 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="relative">
              <img src="/khety-avatar.png" alt="خيتي" className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("support.team")}</p>
              <p className="text-[11px] text-muted-foreground">{t("support.team_status")}</p>
            </div>
          </div>
          {chat && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                statusColor[chat.status] || "text-muted-foreground bg-muted"
              )}
            >
              {statusLabel[chat.status] || chat.status}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 shrink-0"
          >
            <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
            <p className="text-xs text-destructive flex-1">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New reply notification */}
      <AnimatePresence>
        {hasNewMessage && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="shrink-0 mx-4 mt-2 bg-primary/15 border border-primary/30 rounded-xl px-3 py-2 text-xs text-primary font-medium flex items-center gap-2"
          >
            <MessageCircle className="w-3.5 h-3.5" /> {t("support.new_reply")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM STEP */}
      {step === "form" && (
        <div className="flex-1 overflow-y-auto flex flex-col justify-center p-6">
          <div className="bg-card rounded-2xl border border-border/40 p-6 space-y-4">
            <div className="text-center mb-2">
              <img src="/khety-avatar.png" alt="خيتي" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
              <h2 className="text-base font-bold text-foreground">{t("support.title")}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t("support.form_desc")}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("support.name_label")} *
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t("support.name_placeholder")}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("support.email_label")} *
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="ltr"
              />
            </div>

            <button
              onClick={startChat}
              disabled={starting || !nameInput.trim() || !emailInput.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {starting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" /> {t("support.start_btn")}
                </>
              )}
            </button>

            <p className="text-[11px] text-muted-foreground text-center">
              {t("support.response_note")}
            </p>
          </div>
        </div>
      )}

      {/* CHAT STEP */}
      {step === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex justify-center">
              <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                {t("support.chat_opened")}
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender_type === "user";

              if (msg.content === "__LOCATION_REQUEST__" && !isUser) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 flex-row"
                  >
                    <img src="/khety-avatar.png" alt="خيتي" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                    <div className="max-w-[80%] flex flex-col items-start">
                      <div className="bg-card border border-blue-400/40 rounded-2xl rounded-tl-md px-4 py-3 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                          <p className="text-xs font-bold text-foreground">
                            {t("support.location_request")}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {t("support.location_desc")}
                        </p>
                        <button
                          onClick={() => shareLocation(msg.id)}
                          disabled={sharingLocation === msg.id}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-400 text-xs font-bold transition-all hover:bg-blue-500/25 active:scale-95 disabled:opacity-60"
                        >
                          {sharingLocation === msg.id ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              {t("support.locating")}
                            </>
                          ) : (
                            <>
                              <Navigation className="w-3.5 h-3.5" /> {t("support.share_location")}
                            </>
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              // Location message → embedded map
              if (isLocationMessage(msg.content)) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
                  >
                    {!isUser && (
                      <img src="/khety-avatar.png" alt="خيتي" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                    )}
                    <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start", "flex flex-col")}>
                      <div className={cn(
                        "rounded-2xl overflow-hidden p-2.5",
                        isUser ? "bg-primary/10 border border-primary/20 rounded-tr-md" : "bg-card border border-border/40 rounded-tl-md"
                      )}>
                        <LocationMapBubble
                          content={msg.content}
                          time={formatTime(msg.created_at)}
                          isUser={isUser}
                        />
                      </div>
                      {isUser && (
                        <div className="flex items-center gap-1 mt-0.5 px-1">
                          {msg.read_at
                            ? <CheckCheck className="w-3 h-3 text-primary" />
                            : <Clock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
                >
                  {!isUser && (
                    <img src="/khety-avatar.png" alt="خيتي" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                  )}
                  <div className={cn("max-w-[75%] flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-md"
                          : "bg-card border border-border/40 text-foreground rounded-tl-md"
                      )}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                      {isUser && (
                        msg.read_at ? (
                          <CheckCheck className="w-3 h-3 text-primary" />
                        ) : (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {messages.length === 0 && (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <img src="/khety-avatar.png" alt="خيتي" className="w-12 h-12 rounded-full object-cover mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">أرسل رسالتك الأولى لبدء المحادثة</p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 bg-card border-t border-border/40 px-4 py-3 pb-safe">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("support.type_placeholder")}
                rows={1}
                dir="rtl"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed max-h-24"
                style={{ fieldSizing: "content" } as any}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-primary-foreground" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
