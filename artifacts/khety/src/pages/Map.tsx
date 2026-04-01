import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { useLandmarks } from "@/hooks/useLandmarks";
import { LoadingScarab } from "@/components/LoadingScarab";
import {
  Star, Clock, Ticket, ChevronUp, ChevronDown, LocateFixed, Layers,
  Navigation, X, ArrowRight, ArrowUp, ArrowUpLeft, ArrowUpRight,
  RotateCcw, Flag, Loader2, AlertCircle, MapPin, MessageCircle,
  Search, Globe, Sun, Moon, Route, Plus, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
  steps: RouteStep[];
  coords: [number, number][];
}

type MapStyle = "dark" | "satellite" | "light";
type SheetTab = "list" | "steps" | "tour";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  ancient: "#D4AF37",
  mosque:  "#4ade80",
  museum:  "#60a5fa",
  market:  "#fb923c",
  beach:   "#38bdf8",
  resort:  "#a78bfa",
  church:  "#f472b6",
  default: "#D4AF37",
};


const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
};

const MANEUVER_ICONS: Record<string, React.ElementType> = {
  "turn-left":        ArrowUpLeft,
  "turn-right":       ArrowUpRight,
  "turn-sharp-left":  ArrowUpLeft,
  "turn-sharp-right": ArrowUpRight,
  "turn-slight-left": ArrowUpLeft,
  "turn-slight-right":ArrowUpRight,
  "continue":         ArrowUp,
  "roundabout":       RotateCcw,
  "arrive":           Flag,
  "depart":           Navigation,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function formatDuration(s: number, minuteLabel: string) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} ${minuteLabel}`;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeMarkerIcon(category: string, isNav = false, isSelected = false, isTourStop = false) {
  const color = isNav
    ? "#22c55e"
    : isTourStop
    ? "#a78bfa"
    : CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const size = isSelected || isNav ? 42 : 34;
  // Sanitize values used in SVG to prevent injection: only allow safe chars
  const safeCategory = category.replace(/[^a-zA-Z0-9]/g, "");
  const safeNav = isNav ? "1" : "0";
  // Validate color is a hex value or rgba — fall back to safe default
  const safeColor = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))$/.test(color)
    ? color
    : CATEGORY_COLORS.default;
  const filterId = `s${safeCategory}${safeNav}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 42 54">
      <filter id="${filterId}"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.6)"/></filter>
      <ellipse cx="21" cy="52" rx="7" ry="2.5" fill="rgba(0,0,0,0.35)"/>
      <path d="M21 2 C11 2 3 10 3 20 C3 31 21 52 21 52 C21 52 39 31 39 20 C39 10 31 2 21 2Z"
        fill="${safeColor}" filter="url(#${filterId})" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
      <circle cx="21" cy="20" r="9" fill="rgba(0,0,0,0.2)"/>
      ${isNav
        ? `<text x="21" y="25" text-anchor="middle" font-size="14" fill="white">🏁</text>`
        : isTourStop
        ? `<text x="21" y="25" text-anchor="middle" font-size="14" fill="white">⬡</text>`
        : `<text x="21" y="25" text-anchor="middle" font-size="11" font-family="serif" fill="white" opacity="0.95">𓂀</text>`
      }
      ${(isSelected || isNav || isTourStop)
        ? `<circle cx="21" cy="20" r="18" fill="none" stroke="${safeColor}" stroke-width="2" stroke-dasharray="5 3" opacity="0.5"/>`
        : ""}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [size, Math.round(size * 1.3)],
    iconAnchor: [size / 2, Math.round(size * 1.3)],
    popupAnchor:[0, -Math.round(size * 1.3)],
  });
}

