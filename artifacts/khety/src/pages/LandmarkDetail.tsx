import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { useLandmark } from "@/hooks/useLandmarks";
import { LoadingScarab } from "@/components/LoadingScarab";
import { ArrowLeft, Clock, MapPin, Ticket, Star, ChevronRight, Info, Heart, CheckCircle2, Map, MessageCircle, ShieldAlert, Images, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SAFETY_TIPS: Record<string, string> = {
  ancient: "Wear sun protection and carry water — most ancient sites have little shade.",
  museum: "Photography rules vary by room. Check signage before taking photos.",
  mosque: "Dress modestly and remove shoes before entering. Women should cover hair.",
  market: "Agree on prices before purchasing. Bargaining is expected at bazaars.",
  nature: "Stay on marked trails and hire a local guide for desert excursions.",
  church: "Dress modestly and respect the sacred space. Photography may be restricted.",
};

interface GalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
}

export default function LandmarkDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: landmark, isLoading, error } = useLandmark(id ?? null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [actionLoading, setActionLoading] = useState<"fav" | "visited" | null>(null);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLightbox, setGalleryLightbox] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("user_favorites").select("id").eq("user_id", user.id).eq("landmark_id", id).single()
      .then(({ data }) => setIsFavorited(!!data));
    supabase.from("user_visited").select("id").eq("user_id", user.id).eq("landmark_id", id).single()
      .then(({ data }) => setIsVisited(!!data));
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    supabase.from("landmark_images").select("id, image_url, sort_order")
      .eq("landmark_id", id).order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setGalleryImages(data);
          setGalleryOpen(true);
        }
      });
  }, [id]);

  async function toggleFavorite() {
    if (!user || !id) return;
    setActionLoading("fav");
    if (isFavorited) {
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("landmark_id", id);
      setIsFavorited(false);
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, landmark_id: id });
      setIsFavorited(true);
    }
    setActionLoading(null);
  }

  async function toggleVisited() {
    if (!user || !id) return;
    setActionLoading("visited");
    if (isVisited) {
      await supabase.from("user_visited").delete().eq("user_id", user.id).eq("landmark_id", id);
      setIsVisited(false);
    } else {
      await supabase.from("user_visited").insert({ user_id: user.id, landmark_id: id, visited_at: new Date().toISOString() });
      setIsVisited(true);
    }
    setActionLoading(null);
  }

  if (isLoading) return <LoadingScarab message="Unlocking history..." />;
  if (error || !landmark) return (
    <div className="p-8 text-center mt-20">
      <h2 className="text-2xl font-display font-bold text-destructive">Tomb sealed</h2>
      <p className="text-muted-foreground mt-2">Could not find this landmark.</p>
      <Link href="/explore"><Button className="mt-4">Return</Button></Link>
    </div>
  );

  const safetyTip = SAFETY_TIPS[landmark.category] || SAFETY_TIPS.ancient;
  const chatUrl = `/chat?about=${encodeURIComponent(landmark.name)}`;
  const mapUrl = `/map?landmark=${encodeURIComponent(landmark.id)}`;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto hide-scrollbar pb-20 bg-background">
      {/* Header Image */}
      <div className="relative h-72 w-full bg-muted shrink-0">
        {!imgError && landmark.image_url ? (
          <img
            src={landmark.image_url}
            alt={landmark.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-background flex items-center justify-center text-8xl opacity-30">𓂀</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background" />

        <Link href="/explore" className="absolute top-6 left-4">
          <Button size="icon" variant="ghost" className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-md rounded-full w-10 h-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {user && (
          <div className="absolute top-6 right-4 flex gap-2">
            <Button
              size="icon" variant="ghost" onClick={toggleVisited} disabled={actionLoading === "visited"}
              className={cn("backdrop-blur-md rounded-full w-10 h-10",
                isVisited ? "bg-green-500/80 text-white hover:bg-green-500/90" : "bg-black/20 text-white hover:bg-black/40"
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
            </Button>
            <Button
              size="icon" variant="ghost" onClick={toggleFavorite} disabled={actionLoading === "fav"}
              className={cn("backdrop-blur-md rounded-full w-10 h-10",
                isFavorited ? "bg-primary/80 text-white hover:bg-primary/90" : "bg-black/20 text-white hover:bg-black/40"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorited && "fill-white")} />
            </Button>
          </div>
        )}

        {/* Gallery count badge */}
        {galleryImages.length > 0 && (
          <button onClick={() => setGalleryLightbox(true)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 hover:bg-black/70 transition-colors">
            <Images className="w-3.5 h-3.5" /> {galleryImages.length} صور
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="px-5 -mt-10 relative z-10 pb-4">
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border/40 backdrop-blur-md">

          {/* Title + Rating */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-3">
              <h1 className="text-2xl font-display font-black text-foreground leading-tight">{landmark.name}</h1>
              {landmark.name_ar && (
                <p className="text-primary font-display font-bold text-sm tracking-wider opacity-80 mt-1" dir="rtl">{landmark.name_ar}</p>
              )}
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-sm font-bold border-0 flex items-center gap-1 px-2.5 py-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-primary" /> {Number(landmark.rating).toFixed(1)}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center text-muted-foreground text-sm mt-3 pb-4 border-b border-border/50">
            <MapPin className="w-4 h-4 mr-1 text-primary/70" />
            {landmark.city}{landmark.region ? `, ${landmark.region}` : ""}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 py-4 border-b border-border/50">
            <Link href={mapUrl} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-colors">
                <Map className="w-4 h-4" /> View on Map
              </button>
            </Link>
            <Link href={chatUrl} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 border border-primary/25 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-4 h-4" /> Ask Khety
              </button>
            </Link>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Hours</p>
                <p className="text-sm font-medium text-foreground">{landmark.opening_hours || "Varies"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Entry</p>
                <p className="text-sm font-medium text-foreground">{landmark.ticket_price || "Free"}</p>
              </div>
            </div>
          </div>

          {/* Historical Period */}
          {landmark.historical_period && (
            <div className="py-3 border-b border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Historical Period</p>
              <p className="text-sm text-foreground/80">{landmark.historical_period}</p>
            </div>
          )}

          {/* Gallery Strip */}
          {galleryOpen && galleryImages.length > 0 && (
            <div className="py-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-primary" /> ألبوم الصور
                </h3>
                <button onClick={() => { setGalleryIdx(0); setGalleryLightbox(true); }}
                  className="text-[10px] text-primary font-semibold hover:underline">عرض الكل</button>
              </div>
              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {galleryImages.map((img, i) => (
                  <button key={img.id} onClick={() => { setGalleryIdx(i); setGalleryLightbox(true); }}
                    className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/60 transition-all active:scale-95">
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="py-5">
            <h3 className="font-display font-bold text-lg mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{landmark.description}</p>
          </div>

          {/* Highlights */}
          {landmark.highlights && landmark.highlights.length > 0 && (
            <div className="mb-5 bg-primary/5 border border-primary/15 rounded-2xl p-4">
              <h3 className="font-display font-bold text-primary flex items-center text-sm mb-3">
                <Star className="w-4 h-4 mr-2 fill-primary" /> Highlights
              </h3>
              <ul className="space-y-1.5">
                {landmark.highlights.map((h, idx) => (
                  <li key={idx} className="text-sm text-foreground/80 flex items-start">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mr-1 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Tip */}
          <div className="mb-5">
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
              <h3 className="font-display font-bold text-amber-400 flex items-center text-sm mb-2">
                <ShieldAlert className="w-4 h-4 mr-2" /> Safety Tip
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{safetyTip}</p>
              <Link href="/safety">
                <span className="text-xs text-amber-400 font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                  View all safety info <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </div>

          {/* Local Tips */}
          {landmark.tips && landmark.tips.length > 0 && (
            <div className="py-2 mb-4">
              <div className="bg-card border border-border/60 rounded-2xl p-4">
                <h3 className="font-display font-bold text-foreground flex items-center text-sm mb-3">
                  <Info className="w-4 h-4 mr-2 text-primary" /> Local Tips
                </h3>
                <ul className="space-y-2">
                  {landmark.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex items-start">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mr-1 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tags */}
          {landmark.tags && landmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {landmark.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-muted/50 border-muted text-muted-foreground font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="pt-4 border-t border-border/50">
            <Link href={chatUrl}>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary font-bold text-sm hover:from-primary/30 transition-all">
                <span className="text-lg">𓂀</span>
                Ask Khety about {landmark.name}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {galleryLightbox && galleryImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/60">
              <p className="text-white/70 text-sm font-bold">{galleryIdx + 1} / {galleryImages.length}</p>
              <button onClick={() => setGalleryLightbox(false)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center relative px-12">
              <button onClick={() => setGalleryIdx(i => Math.max(0, i - 1))} disabled={galleryIdx === 0}
                className="absolute left-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-20">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <AnimatePresence mode="wait">
                <motion.img key={galleryIdx}
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  src={galleryImages[galleryIdx].image_url}
                  alt=""
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
              </AnimatePresence>
              <button onClick={() => setGalleryIdx(i => Math.min(galleryImages.length - 1, i + 1))} disabled={galleryIdx === galleryImages.length - 1}
                className="absolute right-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-20">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="shrink-0 flex gap-2 overflow-x-auto px-4 py-3 hide-scrollbar">
              {galleryImages.map((img, i) => (
                <button key={img.id} onClick={() => setGalleryIdx(i)}
                  className={cn("shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all",
                    i === galleryIdx ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100")}>
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
