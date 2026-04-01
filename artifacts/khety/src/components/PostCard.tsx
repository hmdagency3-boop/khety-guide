import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Trash2, MoreHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OfficialBadge } from "@/components/OfficialBadge";
import { PostCommentsButton, PostCommentsPanel } from "@/components/PostComments";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import type { CommunityPost } from "@/hooks/useCommunityPosts";

interface FloatingHeart {
  id: number; x: number; y: number;
  size: number; color: string; dx: number; rotate: number;
}

interface PostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

const HEART_COLORS = ["#f43f5e","#fb7185","#fda4af","#e11d48","#ff6b6b","#ff8fab","#ff4d6d","#c9184a"];
let heartIdCounter = 0;

export function PostCard({ post, currentUserId, onLike, onDelete }: PostCardProps) {
  const { i18n } = useTranslation("t");
  const isRtl   = i18n.language === "ar";
  const isOwner = currentUserId === post.user_id;

  const [menuOpen, setMenuOpen]           = useState(false);
  const [slideIdx, setSlideIdx]           = useState(0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count ?? 0);
  const [commentsOpen, setCommentsOpen]   = useState(false);
  const [tapHearts, setTapHearts]         = useState<FloatingHeart[]>([]);
  const [bigHeart, setBigHeart]           = useState<{ x: number; y: number; key: number } | null>(null);

  const scrollRef       = useRef<HTMLDivElement>(null);
  const imageWrapRef    = useRef<HTMLDivElement>(null);
  const lastTapTimeRef  = useRef<number>(0);
  const bigHeartKey     = useRef(0);

  // ── Zoom overlay refs (pure DOM — zero React re-renders during gesture) ──
  const overlayImgRef   = useRef<HTMLImageElement>(null);
  const overlayDivRef   = useRef<HTMLDivElement>(null);
  const overlayBgRef    = useRef<HTMLDivElement>(null);
  const srcImgRef       = useRef<HTMLImageElement | null>(null); // currently-visible img element

  // Pinch tracking — all refs, no state
  const isPinching      = useRef(false);
  const pinchDist0      = useRef(0);
  const currentScale    = useRef(1);
  const originX         = useRef(0);
  const originY         = useRef(0);

  const images = post.image_urls?.length > 0 ? post.image_urls : post.image_url ? [post.image_url] : [];

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true, locale: isRtl ? ar : undefined,
  });
  const displayName = post.profile?.display_name || (isRtl ? "مستخدم" : "User");
  const initials    = displayName.slice(0, 2).toUpperCase();

  function scrollTo(idx: number) {
    if (isPinching.current) return;
    setSlideIdx(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  // ── Show / hide the fixed overlay (all DOM, no React state) ─────────
  function showOverlay(src: string, rect: DOMRect, midX: number, midY: number) {
    const ov = overlayDivRef.current;
    const bg = overlayBgRef.current;
    const im = overlayImgRef.current;
    if (!ov || !bg || !im) return;

    im.src = src;
    ov.style.transition = "none";
    ov.style.left    = `${rect.left}px`;
    ov.style.top     = `${rect.top}px`;
    ov.style.width   = `${rect.width}px`;
    ov.style.height  = `${rect.height}px`;
    ov.style.transformOrigin = `${midX - rect.left}px ${midY - rect.top}px`;
    ov.style.transform  = "scale(1)";
    ov.style.visibility = "visible";
    bg.style.transition = "none";
    bg.style.opacity    = "0";
    bg.style.visibility = "visible";
  }

  function updateOverlayScale(s: number) {
    const ov = overlayDivRef.current;
    const bg = overlayBgRef.current;
    if (!ov || !bg) return;
    ov.style.transform = `scale(${s})`;
    bg.style.opacity   = `${Math.min(0.55, (s - 1) * 0.55)}`;
  }

  function hideOverlay() {
    const ov = overlayDivRef.current;
    const bg = overlayBgRef.current;
    if (!ov || !bg) return;

    // Animate back to scale(1), then hide
    ov.style.transition = "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)";
    bg.style.transition = "opacity 0.28s ease";
    ov.style.transform  = "scale(1)";
    bg.style.opacity    = "0";

    function onEnd() {
      ov.removeEventListener("transitionend", onEnd);
      ov.style.visibility = "hidden";
      bg.style.visibility = "hidden";
      ov.style.transition = "none";
      bg.style.transition = "none";
      // Restore source image
      if (srcImgRef.current) srcImgRef.current.style.opacity = "1";
      srcImgRef.current = null;
    }
    ov.addEventListener("transitionend", onEnd);

    // Fallback in case transitionend doesn't fire
    setTimeout(onEnd, 400);
  }

  // ── Non-passive touch listeners for pinch ───────────────────────────
  useEffect(() => {
    const el = imageWrapRef.current;
    if (!el) return;

    function d2(t: TouchList) {
      const dx = t[1].clientX - t[0].clientX;
      const dy = t[1].clientY - t[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      isPinching.current  = true;
      pinchDist0.current  = d2(e.touches);
      currentScale.current = 1;

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      originX.current = midX;
      originY.current = midY;

      const scroll = scrollRef.current;
      const imgIdx = scroll ? Math.round(scroll.scrollLeft / scroll.clientWidth) : 0;
      if (scroll) scroll.style.overflowX = "hidden";

      const rect = el.getBoundingClientRect();

      // Find and hide the source img element
      const imgs = el.querySelectorAll("img");
      const srcImg = imgs[imgIdx] as HTMLImageElement | undefined;
      if (srcImg) {
        srcImgRef.current = srcImg;
        srcImg.style.opacity = "0";
      }

      showOverlay(images[imgIdx] ?? images[0], rect, midX, midY);
    }

    function onTouchMove(e: TouchEvent) {
      if (!isPinching.current || e.touches.length !== 2) return;
      e.preventDefault();
      const s = Math.max(1, Math.min(5, d2(e.touches) / pinchDist0.current));
      currentScale.current = s;
      updateOverlayScale(s);
    }

    function onTouchEnd() {
      if (!isPinching.current) return;
      isPinching.current = false;
      if (scrollRef.current) scrollRef.current.style.overflowX = "auto";

      if (currentScale.current < 1.05) {
        // Barely moved — instant hide, restore image
        const ov = overlayDivRef.current;
        const bg = overlayBgRef.current;
        if (ov) { ov.style.visibility = "hidden"; }
        if (bg) { bg.style.visibility = "hidden"; }
        if (srcImgRef.current) srcImgRef.current.style.opacity = "1";
        srcImgRef.current = null;
      } else {
        hideOverlay();
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    el.addEventListener("touchcancel",onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [images]);

  // ── Hearts ────────────────────────────────────────────────────────
  const fireHearts = useCallback((tapX: number, tapY: number) => {
    bigHeartKey.current += 1;
    setBigHeart({ x: tapX, y: tapY, key: bigHeartKey.current });
    const count = 8 + Math.floor(Math.random() * 5);
    const newHearts: FloatingHeart[] = Array.from({ length: count }, () => {
      heartIdCounter += 1;
      return {
        id: heartIdCounter,
        x: tapX + (Math.random() - 0.5) * 80,
        y: tapY + (Math.random() - 0.5) * 40,
        size: 14 + Math.random() * 22,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        dx: (Math.random() - 0.5) * 120,
        rotate: (Math.random() - 0.5) * 60,
      };
    });
    setTapHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setTapHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)));
    }, 1400);
  }, []);

  // ── Double-tap to like ────────────────────────────────────────────
  const handleImageTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPinching.current) return;
    const now   = Date.now();
    const delta = now - lastTapTimeRef.current;
    const rect  = imageWrapRef.current?.getBoundingClientRect();
    const tapX  = rect ? e.clientX - rect.left : 0;
    const tapY  = rect ? e.clientY - rect.top  : 0;
    if (delta < 320 && delta > 0) {
      lastTapTimeRef.current = 0;
      if (!post.liked_by_me) onLike(post.id);
      fireHearts(tapX, tapY);
    } else {
      lastTapTimeRef.current = now;
    }
  }, [post.id, post.liked_by_me, onLike, fireHearts]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card/50 rounded-3xl overflow-hidden shadow-sm ${
          post.profile?.is_official
            ? "border border-amber-500/35 shadow-amber-500/8"
            : "border border-white/6"
        }`}
      >
        {/* ── Official banner ── */}
        {post.profile?.is_official && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-amber-500/15"
            style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.08) 0%, transparent 100%)" }}>
            <span style={{ fontSize: 11 }}>𓇳</span>
            <span className="text-[10px] font-black tracking-widest text-amber-400/80 uppercase">
              {isRtl ? "منشور رسمي من خيتي" : "Official Khety Post"}
            </span>
          </div>
        )}
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Link href={`/user/${post.user_id}`}>
            <span className="shrink-0 cursor-pointer">
              {post.profile?.avatar_url
                ? <img src={post.profile.avatar_url} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-white/10 hover:border-primary/40 transition-colors" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 hover:border-primary/50 flex items-center justify-center transition-colors">
                    <span className="text-xs font-black text-primary">{initials}</span>
                  </div>
              }
            </span>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/user/${post.user_id}`}>
              <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
                <span className="text-sm font-bold text-foreground leading-none truncate">{displayName}</span>
                {(post.author_verified || post.profile?.is_verified) && <VerifiedBadge size={15} />}
                {post.profile?.is_official && <OfficialBadge size="sm" />}
              </span>
            </Link>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {post.location_tag && (
                post.landmark_id
                  ? <Link href={`/landmarks/${post.landmark_id}`}>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-primary font-semibold bg-primary/8 rounded-full px-2 py-0.5 cursor-pointer hover:bg-primary/15 transition-colors">
                        <MapPin className="w-2.5 h-2.5" />{post.location_tag}<ChevronRight className="w-2.5 h-2.5 opacity-70" />
                      </span>
                    </Link>
                  : <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70 bg-white/4 rounded-full px-2 py-0.5">
                      <MapPin className="w-2.5 h-2.5" />{post.location_tag}
                    </span>
              )}
              <span className="text-[10px] text-muted-foreground/40">{timeAgo}</span>
            </div>
          </div>
          {isOwner && (
            <div className="relative shrink-0">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-white/4 flex items-center justify-center hover:bg-white/8 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground/70" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute end-0 top-9 bg-card border border-border/60 rounded-2xl p-1 shadow-xl z-10 min-w-[130px]">
                    <button onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold">
                      <Trash2 className="w-3.5 h-3.5" />
                      {isRtl ? "حذف المنشور" : "Delete post"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{post.content}</p>
          </div>
        )}

        {/* ── Image carousel ── */}
        {images.length > 0 && (
          <div ref={imageWrapRef} className="relative select-none" onClick={handleImageTap}>
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              onScroll={(e) => {
                const el  = e.currentTarget;
                const idx = Math.round(el.scrollLeft / el.clientWidth);
                setSlideIdx(idx);
              }}
            >
              {images.map((src, i) => (
                <div key={i} className="shrink-0 w-full snap-center">
                  <img src={src} alt={`post-${i}`}
                    className="w-full object-cover pointer-events-none"
                    style={{ maxHeight: 340, display: "block" }}
                    loading="lazy" draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Hearts */}
            <AnimatePresence>
              {bigHeart && (
                <motion.div key={bigHeart.key}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.35, 1.1], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.55, times: [0, 0.45, 1] }}
                  onAnimationComplete={() => setBigHeart(null)}
                  className="absolute pointer-events-none z-20"
                  style={{ left: bigHeart.x, top: bigHeart.y, transform: "translate(-50%,-50%)" }}
                >
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="#f43f5e"
                    style={{ filter: "drop-shadow(0 0 12px rgba(244,63,94,0.7))" }}>
                    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {tapHearts.map((h) => (
                <motion.div key={h.id}
                  initial={{ opacity: 1, scale: 0, x: h.x, y: h.y }}
                  animate={{ opacity: [1,1,0], scale: [0,1,0.7], x: h.x+h.dx, y: h.y-130-Math.random()*80, rotate: h.rotate }}
                  transition={{ duration: 1.1+Math.random()*0.3, ease: "easeOut" }}
                  className="absolute pointer-events-none z-20"
                  style={{ originX:"50%", originY:"50%", marginLeft:-(h.size/2), marginTop:-(h.size/2) }}
                >
                  <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}
                    style={{ filter:`drop-shadow(0 0 4px ${h.color}80)` }}>
                    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                  </svg>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Nav */}
            {images.length > 1 && (
              <>
                {slideIdx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); scrollTo(slideIdx-1); }}
                    className="absolute start-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                    {isRtl ? <ChevronRight className="w-4 h-4 text-white"/> : <ChevronLeft className="w-4 h-4 text-white"/>}
                  </button>
                )}
                {slideIdx < images.length-1 && (
                  <button onClick={(e) => { e.stopPropagation(); scrollTo(slideIdx+1); }}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                    {isRtl ? <ChevronLeft className="w-4 h-4 text-white"/> : <ChevronRight className="w-4 h-4 text-white"/>}
                  </button>
                )}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10">
                  {images.map((_,i) => (
                    <button key={i} onClick={(e)=>{e.stopPropagation();scrollTo(i);}}
                      className={`rounded-full transition-all ${i===slideIdx?"w-4 h-1.5 bg-white":"w-1.5 h-1.5 bg-white/40"}`}/>
                  ))}
                </div>
                <div className="absolute top-2 end-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-white z-10">
                  {slideIdx+1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center gap-4 px-4 pt-3 pb-1">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 group">
            <motion.div whileTap={{ scale: 1.5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Heart className={`transition-colors ${post.liked_by_me ? "fill-rose-500 text-rose-500" : "text-muted-foreground/60 group-hover:text-rose-400"}`} style={{ width:19, height:19 }} />
            </motion.div>
            {post.likes_count > 0 && (
              <span className={`text-xs font-bold transition-colors ${post.liked_by_me ? "text-rose-400" : "text-muted-foreground/60"}`}>
                {post.likes_count}
              </span>
            )}
          </button>
          <PostCommentsButton commentsCount={commentsCount} open={commentsOpen} onToggle={() => setCommentsOpen((v)=>!v)} />
        </div>

        <PostCommentsPanel
          postId={post.id} currentUserId={currentUserId}
          commentsCount={commentsCount} onCountChange={(d)=>setCommentsCount((c)=>c+d)}
          isRtl={isRtl} open={commentsOpen}
        />
      </motion.div>

      {/* ── Fixed zoom overlay — always in DOM, shown/hidden via visibility ── */}
      {/* Background dim */}
      <div
        ref={overlayBgRef}
        style={{
          position: "fixed", inset: 0,
          background: "black", opacity: 0,
          visibility: "hidden", zIndex: 9998,
          pointerEvents: "none",
        }}
      />
      {/* Zoomed image */}
      <div
        ref={overlayDivRef}
        style={{
          position: "fixed", left: 0, top: 0,
          width: 0, height: 0,
          visibility: "hidden", zIndex: 9999,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <img
          ref={overlayImgRef}
          alt="zoom"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          draggable={false}
        />
      </div>
    </>
  );
}
