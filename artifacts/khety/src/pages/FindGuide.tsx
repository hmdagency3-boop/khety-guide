import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, Star, Languages, Wallet, Filter, Search, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Guide = {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  specialties: string[];
  bio: string;
  experience: string;
};

const MOCK_GUIDES: Guide[] = [
  {
    id: "g1",
    name: "Ahmed Hassan",
    avatar: "𓅓",
    languages: ["Arabic", "English", "French"],
    rating: 4.9,
    reviewCount: 127,
    priceRange: "$40–60/day",
    specialties: ["Ancient Sites", "Pyramids", "Cairo"],
    bio: "Licensed guide with 12 years of experience in pharaonic history and Giza complex.",
    experience: "12 years",
  },
  {
    id: "g2",
    name: "Sara El-Masry",
    avatar: "𓂀",
    languages: ["Arabic", "English", "German"],
    rating: 4.8,
    reviewCount: 89,
    priceRange: "$35–50/day",
    specialties: ["Museums", "Cairo", "Islamic Cairo"],
    bio: "Archaeologist turned guide, specialising in Egyptian Museum and Islamic heritage.",
    experience: "8 years",
  },
  {
    id: "g3",
    name: "Youssef Nour",
    avatar: "𓃭",
    languages: ["Arabic", "English", "Spanish", "Italian"],
    rating: 4.7,
    reviewCount: 203,
    priceRange: "$45–65/day",
    specialties: ["Luxor", "Karnak", "Valley of the Kings"],
    bio: "Born in Luxor, I have spent my life uncovering the secrets of Thebes for travellers worldwide.",
    experience: "15 years",
  },
  {
    id: "g4",
    name: "Mona Saleh",
    avatar: "𓇋",
    languages: ["Arabic", "French", "English"],
    rating: 4.9,
    reviewCount: 61,
    priceRange: "$30–45/day",
    specialties: ["Aswan", "Abu Simbel", "Nubian Culture"],
    bio: "Specialist in southern Egypt — Aswan, Nubia, and the magnificent Abu Simbel temples.",
    experience: "6 years",
  },
  {
    id: "g5",
    name: "Karim Tawfik",
    avatar: "𓆙",
    languages: ["Arabic", "English"],
    rating: 4.6,
    reviewCount: 44,
    priceRange: "$25–40/day",
    specialties: ["Desert", "Siwa Oasis", "Nature"],
    bio: "Adventure guide specialising in desert expeditions and off-the-beaten-path experiences.",
    experience: "5 years",
  },
  {
    id: "g6",
    name: "Nadia Farouk",
    avatar: "𓊪",
    languages: ["Arabic", "English", "Russian"],
    rating: 4.8,
    reviewCount: 78,
    priceRange: "$35–55/day",
    specialties: ["Alexandria", "Coastal Egypt", "Greco-Roman"],
    bio: "Expert in Hellenistic and Greco-Roman Egypt, based in Alexandria.",
    experience: "9 years",
  },
];

const ALL_LANGUAGES = [...new Set(MOCK_GUIDES.flatMap(g => g.languages))].sort();
const ALL_SPECIALTIES = [...new Set(MOCK_GUIDES.flatMap(g => g.specialties))].sort();

export default function FindGuide() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialLang = params.get("language") || "";

  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState(initialLang);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(!!initialLang);

  const filtered = useMemo(() => {
    return MOCK_GUIDES.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) &&
          !g.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (langFilter && !g.languages.some(l => l.toLowerCase() === langFilter.toLowerCase())) return false;
      if (specialtyFilter && !g.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))) return false;
      if (minRating && g.rating < minRating) return false;
      return true;
    });
  }, [search, langFilter, specialtyFilter, minRating]);

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar pb-20 bg-background">
      {/* Header */}
      <div className="shrink-0 bg-card/95 backdrop-blur-sm border-b border-primary/25 px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/explore">
            <button className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-black text-foreground">Find a Guide</h1>
            <p className="text-xs text-primary">اختر مرشدك السياحي المثالي</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              showFilters ? "bg-primary text-black border-primary" : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/40 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="flex gap-2">
              <select
                value={langFilter}
                onChange={e => setLangFilter(e.target.value)}
                className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-xl px-3 py-2 outline-none focus:border-primary/50"
              >
                <option value="">All Languages</option>
                {ALL_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-xl px-3 py-2 outline-none focus:border-primary/50"
              >
                <option value="">All Areas</option>
                {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Min rating:</span>
              {[0, 4.5, 4.7, 4.9].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    minRating === r ? "bg-primary text-black" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-3 text-xs text-muted-foreground">
        {filtered.length} guide{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Guide Cards */}
      <div className="px-4 space-y-4">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">𓂀</div>
            <h3 className="font-display font-bold text-lg text-foreground mb-1">No Guides Found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
            <button
              onClick={() => { setSearch(""); setLangFilter(""); setSpecialtyFilter(""); setMinRating(0); }}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          filtered.map((guide, i) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl shrink-0">
                  {guide.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-foreground text-base leading-tight">{guide.name}</h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-bold text-primary">{guide.rating}</span>
                      <span className="text-[10px] text-muted-foreground ml-0.5">({guide.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{guide.experience} experience</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{guide.bio}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {guide.specialties.map(s => (
                  <Badge key={s} variant="outline" className="text-[10px] border-primary/20 text-primary/80 bg-primary/5">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-primary" />
                  {guide.languages.join(", ")}
                </span>
                <span className="flex items-center gap-1 ml-auto font-semibold text-foreground">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  {guide.priceRange}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/chat?about=guide:${encodeURIComponent(guide.name)}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Ask Khety
                  </button>
                </Link>
                <button className="flex-1 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-colors">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
