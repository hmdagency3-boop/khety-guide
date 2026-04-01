import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type MaintenanceType = "planned" | "emergency" | "update";

export type PageVisibility = {
  home: boolean;
  explore: boolean;
  map: boolean;
  chat: boolean;
  safety: boolean;
  transit: boolean;
  community: boolean;
  guides: boolean;
  support: boolean;
};

export type AdminTabsVisibility = {
  support_chats: boolean;
  overview: boolean;
  notifications: boolean;
  analytics: boolean;
  landmarks: boolean;
  users: boolean;
  conversations: boolean;
  live_users: boolean;
  visitors: boolean;
  locations: boolean;
  welcome_media: boolean;
  settings: boolean;
  audit_log: boolean;
  reports: boolean;
  static_content: boolean;
  banners: boolean;
};

export const DEFAULT_PAGE_VISIBILITY: PageVisibility = {
  home: true,
  explore: true,
  map: true,
  chat: true,
  safety: true,
  transit: true,
  community: true,
  guides: true,
  support: true,
};

export const DEFAULT_ADMIN_TABS_VISIBILITY: AdminTabsVisibility = {
  support_chats: true,
  overview: true,
  notifications: true,
  analytics: true,
  landmarks: true,
  users: true,
  conversations: true,
  live_users: true,
  visitors: true,
  locations: true,
  welcome_media: true,
  settings: true,
  audit_log: true,
  reports: true,
  static_content: true,
  banners: true,
};

export type AppSettingsData = {
  maintenance_mode: boolean;
  maintenance_type: MaintenanceType;
  maintenance_message_ar: string;
  maintenance_message_en: string;
  maintenance_end_time: string;
  maintenance_progress: number;
  maintenance_contact_email: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_color: "info" | "warning" | "success" | "alert";
  install_gate_enabled: boolean;
  page_visibility: PageVisibility;
  admin_tabs_visibility: AdminTabsVisibility;
};

const DEFAULTS: AppSettingsData = {
  maintenance_mode: false,
  maintenance_type: "planned",
  maintenance_message_ar: "نعمل على تحسين تجربتك. سنعود قريباً!",
  maintenance_message_en: "We're working to improve your experience. We'll be back soon!",
  maintenance_end_time: "",
  maintenance_progress: 0,
  maintenance_contact_email: "",
  announcement_enabled: false,
  announcement_text: "",
  announcement_color: "info",
  install_gate_enabled: false,
  page_visibility: { ...DEFAULT_PAGE_VISIBILITY },
  admin_tabs_visibility: { ...DEFAULT_ADMIN_TABS_VISIBILITY },
};

const CACHE_KEY = "khety_app_settings_cache";

function loadCache(): AppSettingsData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSettingsData;
    return {
      ...DEFAULTS,
      ...parsed,
      page_visibility: { ...DEFAULT_PAGE_VISIBILITY, ...(parsed.page_visibility || {}) },
      admin_tabs_visibility: { ...DEFAULT_ADMIN_TABS_VISIBILITY, ...(parsed.admin_tabs_visibility || {}) },
    };
  } catch {
    return null;
  }
}

function parseSettings(data: { key: string; value: string }[]): AppSettingsData {
  const s: AppSettingsData = {
    ...DEFAULTS,
    page_visibility: { ...DEFAULT_PAGE_VISIBILITY },
    admin_tabs_visibility: { ...DEFAULT_ADMIN_TABS_VISIBILITY },
  };
  data.forEach((row) => {
    if (row.key === "maintenance_mode")          s.maintenance_mode = row.value === "true";
    if (row.key === "maintenance_type")          s.maintenance_type = row.value as MaintenanceType;
    if (row.key === "maintenance_message_ar")    s.maintenance_message_ar = row.value;
    if (row.key === "maintenance_message_en")    s.maintenance_message_en = row.value;
    if (row.key === "maintenance_end_time")      s.maintenance_end_time = row.value;
    if (row.key === "maintenance_progress")      s.maintenance_progress = Math.min(100, Math.max(0, parseInt(row.value) || 0));
    if (row.key === "maintenance_contact_email") s.maintenance_contact_email = row.value;
    if (row.key === "announcement_enabled")      s.announcement_enabled = row.value === "true";
    if (row.key === "announcement_text")         s.announcement_text = row.value;
    if (row.key === "announcement_color")        s.announcement_color = row.value as AppSettingsData["announcement_color"];
    if (row.key === "install_gate_enabled")      s.install_gate_enabled = row.value === "true";
    if (row.key === "page_visibility") {
      try { s.page_visibility = { ...DEFAULT_PAGE_VISIBILITY, ...JSON.parse(row.value) }; } catch {}
    }
    if (row.key === "admin_tabs_visibility") {
      try { s.admin_tabs_visibility = { ...DEFAULT_ADMIN_TABS_VISIBILITY, ...JSON.parse(row.value) }; } catch {}
    }
  });
  return s;
}

export function useAppSettings() {
  const cached = loadCache();
  // Cache seeds initial values to prevent visual jump, but loading is ALWAYS
  // true until Supabase confirms — this prevents stale cache from bypassing
  // page visibility guards when the admin has changed settings.
  const [settings, setSettings] = useState<AppSettingsData>(cached ?? DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase.from("app_settings").select("key, value");
      if (data && data.length > 0) {
        const s = parseSettings(data);
        setSettings(s);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch {}
      } else {
        // Table exists but no rows — use defaults and mark loaded
        setSettings({ ...DEFAULTS, page_visibility: { ...DEFAULT_PAGE_VISIBILITY }, admin_tabs_visibility: { ...DEFAULT_ADMIN_TABS_VISIBILITY } });
      }
    } catch {
      // Network/auth error — fall back to cache if available, else defaults
      if (cached) setSettings(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 300_000); // poll every 5 min
    return () => clearInterval(interval);
  }, [fetchSettings]);

  return { settings, loading, refetch: fetchSettings };
}
