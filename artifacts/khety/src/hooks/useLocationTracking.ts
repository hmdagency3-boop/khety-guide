import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const MIN_UPDATE_INTERVAL_MS = 30_000;
const MIN_DISTANCE_METERS    = 50;

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  userId: string | undefined;
  userEmail: string | undefined;
  userName: string | undefined;
}

export function useLocationTracking({ userId, userEmail, userName }: Props) {
  const watchIdRef   = useRef<number | null>(null);
  const lastLatRef   = useRef<number | null>(null);
  const lastLonRef   = useRef<number | null>(null);
  const lastSentRef  = useRef<number>(0);

  useEffect(() => {
    if (!userId && !userEmail) return;
    if (!("geolocation" in navigator)) return;

    async function upsertLocation(lat: number, lon: number) {
      const now = Date.now();
      if (lastLatRef.current !== null && lastLonRef.current !== null) {
        const dist = haversineMeters(lastLatRef.current, lastLonRef.current, lat, lon);
        if (dist < MIN_DISTANCE_METERS && now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
      }
      lastLatRef.current = lat;
      lastLonRef.current = lon;
      lastSentRef.current = now;

      const key = userId || userEmail!;

      const { data: existing } = await supabase
        .from("user_last_location")
        .select("total_locations")
        .eq("user_id", key)
        .maybeSingle();

      const nextCount = (existing?.total_locations ?? 0) + 1;

      await supabase.from("user_last_location").upsert(
        {
          user_id:         key,
          user_email:      userEmail || null,
          user_name:       userName  || null,
          latitude:        lat,
          longitude:       lon,
          last_seen_at:    new Date().toISOString(),
          total_locations: nextCount,
        },
        {
          onConflict:       "user_id",
          ignoreDuplicates: false,
        }
      );
    }

    function onPosition(pos: GeolocationPosition) {
      upsertLocation(pos.coords.latitude, pos.coords.longitude);
    }

    function startWatch() {
      watchIdRef.current = navigator.geolocation.watchPosition(
        onPosition,
        () => {},
        { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 }
      );
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        upsertLocation(pos.coords.latitude, pos.coords.longitude);
        startWatch();
      },
      () => {
        startWatch();
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userId, userEmail, userName]);
}
