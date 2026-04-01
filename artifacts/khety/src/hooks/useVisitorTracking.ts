import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const LS_KEY = "khety_fid";

async function sha256(msg: string): Promise<string> {
  const buf = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function canvasHash(): string {
  try {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("𓂀 Khety", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("𓂀 Khety", 4, 17);
    return c.toDataURL().slice(-40);
  } catch {
    return "";
  }
}

function parseUA(ua: string) {
  let os = "Unknown";
  let device = "Desktop";
  let browser = "Unknown";

  if (/android/i.test(ua)) {
    os = "Android";
    const m = ua.match(/Android [\d.]+;\s*([^;)]+)/i);
    device = m ? m[1].trim() : "Android Device";
  } else if (/iphone/i.test(ua)) {
    os = "iOS";
    device = "iPhone";
  } else if (/ipad/i.test(ua)) {
    os = "iOS";
    device = "iPad";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return { os, device, browser };
}

async function fetchIP(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(4000) });
    const json = await res.json();
    return json.ip || "";
  } catch {
    return "";
  }
}

export function useVisitorTracking(userId?: string) {
  useEffect(() => {
    let cancelled = false;

    async function track() {
      const ua = navigator.userAgent;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const ch = canvasHash();

      const raw = [ua, lang, screen, window.screen.colorDepth, tz, ch].join("|");
      const fid = await sha256(raw);
      if (cancelled) return;

      const stored = localStorage.getItem(LS_KEY);

      if (stored === fid) {
        // Returning visitor — increment visit count via RPC
        void supabase.rpc("increment_visit_count", { fid }).then(() => {}, () => {});
        return;
      }

      // New fingerprint — collect full data
      const { device, browser, os } = parseUA(ua);
      const ip = await fetchIP();
      if (cancelled) return;

      const { error } = await supabase.from("visitor_fingerprints").upsert(
        {
          fingerprint_id: fid,
          ip_address: ip,
          user_agent: ua.slice(0, 500),
          device_name: device,
          browser,
          os,
          screen,
          timezone: tz,
          language: lang,
          canvas_hash: ch,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          visit_count: 1,
          ...(userId ? { user_id: userId } : {}),
        },
        { onConflict: "fingerprint_id", ignoreDuplicates: false }
      );

      if (!error) {
        localStorage.setItem(LS_KEY, fid);
      }
    }

    track();
    return () => { cancelled = true; };
  }, [userId]);
}
