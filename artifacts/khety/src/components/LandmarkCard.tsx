import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface LandmarkCardProps {
  landmark: any;
  featured?: boolean;
}

export function LandmarkCard({ landmark, featured = false }: LandmarkCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/landmarks/${landmark.id}`} className="block group">
      <div className={`overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-primary/30 ${featured ? "w-72 shrink-0" : "w-full"}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {!imgError && (landmark.image_url || landmark.imageUrl) ? (
            <img
              src={landmark.image_url || landmark.imageUrl}
              alt={landmark.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-background">
              <span className="text-6xl opacity-30">𓇳</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/30">
              <Star className="w-3 h-3 fill-primary" />
              {landmark.rating?.toFixed(1)}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="font-display text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {landmark.name}
            </h3>
            <div className="flex items-center text-white/80 text-xs mt-1">
              <MapPin className="w-3 h-3 mr-1 text-primary/80" />
              <span className="truncate">{landmark.city || landmark.location?.city}</span>
            </div>
          </div>
        </div>

        {!featured && (
          <div className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {landmark.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {landmark.tags?.slice(0, 3).map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-background border-border/50 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
