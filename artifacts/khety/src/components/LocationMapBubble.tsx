import { ExternalLink, MapPin } from "lucide-react";
import { parseLatLon } from "@/lib/locationUtils";

interface Props {
  content: string;
  time: string;
  isUser?: boolean;
  compact?: boolean;
}

export function LocationMapBubble({ content, time, isUser = true, compact = false }: Props) {
  const coords = parseLatLon(content);

  if (!coords) {
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  const { lat, lon } = coords;
  const delta = 0.006;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
  const googleLink = `https://maps.google.com/?q=${lat},${lon}`;
  const mapHeight = compact ? 160 : 200;

  return (
    <div className={`flex flex-col gap-2 ${compact ? "w-56" : "w-72 max-w-full"}`}>
      {/* Map embed — container clips OSM attribution bar */}
      <div
        className="rounded-xl overflow-hidden border border-border/30 shadow-sm relative"
        style={{ height: mapHeight }}
      >
        <iframe
          src={osmEmbed}
          width="100%"
          height={mapHeight + 22}
          style={{ border: "none", display: "block", marginTop: 0 }}
          title="موقع المستخدم"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-muted-foreground">
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </span>
        </div>
        <a
          href={googleLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline shrink-0"
        >
          فتح
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <span className="text-[10px] text-muted-foreground">{time}</span>
    </div>
  );
}
