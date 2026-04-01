import { useState } from "react";
import { useLandmarks } from "@/hooks/useLandmarks";
import { Input } from "@/components/ui/input";
import { LandmarkCard } from "@/components/LandmarkCard";
import { LoadingScarab } from "@/components/LoadingScarab";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export default function Explore() {
  const { t } = useTranslation("t");
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);

  const { data: landmarks, isLoading } = useLandmarks({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
  });

  const CATEGORIES = [
    { id: "all",     label: t("explore.all") },
    { id: "ancient", label: t("home.categories.ancient") },
    { id: "museum",  label: t("home.categories.museum") },
    { id: "mosque",  label: t("home.categories.mosque") },
    { id: "church",  label: t("home.categories.church") },
    { id: "nature",  label: t("home.categories.nature") },
    { id: "market",  label: t("home.categories.market") },
  ];

  return (
    <div className="flex flex-col overflow-y-auto hide-scrollbar pb-20">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-8 pb-4 px-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">{t("explore.title")}</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("explore.search_placeholder")}
            className="pl-10 h-12 rounded-xl bg-card border-border/60 focus-visible:ring-primary/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-muted rounded-md text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 p-1">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={category === cat.id ? "default" : "secondary"}
                className={`px-4 py-2 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                  category === cat.id 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      <div className="px-6 py-6 flex-1">
        {isLoading ? (
          <LoadingScarab />
        ) : landmarks && landmarks.length > 0 ? (
          <div className="grid gap-5 pb-8">
            {landmarks.map((landmark) => (
              <LandmarkCard key={landmark.id} landmark={landmark} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 opacity-50">
            <div className="text-6xl mb-4">𓇯</div>
            <p className="text-base font-semibold text-foreground">{t("explore.no_results")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
