import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const HEARTBEAT_INTERVAL_MS = 30_000;

export function usePresenceTracker(user: User | null, profile: Profile | null) {
  const [location] = useLocation();
  const channelRef    = useRef<RealtimeChannel | null>(null);
  const joinedAtRef   = useRef<number>(Date.now());
  const locationRef   = useRef<string>(location);
  const displayRef    = useRef<string>("");
  const userIdRef     = useRef<string | undefined>(user?.id);

  locationRef.current = location;
  displayRef.current  = profile?.display_name || user?.email || "Anonymous";
  userIdRef.current   = user?.id;

  useEffect(() => {
    if (!user) return;

    joinedAtRef.current = Date.now();

    const channel = supabase.channel("khety-presence", {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    function sendPresence() {
      if (!channelRef.current || !userIdRef.current) return;
      channelRef.current.track({
        user_id:      userIdRef.current,
        display_name: displayRef.current,
        page:         locationRef.current,
        joined_at:    joinedAtRef.current,
        last_seen_at: Date.now(),
      }).catch(() => {});
    }

    channel
      .on("presence", { event: "sync" }, () => {})
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          sendPresence();
        }
      });

    const heartbeat = setInterval(sendPresence, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!channelRef.current || !userIdRef.current) return;
    const ch = channelRef.current;
    const timer = setTimeout(() => {
      ch.track({
        user_id:      userIdRef.current,
        display_name: displayRef.current,
        page:         locationRef.current,
        joined_at:    joinedAtRef.current,
        last_seen_at: Date.now(),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [location, user?.id, profile?.display_name]);
}
