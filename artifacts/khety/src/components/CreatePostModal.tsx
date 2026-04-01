import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, MapPin, Send, Loader2, Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

interface Landmark { id: string; name: string; name_ar: string | null; city: string | null; }

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, images: File[], locationTag: string, landmarkId?: string | null) => Promise<void>;
  userName?: string;
  avatarUrl?: string;
}

const MAX_IMAGES = 5;

export function CreatePostModal({ open, onClose, onSubmit, userName, avatarUrl }: CreatePostModalProps) {
  const { i18n } = useTranslation("t");
  const isRtl = i18n.language === "ar";

  const [content, setContent]         = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [landmarkId, setLandmarkId]   = useState<string | null>(null);
  const [images, setImages]           = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [allLandmarks, setAllLandmarks]   = useState<Landmark[]>([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [landmarksLoaded, setLandmarksLoaded] = useState(false);

  const fileRef     = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials    = (userName || "U").slice(0, 2).toUpperCase();

  // Load landmarks once
  useEffect(() => {
    if (!open || landmarksLoaded) return;
    (async () => {
      const { data } = await supabase
        .from("landmarks").select("id, name, name_ar, city")
        .eq("is_published", true).order("name").limit(200);
      if (data) { setAllLandmarks(data as Landmark[]); setLandmarksLoaded(true); }
    })();
  }, [open, landmarksLoaded]);

  // Outside click closes dropdown
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = allLandmarks.filter((lm) => {
    const q = searchQuery.toLowerCase();
    return lm.name.toLowerCase().includes(q) || (lm.name_ar || "").toLowerCase().includes(q) || (lm.city || "").toLowerCase().includes(q);
  });

  function selectLandmark(lm: Landmark) {
    const label = isRtl && lm.name_ar ? lm.name_ar : lm.name;
    setLocationTag(label); setLandmarkId(lm.id); setSearchQuery(label); setDropdownOpen(false);
  }

  function clearLandmark() { setLocationTag(""); setLandmarkId(null); setSearchQuery(""); }

  function addImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);
    const oversized = toAdd.find((f) => f.size > 8 * 1024 * 1024);
    if (oversized) { setError(isRtl ? "صورة أكبر من 8MB" : "An image exceeds 8MB"); return; }
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!content.trim() && images.length === 0) return;
    setLoading(true); setError(null);
    try {
      await onSubmit(content, images, locationTag, landmarkId);
      resetForm(); onClose();
    } catch (e: any) {
      setError(e.message || (isRtl ? "حدث خطأ" : "Something went wrong"));
    } finally { setLoading(false); }
  }

  function resetForm() {
    setContent(""); setLocationTag(""); setLandmarkId(null); setSearchQuery("");
    setImages([]); setPreviews([]); setError(null); setDropdownOpen(false);
  }

  function handleClose() { if (loading) return; resetForm(); onClose(); }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-[101] bg-[#111008] border-t border-white/8 rounded-t-3xl px-4 pt-3"
            style={{ maxWidth: 448, margin: "0 auto", paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-3" />

            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-black text-foreground">
                {isRtl ? "مشاركة ذكرى" : "Share a Memory"}
              </h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* User + textarea */}
            <div className="flex items-start gap-3 mb-3">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
                : <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary">{initials}</span>
                  </div>
              }
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isRtl ? "شارك ذكرياتك في مصر…" : "Share your Egypt memories…"}
                maxLength={1000} rows={3}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
                autoFocus
              />
            </div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
                {previews.map((src, i) => (
                  <div key={i} className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-white/10">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 end-1 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1 hover:border-primary/40 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5 text-muted-foreground/50" />
                    <span className="text-[9px] text-muted-foreground/40">{images.length}/{MAX_IMAGES}</span>
                  </button>
                )}
              </div>
            )}

            {/* Location dropdown */}
            <div ref={dropdownRef} className="relative mb-3">
              <div className={`flex items-center gap-2 bg-white/4 border rounded-xl px-3 py-2 transition-colors ${dropdownOpen ? "border-primary/40" : "border-white/8"}`}>
                <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setLocationTag(e.target.value); setLandmarkId(null); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder={isRtl ? "ابحث عن المكان…" : "Search for a place…"}
                  maxLength={80}
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
                {searchQuery
                  ? <button onClick={clearLandmark}><X className="w-3 h-3 text-muted-foreground/50" /></button>
                  : <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                }
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.13 }}
                    className="absolute bottom-full mb-1 inset-x-0 z-10 bg-[#111008] border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    style={{ maxHeight: 210 }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/6">
                      <Search className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                      <span className="text-[10px] text-muted-foreground/50">{filtered.length} {isRtl ? "مكان" : "places"}</span>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 168 }}>
                      {filtered.length === 0
                        ? <p className="text-xs text-muted-foreground/50 text-center py-4">{isRtl ? "لا توجد نتائج" : "No results"}</p>
                        : filtered.map((lm) => {
                            const label = isRtl && lm.name_ar ? lm.name_ar : lm.name;
                            const sub   = isRtl && lm.name_ar ? lm.name : lm.name_ar;
                            return (
                              <button key={lm.id}
                                onMouseDown={(e) => { e.preventDefault(); selectLandmark(lm); }}
                                className={`w-full text-start px-3 py-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors ${landmarkId === lm.id ? "bg-primary/8" : ""}`}
                              >
                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                                  <MapPin className="w-3 h-3 text-primary/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-semibold truncate ${landmarkId === lm.id ? "text-primary" : "text-foreground"}`}>{label}</p>
                                  {sub && <p className="text-[10px] text-muted-foreground/50 truncate">{sub}</p>}
                                </div>
                                {lm.city && <span className="text-[10px] text-muted-foreground/40 shrink-0">{lm.city}</span>}
                              </button>
                            );
                          })
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

            {/* Actions bar */}
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImages} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-muted-foreground hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <ImagePlus className="w-4 h-4" />
                {images.length > 0 ? `${images.length}/${MAX_IMAGES}` : (isRtl ? "صور" : "Photos")}
              </button>

              <span className="text-[10px] text-muted-foreground/40 flex-1 text-end">{content.length}/1000</span>

              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && images.length === 0)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-black text-sm font-bold disabled:opacity-40 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" />{isRtl ? "نشر" : "Post"}</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
