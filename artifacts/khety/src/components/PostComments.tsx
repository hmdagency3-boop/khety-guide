import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Loader2, MessageCircle } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OfficialBadge } from "@/components/OfficialBadge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { usePostComments } from "@/hooks/usePostComments";

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
  commentsCount: number;
  onCountChange: (delta: number) => void;
  isRtl: boolean;
}

/** Button shown in the footer row */
export function PostCommentsButton({
  commentsCount,
  open,
  onToggle,
}: {
  commentsCount: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 group">
      <MessageCircle
        style={{ width: 19, height: 19 }}
        className={`transition-colors ${open ? "text-primary fill-primary/20" : "text-muted-foreground/60 group-hover:text-primary/70"}`}
      />
      {commentsCount > 0 && (
        <span className={`text-xs font-bold transition-colors ${open ? "text-primary" : "text-muted-foreground/60"}`}>
          {commentsCount}
        </span>
      )}
    </button>
  );
}

/** Expandable panel rendered below the footer */
export function PostCommentsPanel({
  postId, currentUserId, open, onCountChange, isRtl,
}: PostCommentsProps & { open: boolean }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const { comments, loading, submitting, fetchComments, addComment, deleteComment } = usePostComments(postId, currentUserId);

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, comments.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    const val = text;
    setText("");
    await addComment(val);
    onCountChange(1);
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }

  async function handleDelete(commentId: string) {
    await deleteComment(commentId);
    onCountChange(-1);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="border-t border-white/6 pt-1 pb-3">

            {/* Comment list */}
            <div ref={listRef} className="max-h-60 overflow-y-auto hide-scrollbar space-y-3 px-4 pt-3 pb-1">
              {loading && (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
                </div>
              )}
              {!loading && comments.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground/40 py-2">
                  {isRtl ? "لا توجد تعليقات بعد، كن أول من يعلّق!" : "No comments yet — be the first!"}
                </p>
              )}
              {comments.map((c) => {
                const isOwn = c.user_id === currentUserId;
                const name  = c.author_name || (isRtl ? "مستخدم" : "User");
                const initials = name.slice(0, 2).toUpperCase();
                const timeAgo = formatDistanceToNow(new Date(c.created_at), {
                  addSuffix: true, locale: isRtl ? ar : undefined,
                });
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 group/comment"
                  >
                    {/* Avatar */}
                    {c.author_avatar
                      ? <img src={c.author_avatar} alt={name}
                          className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5" />
                      : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-primary">{initials}</span>
                        </div>
                    }

                    {/* Bubble */}
                    <div className="flex-1 min-w-0">
                      <div className="inline-block bg-white/5 border border-white/6 rounded-2xl rounded-tl-sm px-3 py-2 max-w-full">
                        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                          <span className="text-[11px] font-bold text-foreground leading-none">{name}</span>
                          {c.author_verified && <VerifiedBadge size={11} />}
                          {c.author_official && <OfficialBadge size="sm" />}
                        </div>
                        <p className="text-xs text-foreground/85 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/35 mt-0.5 px-1">{timeAgo}</p>
                    </div>

                    {/* Delete */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="shrink-0 w-6 h-6 rounded-full hover:bg-red-500/10 flex items-center justify-center opacity-0 group-hover/comment:opacity-100 transition-all mt-0.5"
                      >
                        <Trash2 className="w-3 h-3 text-red-400/70" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Input */}
            {currentUserId ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pt-3">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={isRtl ? "أضف تعليقاً…" : "Add a comment…"}
                  maxLength={500}
                  className="flex-1 min-w-0 bg-white/5 border border-white/8 rounded-2xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 transition-colors"
                  dir={isRtl ? "rtl" : "ltr"}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="w-8 h-8 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                >
                  {submitting
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Send className="w-3.5 h-3.5 text-white" style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
                  }
                </button>
              </form>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground/40 px-4 pt-3">
                {isRtl ? "سجّل الدخول للتعليق" : "Sign in to comment"}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