function makeUserIcon(heading?: number) {
  const rotate = heading ? `transform="rotate(${heading} 18 18)"` : "";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/>
      <g ${rotate}>
        <circle cx="18" cy="18" r="8" fill="#60a5fa" opacity="0.9"/>
        <circle cx="18" cy="18" r="3.5" fill="white"/>
      </g>
    </svg>`,
    className: "",
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
}

// ─── Map sub-components ───────────────────────────────────────────────────────

function FlyToMarker({ lat, lng, zoom = 14 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return;
    map.flyTo([lat, lng], zoom, { duration: 1.1 });
  }, [lat, lng, zoom, map]);
  return null;
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length < 2) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [coords, map]);
  return null;
}

function RecenterBtn({ userLat, userLng }: { userLat: number | null; userLng: number | null }) {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (userLat && userLng) map.flyTo([userLat, userLng], 13, { duration: 0.9 });
        else map.flyTo([26.8, 30.8], 6, { duration: 0.9 });
      }}
      className="absolute bottom-4 right-4 z-[1000] w-10 h-10 bg-card border border-border/60 rounded-xl shadow-xl flex items-center justify-center text-foreground hover:bg-muted transition-colors"
    >
      <LocateFixed className="w-4 h-4" />
    </button>
  );
}

// ─── Routing helpers ──────────────────────────────────────────────────────────

async function fetchRoute(
  fromLat: number, fromLng: number,
  toLat: number,   toLng: number
): Promise<RouteInfo> {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Routing failed");
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route found");

  const route = data.routes[0];
  const coords: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );
  const steps: RouteStep[] = [];
  for (const leg of route.legs) {
    for (const step of leg.steps) {
      steps.push({
        instruction: step.maneuver?.instruction || step.name || "Continue",
        distance:    step.distance,
        duration:    step.duration,
        maneuver:    step.maneuver?.type || "continue",
      });
    }
  }
  return { distance: route.distance, duration: route.duration, coords, steps };
}

async function fetchTourRoute(waypoints: [number, number][]): Promise<RouteInfo> {
  if (waypoints.length < 2) throw new Error("Need at least 2 stops");
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?source=first&destination=last&roundtrip=false&steps=true&geometries=geojson&overview=full`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Trip routing failed");
  const data = await res.json();
  if (data.code !== "Ok" || !data.trips?.length) throw new Error("No trip found");

  const trip = data.trips[0];
  const routeCoords: [number, number][] = trip.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );
  const steps: RouteStep[] = [];
  for (const leg of trip.legs) {
    for (const step of leg.steps) {
      steps.push({
        instruction: step.maneuver?.instruction || step.name || "Continue",
        distance:    step.distance,
        duration:    step.duration,
        maneuver:    step.maneuver?.type || "continue",
      });
    }
  }
  return { distance: trip.distance, duration: trip.duration, coords: routeCoords, steps };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Map() {
  const { t } = useTranslation();
  const min = t("map.minute");
  const { data: landmarks, isLoading } = useLandmarks();
  const searchStr = useSearch();

  const CATEGORY_LIST = useMemo(() => [
    { id: "all",     label: t("map.cat_all"),     emoji: "🗺️" },
    { id: "ancient", label: t("map.cat_ancient"),  emoji: "𓇳"  },
    { id: "mosque",  label: t("map.cat_mosque"),   emoji: "🕌"  },
    { id: "museum",  label: t("map.cat_museum"),   emoji: "🏛️" },
    { id: "market",  label: t("map.cat_market"),   emoji: "🛍️" },
    { id: "beach",   label: t("map.cat_beach"),    emoji: "🏖️" },
    { id: "resort",  label: t("map.cat_resort"),   emoji: "🌴"  },
    { id: "church",  label: t("map.cat_church"),   emoji: "✝️"  },
  ], [t]);

  // Core
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [flyTo,          setFlyTo]          = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [userPos,        setUserPos]        = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [sheetOpen,      setSheetOpen]      = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const autoSelectedRef = useRef(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [nearMeOnly,  setNearMeOnly]  = useState(false);

  // Map style
  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [styleOpen, setStyleOpen] = useState(false);

  // Navigation
  const [navTargetId, setNavTargetId] = useState<string | null>(null);
  const [routeInfo,   setRouteInfo]   = useState<RouteInfo | null>(null);
  const [fitRoute,    setFitRoute]    = useState(false);
  const [navLoading,  setNavLoading]  = useState(false);
  const [navError,    setNavError]    = useState<string | null>(null);
  const [sheetTab,    setSheetTab]    = useState<SheetTab>("list");

  // Tour mode
  const [tourMode,    setTourMode]    = useState(false);
  const [tourStops,   setTourStops]   = useState<string[]>([]);
  const [tourRoute,   setTourRoute]   = useState<RouteInfo | null>(null);
  const [tourLoading, setTourLoading] = useState(false);
  const [tourError,   setTourError]   = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // One-time geolocation on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading ?? undefined }),
      () => {}
    );
  }, []);

  // Auto-select landmark from URL param ?landmark=id
  useEffect(() => {
    if (autoSelectedRef.current || !landmarks?.length) return;
    const params = new URLSearchParams(searchStr);
    const landmarkId = params.get("landmark");
    if (!landmarkId) return;
    const lm = landmarks.find((l) => l.id === landmarkId);
    if (!lm?.latitude || !lm?.longitude) return;
    autoSelectedRef.current = true;
    setSelectedId(lm.id);
    setFlyTo({ lat: lm.latitude, lng: lm.longitude, zoom: 15 });
    setSheetOpen(true);
  }, [landmarks, searchStr]);

  // Live tracking while navigating
  useEffect(() => {
    if (!navTargetId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading ?? undefined }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [navTargetId]);

  // Filtered landmarks
  const filtered = landmarks
    ?.filter((l) => activeCategory === "all" || l.category === activeCategory)
    .filter((l) =>
      !searchQuery ||
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((l) => {
      if (!nearMeOnly || !userPos || !l.latitude || !l.longitude) return true;
      return haversineKm(userPos.lat, userPos.lng, l.latitude, l.longitude) <= 25;
    });

  const navTarget  = landmarks?.find((l) => l.id === navTargetId);
  const isNavigating = !!navTargetId && !!routeInfo;

  // Tour stop landmarks in order
  const tourLandmarks = tourStops
    .map((id) => landmarks?.find((l) => l.id === id))
    .filter(Boolean) as any[];

  const handlePin = useCallback((id: string, lat: number | undefined, lng: number | undefined) => {
    setSelectedId(id);
    if (typeof lat === "number" && typeof lng === "number") {
      setFlyTo({ lat, lng });
    }
    setSheetOpen(true);
  }, []);

  const startNavigation = useCallback(
    async (lm: { id: string; latitude: number; longitude: number }) => {
      if (!lm?.latitude || !lm?.longitude) return;
      setNavError(null);
      setNavLoading(true);
      setNavTargetId(lm.id);
      setSheetOpen(true);
      setSheetTab("steps");
      const from = userPos ?? { lat: 30.0444, lng: 31.2357 };
      try {
        const info = await fetchRoute(from.lat, from.lng, lm.latitude, lm.longitude);
        setRouteInfo(info);
        setFitRoute(true);
        setTimeout(() => setFitRoute(false), 200);
      } catch {
        setNavError(t("map.nav_error"));
        setNavTargetId(null);
      } finally {
        setNavLoading(false);
      }
    },
    [userPos]
  );

  const cancelNavigation = useCallback(() => {
    setNavTargetId(null);
    setRouteInfo(null);
    setNavError(null);
    setSheetTab("list");
    setFlyTo({ lat: 26.8, lng: 30.8, zoom: 6 });
  }, []);

  const toggleTourStop = useCallback((id: string) => {
    setTourStops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setTourRoute(null);
    setTourError(null);
  }, []);

  const startTour = useCallback(async () => {
    if (tourStops.length < 2) return;
    setTourError(null);
    setTourLoading(true);
    const waypoints = tourLandmarks
      .filter((l) => l.latitude && l.longitude)
      .map((l): [number, number] => [l.latitude, l.longitude]);
    if (userPos) waypoints.unshift([userPos.lat, userPos.lng]);
    try {
      const info = await fetchTourRoute(waypoints);
      setTourRoute(info);
      setFitRoute(true);
      setTimeout(() => setFitRoute(false), 200);
    } catch {
      setTourError(t("map.tour_error"));
    } finally {
      setTourLoading(false);
    }
  }, [tourStops, tourLandmarks, userPos]);

  const cancelTour = useCallback(() => {
    setTourMode(false);
    setTourStops([]);
    setTourRoute(null);
    setTourError(null);
    setSheetTab("list");
  }, []);

  if (isLoading) return <LoadingScarab message={t("map.loading")} />;

  const bgColor = mapStyle === "light" ? "#e5e5e5" : "#0f0f0f";

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* ── Navigation banner ── */}
      <AnimatePresence>
        {isNavigating && navTarget && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y: -60, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[1000] bg-emerald-900/95 backdrop-blur-md border-b border-emerald-600/40 px-4 py-3 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">{t("map.navigating_to")}</p>
                <p className="text-sm font-bold text-white truncate">{navTarget.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black text-emerald-300">{formatDistance(routeInfo.distance)}</p>
                <p className="text-[11px] text-emerald-400">{formatDuration(routeInfo.duration, min)}</p>
              </div>
              <button
                onClick={cancelNavigation}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tour banner ── */}
      <AnimatePresence>
        {tourRoute && !isNavigating && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y: -60, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[1000] bg-violet-900/95 backdrop-blur-md border-b border-violet-600/40 px-4 py-3 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
                <Route className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-violet-400 font-semibold uppercase tracking-wider">{t("map.tour_label")}</p>
                <p className="text-sm font-bold text-white">{t("map.stops", { n: tourStops.length })}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black text-violet-300">{formatDistance(tourRoute.distance)}</p>
                <p className="text-[11px] text-violet-400">{formatDuration(tourRoute.duration, min)}</p>
              </div>
              <button
                onClick={cancelTour}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Routing loading overlay ── */}
      <AnimatePresence>
        {(navLoading || tourLoading) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[1000] bg-background/80 backdrop-blur-sm flex items-center justify-center py-4"
          >
            <div className="flex items-center gap-2 bg-card border border-border/60 rounded-full px-4 py-2 shadow-xl">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-foreground">
                {tourLoading ? t("map.calculating_tour") : t("map.calculating_route")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category pills ── */}
      <AnimatePresence>
        {!isNavigating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-4 left-0 right-0 z-[999] px-3 pointer-events-none"
          >
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 pointer-events-auto">
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSelectedId(null); }}
                  className={cn(
                    "shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 shadow-md",
                    activeCategory === cat.id
                      ? "bg-primary text-black border-primary"
                      : "bg-card/85 backdrop-blur-md text-foreground border-border/60 hover:border-primary/50"
                  )}
                >
                  <span className="text-sm leading-none">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}

              {/* Near Me pill */}
              <button
                onClick={() => {
                  if (!userPos) {
                    navigator.geolocation?.getCurrentPosition(
                      (p) => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setNearMeOnly(true); },
                      () => {}
                    );
                  } else {
                    setNearMeOnly((v) => !v);
                  }
                }}
                className={cn(
                  "shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 shadow-md",
                  nearMeOnly
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-card/85 backdrop-blur-md text-foreground border-border/60 hover:border-blue-400/50"
                )}
              >
                <LocateFixed className="w-3 h-3" />
                <span>{t("map.near_me")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map area ── */}
      <div
        className="relative flex-1"
        style={{ paddingTop: (isNavigating || tourRoute) ? 64 : 0, transition: "padding 0.3s" }}
      >
        <MapContainer
          center={[26.8, 30.8]}
          zoom={6}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            key={mapStyle}
            url={TILE_LAYERS[mapStyle].url}
            attribution={TILE_LAYERS[mapStyle].attribution}
            maxZoom={19}
            {...(mapStyle !== "satellite" ? { subdomains: "abcd" } : {})}
          />

          {flyTo && <FlyToMarker lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
          {fitRoute && (routeInfo || tourRoute) && (
            <FitBounds coords={(tourRoute || routeInfo)!.coords} />
          )}

          {/* User position */}
          {userPos && (
            <>
              <Circle
                center={[userPos.lat, userPos.lng]}
                radius={isNavigating ? 400 : 1200}
                color="#60a5fa" fillColor="#60a5fa" fillOpacity={0.08} weight={1}
              />
              <Marker position={[userPos.lat, userPos.lng]} icon={makeUserIcon(userPos.heading)} />
            </>
          )}

          {/* Navigation route */}
          {isNavigating && routeInfo && (
            <>
              <Polyline positions={routeInfo.coords} color="rgba(0,0,0,0.4)" weight={8} opacity={0.8} />
              <Polyline positions={routeInfo.coords} color="#22c55e" weight={5} opacity={0.9} />
              <Polyline positions={routeInfo.coords} color="rgba(255,255,255,0.3)" weight={2} dashArray="10 15" opacity={1} />
            </>
          )}

          {/* Tour route */}
          {tourRoute && !isNavigating && (
            <>
              <Polyline positions={tourRoute.coords} color="rgba(0,0,0,0.4)" weight={8} opacity={0.8} />
              <Polyline positions={tourRoute.coords} color="#a78bfa" weight={5} opacity={0.9} />
              <Polyline positions={tourRoute.coords} color="rgba(255,255,255,0.3)" weight={2} dashArray="10 15" opacity={1} />
            </>
          )}

          {/* Landmark markers */}
          {filtered?.map((lm) => {
            const lat = lm.latitude;
            const lng = lm.longitude;
            if (!lat || !lng) return null;
            const isNav      = lm.id === navTargetId;
            const isTourStop = tourStops.includes(lm.id);
            return (
              <Marker
                key={lm.id}
                position={[lat, lng]}
                icon={makeMarkerIcon(lm.category, isNav, lm.id === selectedId, isTourStop)}
                eventHandlers={{ click: () => handlePin(lm.id, lat, lng) }}
              >
                <Popup>
                  <div className="bg-card text-foreground rounded-xl p-3 w-52 shadow-2xl border border-border/60">
                    {lm.image_url && (
                      <img
                        src={lm.image_url}
                        alt={lm.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">{lm.name}</h3>
                      <span className="flex items-center gap-0.5 shrink-0 text-xs font-bold text-primary">
                        <Star className="w-3 h-3 fill-primary" />{lm.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{lm.description}</p>
                    <div className="flex gap-3 mb-3">
                      {lm.ticket_price && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Ticket className="w-3 h-3" />{lm.ticket_price}
                        </span>
                      )}
                      {lm.opening_hours && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />{lm.opening_hours}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => startNavigation(lm)}
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold bg-emerald-500 text-white rounded-lg py-1.5 hover:bg-emerald-400 transition-colors"
                      >
                        <Navigation className="w-3 h-3" /> {t("map.navigate")}
                      </button>
                      <Link href={`/landmarks/${lm.id}`} className="flex-1">
                        <span className="block text-center text-[11px] font-semibold bg-primary text-black rounded-lg py-1.5 hover:bg-primary/90 transition-colors">
                          {t("map.details")}
                        </span>
                      </Link>
                      <Link href={`/chat?about=${encodeURIComponent(lm.name)}`} className="w-full">
                        <span className="flex items-center justify-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/30 rounded-lg py-1.5 hover:bg-primary/20 transition-colors w-full">
                          <MessageCircle className="w-3 h-3" /> {t("map.ask_khety")}
                        </span>
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <RecenterBtn userLat={userPos?.lat ?? null} userLng={userPos?.lng ?? null} />
        </MapContainer>

        {/* ── Map style switcher (outside MapContainer, absolute overlay) ── */}
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5">
          <AnimatePresence>
            {styleOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: 8 }}
                className="flex flex-col gap-1.5"
              >
                {(["dark", "satellite", "light"] as MapStyle[]).map((s) => {
                  const icons = { dark: Moon, satellite: Globe, light: Sun };
                  const labels = { dark: t("map.style_dark"), satellite: t("map.style_satellite"), light: t("map.style_light") };
                  const Icon = icons[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { setMapStyle(s); setStyleOpen(false); }}
                      className={cn(
                        "w-10 h-10 rounded-xl border shadow-xl flex items-center justify-center transition-all",
                        mapStyle === s
                          ? "bg-primary text-black border-primary"
                          : "bg-card/90 backdrop-blur-md border-border/60 text-foreground hover:bg-muted"
                      )}
                      title={labels[s]}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setStyleOpen((v) => !v)}
            className="w-10 h-10 bg-card/90 backdrop-blur-md border border-border/60 rounded-xl shadow-xl flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            title={t("map.style_toggle_title")}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Bottom sheet ── */}
      <div
        className="bg-card border-t border-border/60 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] relative z-20 flex flex-col shrink-0 transition-all duration-300 ease-in-out"
        style={{ height: sheetOpen ? "40vh" : "52px" }}
      >
        {/* Handle + header */}
        <div className="w-full flex flex-col items-center pt-2 pb-1 shrink-0">
          <button
            className="w-full flex justify-center py-1"
            onClick={() => setSheetOpen(!sheetOpen)}
          >
            <div className="w-10 h-1 bg-border rounded-full" />
          </button>
          <div className="flex items-center justify-between w-full px-4">
            {isNavigating ? (
              /* Navigation header */
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border/60 overflow-hidden text-[11px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSheetTab("steps"); }}
                    className={cn("px-3 py-1 font-semibold transition-colors", sheetTab === "steps" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground")}
                  >
                    {t("map.steps_tab")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSheetTab("list"); }}
                    className={cn("px-3 py-1 font-semibold transition-colors", sheetTab === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground")}
                  >
                    {t("map.landmarks_tab")}
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); cancelNavigation(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-[11px] font-semibold border border-red-500/25 hover:bg-red-500/25 transition-colors"
                >
                  <X className="w-3 h-3" /> {t("map.end_nav")}
                </button>
              </div>
            ) : tourMode ? (
              /* Tour mode header */
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border/60 overflow-hidden text-[11px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSheetTab("tour"); }}
                    className={cn("px-3 py-1 font-semibold transition-colors", sheetTab === "tour" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground")}
                  >
                    {t("map.tour_tab")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSheetTab("list"); }}
                    className={cn("px-3 py-1 font-semibold transition-colors", sheetTab === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground")}
                  >
                    {t("map.landmarks_tab")}
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); cancelTour(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-[11px] font-semibold border border-red-500/25 hover:bg-red-500/25 transition-colors"
                >
                  <X className="w-3 h-3" /> {t("map.cancel_tour")}
                </button>
              </div>
            ) : (
              /* Default header */
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  {activeCategory === "all"
                    ? t("map.all_landmarks")
                    : CATEGORY_LIST.find((c) => c.id === activeCategory)?.label || activeCategory}
                  <Badge variant="outline" className="text-[10px] ml-1">{filtered?.length || 0}</Badge>
                </h2>
                {/* Tour mode toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTourMode(true);
                    setSheetTab("tour");
                    setSheetOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-[11px] font-semibold border border-violet-500/25 hover:bg-violet-500/25 transition-colors"
                >
                  <Route className="w-3 h-3" /> {t("map.tour_mode")}
                </button>
              </div>
            )}
            <button
              onClick={() => setSheetOpen(!sheetOpen)}
              className="p-1 -mr-1 rounded-lg hover:bg-muted transition-colors"
            >
              {sheetOpen
                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                : <ChevronUp   className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Search bar (visible when not navigating) */}
        {!isNavigating && sheetOpen && (
          <div className="px-4 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("map.search_placeholder")}
                className="w-full bg-muted/60 border border-border/40 rounded-xl pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sheet content */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Error */}
          {(navError || tourError) && (
            <div className="mx-4 mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{navError || tourError}</p>
            </div>
          )}

          {/* ── Navigation steps ── */}
          {isNavigating && sheetTab === "steps" && (
            <div className="px-4 pb-4 pt-1 space-y-2">
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs text-emerald-400 font-semibold">{navTarget?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{navTarget?.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-emerald-300">{formatDistance(routeInfo!.distance)}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDuration(routeInfo!.duration, min)}</p>
                </div>
              </div>
              {routeInfo!.steps.map((step, i) => {
                const IconComp = MANEUVER_ICONS[step.maneuver] || ArrowRight;
                const isLast   = i === routeInfo!.steps.length - 1;
                return (
                  <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border",
                    isLast ? "bg-emerald-500/10 border-emerald-500/25" : "bg-card border-border/40"
                  )}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isLast ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-foreground"
                    )}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <p className="flex-1 text-xs font-medium text-foreground leading-snug pt-1">
                      {step.instruction || t("map.step_fallback", { n: i + 1 })}
                    </p>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold text-primary">{formatDistance(step.distance)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDuration(step.duration, min)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Tour tab ── */}
          {tourMode && sheetTab === "tour" && (
            <div className="px-4 pb-4 pt-1">
              {tourRoute ? (
                /* Tour summary */
                <div className="space-y-2">
                  <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl p-3 flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-violet-400 font-semibold">{t("map.stops", { n: tourStops.length })}</p>
                      <p className="text-[11px] text-muted-foreground">{t("map.optimized_route")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-violet-300">{formatDistance(tourRoute.distance)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDuration(tourRoute.duration, min)}</p>
                    </div>
                  </div>
                  {tourLandmarks.map((lm, i) => (
                    <div key={lm.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-violet-500/20">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{lm.name}</p>
                        <p className="text-[11px] text-muted-foreground">{lm.city}</p>
                      </div>
                      <button
                        onClick={() => { toggleTourStop(lm.id); setTourRoute(null); }}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={startTour}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-400 transition-colors"
                  >
                    <Route className="w-4 h-4" /> {t("map.recalculate")}
                  </button>
                </div>
              ) : (
                /* Tour stop selection */
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    {t("map.tour_instruction")}
                  </p>
                  {tourStops.length === 0 ? (
                    <div className="text-center py-8">
                      <Route className="w-8 h-8 text-violet-400/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("map.no_stops")}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t("map.no_stops_hint")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {tourLandmarks.map((lm, i) => (
                        <div key={lm.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-violet-500/20">
                          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <p className="flex-1 text-sm font-semibold text-foreground truncate">{lm.name}</p>
                          <button
                            onClick={() => toggleTourStop(lm.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={startTour}
                        disabled={tourStops.length < 2}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Route className="w-4 h-4" /> {t("map.calculate_tour", { n: tourStops.length })}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Landmarks list ── */}
          {(!isNavigating || sheetTab === "list") && (!tourMode || sheetTab === "list") && (
            <div className="px-4 pb-4 pt-1 space-y-2">
              {filtered?.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 text-primary/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t("map.no_landmarks")}</p>
                </div>
              )}
              {filtered?.map((lm) => (
                <div
                  key={lm.id}
                  className={cn(
                    "rounded-xl border transition-all duration-150 overflow-hidden",
                    lm.id === navTargetId        ? "border-emerald-500/50 bg-emerald-500/5"
                      : tourStops.includes(lm.id) ? "border-violet-500/50 bg-violet-500/5"
                      : lm.id === selectedId     ? "border-primary/50 bg-primary/5"
                      : "border-border/40 bg-card"
                  )}
                >
                  <button
                    onClick={() => handlePin(lm.id, lm.latitude, lm.longitude)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={lm.image_url || "/images/hieroglyph-bg.png"}
                          alt={lm.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/images/hieroglyph-bg.png"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: CATEGORY_COLORS[lm.category] || CATEGORY_COLORS.default }}
                          />
                          <span className="font-semibold text-sm text-foreground truncate">{lm.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{lm.city} · {lm.category}</p>
                        {userPos && lm.latitude && lm.longitude && (
                          <p className="text-[10px] text-blue-400 mt-0.5">
                            {haversineKm(userPos.lat, userPos.lng, lm.latitude, lm.longitude).toFixed(1)} km
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-0.5 justify-end">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs font-bold text-primary">{lm.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">{lm.ticket_price}</span>
                      </div>
                    </div>
                  </button>

                  {/* Action buttons row */}
                  <div className="px-3 pb-3 pt-0 flex gap-1.5">
                    {lm.id === navTargetId ? (
                      <button
                        onClick={() => cancelNavigation()}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-lg py-1.5 hover:bg-red-500/25 transition-colors"
                      >
                        <X className="w-3 h-3" /> {t("map.cancel_nav_btn")}
                      </button>
                    ) : (
                      <button
                        onClick={() => startNavigation(lm)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-lg py-1.5 hover:bg-emerald-500/25 transition-colors"
                      >
                        <Navigation className="w-3 h-3" /> {t("map.navigate")}
                      </button>
                    )}

                    {tourMode && (
                      <button
                        onClick={() => toggleTourStop(lm.id)}
                        className={cn(
                          "flex items-center justify-center gap-1 px-3 text-[11px] font-bold rounded-lg py-1.5 border transition-colors",
                          tourStops.includes(lm.id)
                            ? "bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30"
                            : "bg-muted text-muted-foreground border-border/40 hover:border-violet-400/50 hover:text-violet-400"
                        )}
                      >
                        {tourStops.includes(lm.id)
                          ? <><Check className="w-3 h-3" /> {t("map.added")}</>
                          : <><Plus  className="w-3 h-3" /> {t("map.add_to_tour")}</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-container { background: ${bgColor} !important; }
        .leaflet-control-zoom, .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}
