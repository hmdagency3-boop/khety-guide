import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Landmark } from "@/lib/supabase";
import { LoadingScarab } from "@/components/LoadingScarab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  LayoutDashboard, MapPin, Users, MessageSquare, Plus, Pencil,
  Trash2, Save, X, ChevronRight, AlertTriangle, Star, Clock,
  DollarSign, Tag, Globe2, Eye, EyeOff, ShieldCheck, Shield,
  ChevronDown, ChevronUp, TrendingUp, Landmark as LandmarkIcon,
  RefreshCw, Search, BadgeCheck, Monitor, Fingerprint,
  Upload, Video, ImageIcon, Play, ToggleLeft, ToggleRight,
  Smartphone, Wifi, Calendar, Headphones, Navigation, Send,
  CheckCheck, CircleDot, CheckCircle2, XCircle, Clock3,
  User2, Mail, Globe, Inbox, Bell, Info, Zap,
  BarChart2, Settings, Activity, Download, Radio, Megaphone, Wrench, UserX, BellPlus,
  ArrowUpCircle, SlidersHorizontal, ClipboardList, FileBarChart2, PencilLine,
  Crown, BookOpen, Gift, Crosshair, Moon, Sun, Maximize2, Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LocationMapBubble } from "@/components/LocationMapBubble";
import { isLocationMessage } from "@/lib/locationUtils";
import { sendPushNotification } from "@/hooks/usePushNotifications";
import { sendPushBroadcast } from "@/lib/pushBroadcast";

const CATEGORIES = ["ancient", "museum", "mosque", "church", "nature", "market", "beach", "desert"];
const BUCKET = "welcome-to-pocket";
const BANNER_BUCKET = "banners";

type Tab = "overview" | "landmarks" | "users" | "conversations" | "visitors" | "welcome_media" | "support_chats" | "locations" | "notifications" | "analytics" | "live_users" | "settings" | "audit_log" | "reports" | "static_content" | "banners" | "invitations" | "vip_codes" | "canned_replies" | "coord_search";

type Banner = {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  image_url: string | null;
  link_url: string | null;
  bg_from: string;
  bg_to: string;
  accent: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const EMPTY_BANNER: Omit<Banner, "id" | "created_at"> = {
  title: "",
  title_ar: "",
  subtitle: "",
  subtitle_ar: "",
  image_url: null,
  link_url: null,
  bg_from: "#1a0a00",
  bg_to: "#3d1a00",
  accent: "#d4af37",
  is_active: true,
  sort_order: 0,
  starts_at: null,
  ends_at: null,
};

type AuditLog = {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  action_type: string;
  target_type: string | null;
  target_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

type ReportWeek = {
  period: string;
  new_users: number;
  messages: number;
};

type ReportSummary = {
  total_users: number;
  users_this_week: number;
  users_last_week: number;
  messages_this_week: number;
  messages_last_week: number;
  support_open: number;
  support_resolved: number;
  landmarks_published: number;
  landmarks_draft: number;
  weeks: ReportWeek[];
};

type DBProfile = {
  id: string;
  display_name: string | null;
  role: string;
  admin_role: string | null;
  country: string | null;
  preferred_language: string | null;
  created_at: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_official: boolean;
};

type CannedReply = {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  category: string;
  sort_order: number;
  created_at: string;
};

type LandmarkImage = {
  id: string;
  landmark_id: string;
  image_url: string;
  caption: string | null;
  caption_ar: string | null;
  sort_order: number;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile?: { display_name: string | null };
  _messageCount?: number;
};

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

type Stats = {
  users: number;
  landmarks: number;
  conversations: number;
  messages: number;
  published: number;
  unpublished: number;
};

type VisitorRecord = {
  id: string;
  fingerprint_id: string;
  ip_address: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  user_id: string | null;
  visit_count: number;
  first_seen_at: string;
  last_seen_at: string;
};

type WelcomeMediaRecord = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  duration: number;
  is_active: boolean;
  display_mode: "first_time" | "always";
  created_at: string;
};

type SupportChatRecord = {
  id: number;
  chat_token: string;
  user_id: string | null;
  user_email: string;
  user_name: string;
  user_country: string | null;
  user_device: string | null;
  user_browser: string | null;
  user_os: string | null;
  user_timezone: string | null;
  user_ip: string | null;
  user_latitude: number | null;
  user_longitude: number | null;
  user_location_city: string | null;
  status: "open" | "active" | "resolved" | "closed";
  last_message: string | null;
  last_message_at: string | null;
  unread_admin: number;
  unread_user: number;
  created_at: string;
  updated_at: string;
};

type SupportMessageRecord = {
  id: number;
  chat_id: number;
  sender_type: "user" | "admin";
  sender_name: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

type LocationRecord = {
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  address: string | null;
  total_locations: number | null;
  first_seen_at: string;
  last_seen_at: string;
};

type SystemNotification = {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  type: "info" | "success" | "warning" | "alert";
  target_type: "all" | "user";
  target_user_id: string | null;
  is_read: boolean;
  created_at: string;
};

type ScheduledNotification = {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  type: "info" | "success" | "warning" | "alert";
  target_type: "all" | "user";
  target_user_id: string | null;
  send_at: string;
  sent_at: string | null;
  status: "pending" | "processing" | "sent" | "failed" | "cancelled";
  error_message: string | null;
  created_by: string | null;
  created_at: string;
};

const emptyLandmark = (): Partial<Landmark> => ({
  name: "", name_ar: "", description: "", category: "ancient",
  rating: 4.5, ticket_price: "Free", opening_hours: "", city: "",
  region: "", image_url: "", latitude: 30.0444, longitude: 31.2357,
  tags: [], tips: [], highlights: [], is_published: false,
  historical_period: "",
});

function CoordFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.2 }); }, [center[0], center[1], zoom]);
  return null;
}

const coordMarkerIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#D4AF37;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

export default function Admin() {
  const { user, profile, loading, profileLoading } = useAuth();

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

  // Who can enter /admin:
  //  1. Supabase profile role = 'admin'  (super-admin set via SQL)
  //  2. profile.admin_role is set         (content_admin / support_admin assigned by super-admin)
  //  3. VITE_ADMIN_EMAIL match            (owner fallback)
  const isAdmin =
    profile?.role === "admin" ||
    (profile?.admin_role != null && profile.admin_role !== "") ||
    (ADMIN_EMAIL !== "" && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  // myAdminRole determines which tabs are visible inside /admin.
  // null → super-admin (all tabs). Non-null → restricted by ROLE_ALLOWED.
  const myAdminRole: string | null = profile?.admin_role ?? null;

  const [tab, setTab] = useState<Tab>("overview");
  const [coordInput, setCoordInput] = useState("");
  const [coordCenter, setCoordCenter] = useState<[number, number]>([26.8206, 30.8025]);
  const [coordZoom, setCoordZoom] = useState(5);
  const [coordMarker, setCoordMarker] = useState<[number, number] | null>(null);
  const [coordError, setCoordError] = useState<string | null>(null);
  const [coordMapStyle, setCoordMapStyle] = useState<"osm" | "satellite" | "dark">("osm");
  const [coordFullscreen, setCoordFullscreen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Auto-redirect to first allowed tab when role changes ──────────
  // MUST live here (before any early return) to satisfy Rules of Hooks.
  // Uses a static copy of ROLE_ALLOWED to avoid dependency on derived state.
  useEffect(() => {
    const ROLE_TABS: Record<string, string[]> = {
      content_admin: ["overview", "analytics", "landmarks", "banners", "static_content", "welcome_media", "audit_log"],
      support_admin: ["overview", "analytics", "support_chats", "notifications", "users", "conversations", "live_users", "visitors", "locations", "canned_replies", "reports", "audit_log"],
    };
    if (myAdminRole && ROLE_TABS[myAdminRole] && !ROLE_TABS[myAdminRole].includes(tab)) {
      setTab(ROLE_TABS[myAdminRole][0] as Tab);
    }
  }, [myAdminRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Overview
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<DBProfile[]>([]);

  // Landmarks
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [landmarkSearch, setLandmarkSearch] = useState("");
  const [editingLandmark, setEditingLandmark] = useState<Partial<Landmark> | null>(null);
  const [isNewLandmark, setIsNewLandmark] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"landmark" | "conversation" | "user" | "welcome_media" | "banner">("landmark");

  // Users
  const [users, setUsers] = useState<DBProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [togglingRole, setTogglingRole] = useState<string | null>(null);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [banningUser, setBanningUser] = useState<string | null>(null);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedConv, setExpandedConv] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<Record<string, Message[]>>({});
  const [convSearch, setConvSearch] = useState("");

  // Visitors
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [visitorSearch, setVisitorSearch] = useState("");

  // Welcome Media
  const [welcomeMediaList, setWelcomeMediaList] = useState<WelcomeMediaRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDuration, setUploadDuration] = useState(5);
  const [uploadDisplayMode, setUploadDisplayMode] = useState<"first_time" | "always">("first_time");
  const [previewMedia, setPreviewMedia] = useState<WelcomeMediaRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Support Chats
  const [supportChats, setSupportChats] = useState<SupportChatRecord[]>([]);
  const [supportSearch, setSupportSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<SupportChatRecord | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessageRecord[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Locations
  const [locationUsers, setLocationUsers] = useState<LocationRecord[]>([]);
  const [locationSearch, setLocationSearch] = useState("");

  // Notifications
  const [adminNotifications, setAdminNotifications] = useState<SystemNotification[]>([]);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifTitleAr, setNotifTitleAr] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifBodyAr, setNotifBodyAr] = useState("");
  const [notifType, setNotifType] = useState<"info" | "warning" | "success" | "alert">("info");
  const [notifTarget, setNotifTarget] = useState<"all" | "user">("all");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [broadcastingPushPrompt, setBroadcastingPushPrompt] = useState(false);
  const [pushPromptSent, setPushPromptSent] = useState(false);
  const [deletingNotif, setDeletingNotif] = useState<string | null>(null);
  // User picker for targeted notifications
  const [notifUserSearch, setNotifUserSearch] = useState("");
  const [notifSelectedUser, setNotifSelectedUser] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [notifUsersForPicker, setNotifUsersForPicker] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [notifPickerOpen, setNotifPickerOpen] = useState(false);

  // Scheduled Notifications
  const [scheduledNotifs, setScheduledNotifs] = useState<ScheduledNotification[]>([]);
  const [schedTitle, setSchedTitle] = useState("");
  const [schedTitleAr, setSchedTitleAr] = useState("");
  const [schedBody, setSchedBody] = useState("");
  const [schedBodyAr, setSchedBodyAr] = useState("");
  const [schedType, setSchedType] = useState<"info" | "warning" | "success" | "alert">("info");
  const [schedTarget, setSchedTarget] = useState<"all" | "user">("all");
  const [schedTargetUser, setSchedTargetUser] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [schedAt, setSchedAt] = useState("");
  const [savingSched, setSavingSched] = useState(false);
  const [cancellingSchedId, setCancellingSchedId] = useState<string | null>(null);
  const [schedFormOpen, setSchedFormOpen] = useState(false);

  // Analytics
  const [analyticsData, setAnalyticsData] = useState<{
    weeklySignups: { label: string; count: number }[];
    weeklyMessages: { label: string; count: number }[];
    weeklyConversations: { label: string; count: number }[];
    categoryBreakdown: { category: string; count: number }[];
    deviceBreakdown: { os: string; count: number }[];
    totalPushSubs: number;
    totalVisits: number;
  } | null>(null);

  // Live Users (Presence)
  const [onlineUsers, setOnlineUsers] = useState<{
    userId: string; displayName: string; page: string; joinedAt: number; lastSeenAt: number;
  }[]>([]);

  // App Settings
  const [appSettings, setAppSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});

  // Audit Log
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState("all");
  const [auditLoading, setAuditLoading] = useState(false);

  // Reports
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Static Content
  const [staticDraft, setStaticDraft] = useState<Record<string, string>>({});
  const [savingStatic, setSavingStatic] = useState(false);

  // Banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerForm, setBannerForm] = useState<Omit<Banner, "id" | "created_at">>(EMPTY_BANNER);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerImageRef = useRef<HTMLInputElement>(null);

  // Canned Replies
  const [cannedReplies, setCannedReplies]         = useState<CannedReply[]>([]);
  const [cannedLoading, setCannedLoading]         = useState(false);
  const [cannedLoaded, setCannedLoaded]           = useState(false);
  const [cannedForm, setCannedForm]               = useState({ title: "", title_ar: "", body: "", body_ar: "", category: "general" });
  const [cannedEditId, setCannedEditId]           = useState<string | null>(null);
  const [cannedSaving, setCannedSaving]           = useState(false);
  const [cannedFormOpen, setCannedFormOpen]       = useState(false);
  const [cannedPicker, setCannedPicker]           = useState(false);

  // Landmark Images (Gallery)
  const [landmarkImages, setLandmarkImages]       = useState<LandmarkImage[]>([]);
  const [galleryLandmarkId, setGalleryLandmarkId] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading]   = useState(false);
  const galleryInputRef                           = useRef<HTMLInputElement>(null);
  const [galleryActiveIdx, setGalleryActiveIdx]   = useState(0);

  type InvRow = { id: string; inviter: string; invitee: string; created_at: string; inviter_points: number };
  const [invRows, setInvRows]         = useState<InvRow[]>([]);
  const [invLoading, setInvLoading]   = useState(false);
  const [invLoaded, setInvLoaded]     = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  // ── Canned Replies ─────────────────────────────────────────────────
  const loadCannedReplies = useCallback(async () => {
    setCannedLoading(true);
    const { data } = await supabase.from("canned_replies").select("*").order("sort_order");
    if (data) setCannedReplies(data as CannedReply[]);
    setCannedLoading(false);
    setCannedLoaded(true);
  }, []);

  useEffect(() => {
    if (tab === "canned_replies" && !cannedLoaded) loadCannedReplies();
  }, [tab, cannedLoaded, loadCannedReplies]);

  async function saveCannedReply() {
    if (!cannedForm.title.trim() || !cannedForm.body.trim()) return;
    setCannedSaving(true);
    if (cannedEditId) {
      await supabase.from("canned_replies").update({
        title: cannedForm.title.trim(), title_ar: cannedForm.title_ar.trim() || null,
        body: cannedForm.body.trim(), body_ar: cannedForm.body_ar.trim() || null,
        category: cannedForm.category,
      }).eq("id", cannedEditId);
      setCannedReplies(prev => prev.map(r => r.id === cannedEditId ? { ...r, ...cannedForm, title_ar: cannedForm.title_ar || null, body_ar: cannedForm.body_ar || null } : r));
    } else {
      const { data } = await supabase.from("canned_replies").insert({
        title: cannedForm.title.trim(), title_ar: cannedForm.title_ar.trim() || null,
        body: cannedForm.body.trim(), body_ar: cannedForm.body_ar.trim() || null,
        category: cannedForm.category, sort_order: cannedReplies.length,
      }).select().single();
      if (data) setCannedReplies(prev => [...prev, data as CannedReply]);
    }
    setCannedForm({ title: "", title_ar: "", body: "", body_ar: "", category: "general" });
    setCannedEditId(null);
    setCannedFormOpen(false);
    setCannedSaving(false);
  }

  async function deleteCannedReply(id: string) {
    if (!confirm("حذف هذا الرد السريع؟")) return;
    await supabase.from("canned_replies").delete().eq("id", id);
    setCannedReplies(prev => prev.filter(r => r.id !== id));
  }

  // ── Landmark Gallery ──────────────────────────────────────────────
  const loadLandmarkImages = useCallback(async (landmarkId: string) => {
    const { data } = await supabase
      .from("landmark_images")
      .select("*")
      .eq("landmark_id", landmarkId)
      .order("sort_order");
    setLandmarkImages(data as LandmarkImage[] || []);
    setGalleryLandmarkId(landmarkId);
    setGalleryActiveIdx(0);
  }, []);

  async function uploadGalleryImage(file: File, landmarkId: string) {
    if (!file) return;
    setGalleryUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${landmarkId}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("landmark-gallery").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw new Error(upErr.message);
      const { data: urlData } = supabase.storage.from("landmark-gallery").getPublicUrl(path);
      const { data } = await supabase.from("landmark_images").insert({
        landmark_id: landmarkId,
        image_url: urlData.publicUrl,
        sort_order: landmarkImages.length,
      }).select().single();
      if (data) setLandmarkImages(prev => [...prev, data as LandmarkImage]);
    } catch (e: any) { setError(e.message); }
    setGalleryUploading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function deleteGalleryImage(id: string) {
    if (!confirm("حذف هذه الصورة؟")) return;
    await supabase.from("landmark_images").delete().eq("id", id);
    setLandmarkImages(prev => prev.filter(img => img.id !== id));
  }

  async function moveGalleryImage(id: string, dir: "up" | "down") {
    const sorted = [...landmarkImages];
    const idx = sorted.findIndex(img => img.id === id);
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const updated = sorted.map((img, i) => ({ ...img, sort_order: i }));
    setLandmarkImages(updated);
    await Promise.all(updated.map(img =>
      supabase.from("landmark_images").update({ sort_order: img.sort_order }).eq("id", img.id)
    ));
  }

  // ── Sub-Admin Role assignment ──────────────────────────────────────
  async function setAdminRole(uid: string, newRole: string | null) {
    const targetUser = users.find(u => u.id === uid);
    const { error: e } = await supabase.from("profiles").update({ admin_role: newRole }).eq("id", uid);
    if (e) { setError(e.message); return; }
    // Verify the change was actually saved in DB (RLS silently blocks updates without error)
    const { data: fresh } = await supabase.from("profiles").select("admin_role").eq("id", uid).single();
    if (fresh && fresh.admin_role !== newRole) {
      setError("لم يتم حفظ التغيير — تأكد من صلاحياتك في قاعدة البيانات");
      return;
    }
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, admin_role: newRole } : u));
    logAuditEvent("change_setting", "user", targetUser?.display_name || uid, { admin_role: newRole });
  }

  // Load Invitations
  const loadInvitations = useCallback(async () => {
    setInvLoading(true);
    const { data } = await supabase
      .from("invitations")
      .select("id, created_at, inviter:profiles!invitations_inviter_id_fkey(id,display_name,invite_points), invitee:profiles!invitations_invitee_id_fkey(id,display_name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) {
      setInvRows(data.map((r: any) => ({
        id: r.id,
        inviter: r.inviter?.display_name || "—",
        invitee: r.invitee?.display_name || "—",
        created_at: r.created_at,
        inviter_points: r.inviter?.invite_points || 0,
      })));
    }
    setInvLoading(false);
    setInvLoaded(true);
  }, []);

  useEffect(() => {
    if (tab === "invitations" && !invLoaded) loadInvitations();
  }, [tab, invLoaded, loadInvitations]);

  // VIP Codes
  type VipCode = { id: string; code: string; welcome_title: string; welcome_msg: string; welcome_glyph: string; is_active: boolean; max_uses: number | null; used_count: number; created_at: string };
  const [vipCodes, setVipCodes]       = useState<VipCode[]>([]);
  const [vipLoading, setVipLoading]   = useState(false);
  const [vipLoaded, setVipLoaded]     = useState(false);
  const [vipForm, setVipForm]         = useState({ code: "", welcome_title: "أهلاً بك في مجتمعنا", welcome_msg: "يسعدنا انضمامك إلى عائلة دليل الفراعنة", welcome_glyph: "𓇳", max_uses: "" });
  const [vipSaving, setVipSaving]     = useState(false);
  const [vipError, setVipError]       = useState<string | null>(null);

  const loadVipCodes = useCallback(async () => {
    setVipLoading(true);
    const { data } = await supabase.from("vip_invite_codes").select("*").order("created_at", { ascending: false });
    if (data) setVipCodes(data as VipCode[]);
    setVipLoading(false);
    setVipLoaded(true);
  }, []);

  useEffect(() => {
    if (tab === "vip_codes" && !vipLoaded) loadVipCodes();
  }, [tab, vipLoaded, loadVipCodes]);

  async function createVipCode() {
    if (!vipForm.code.trim()) return;
    setVipSaving(true);
    setVipError(null);
    const { error: e } = await supabase.from("vip_invite_codes").insert({
      code: vipForm.code.trim().toUpperCase(),
      welcome_title: vipForm.welcome_title.trim(),
      welcome_msg: vipForm.welcome_msg.trim(),
      welcome_glyph: vipForm.welcome_glyph.trim() || "𓇳",
      max_uses: vipForm.max_uses ? parseInt(vipForm.max_uses) : null,
    });
    if (e) {
      setVipError(e.message);
    } else {
      setVipForm({ code: "", welcome_title: "أهلاً بك في مجتمعنا", welcome_msg: "يسعدنا انضمامك إلى عائلة دليل الفراعنة", welcome_glyph: "𓇳", max_uses: "" });
      loadVipCodes();
    }
    setVipSaving(false);
  }

  async function toggleVipCode(id: string, current: boolean) {
    await supabase.from("vip_invite_codes").update({ is_active: !current }).eq("id", id);
    setVipCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  }

  async function deleteVipCode(id: string) {
    if (!confirm("حذف هذا الكود؟")) return;
    await supabase.from("vip_invite_codes").delete().eq("id", id);
    setVipCodes(prev => prev.filter(c => c.id !== id));
  }

  // Load Banners
  const loadBanners = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order");
    if (e) throw new Error(e.message);
    setBanners((data as Banner[]) || []);
  }, []);

  async function uploadBannerImage(file: File) {
    if (!file) return;
    setBannerUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `banner_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BANNER_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw new Error(upErr.message);
      const { data: urlData } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path);
      setBannerForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (e: any) {
      setError(e.message);
    }
    setBannerUploading(false);
  }

  async function saveBanner() {
    setSavingBanner(true);
    try {
      if (editingBannerId) {
        const { error: e } = await supabase
          .from("banners")
          .update({ ...bannerForm, updated_at: new Date().toISOString() })
          .eq("id", editingBannerId);
        if (e) { setError(e.message); return; }
        setBanners(prev => prev.map(b => b.id === editingBannerId ? { ...b, ...bannerForm } : b));
        logAuditEvent("change_setting", "banner", bannerForm.title || bannerForm.title_ar);
      } else {
        const { data, error: e } = await supabase
          .from("banners")
          .insert({ ...bannerForm, sort_order: banners.length })
          .select()
          .single();
        if (e) { setError(e.message); return; }
        setBanners(prev => [...prev, data as Banner]);
        logAuditEvent("change_setting", "banner", bannerForm.title || bannerForm.title_ar);
      }
      setBannerFormOpen(false);
      setEditingBannerId(null);
      setBannerForm(EMPTY_BANNER);
    } finally {
      setSavingBanner(false);
    }
  }

  async function deleteBanner(id: string) {
    const b = banners.find(x => x.id === id);
    const { error: e } = await supabase.from("banners").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    setBanners(prev => prev.filter(x => x.id !== id));
    setDeleteConfirm(null);
    logAuditEvent("delete_media", "banner", b?.title || b?.title_ar || id);
  }

  async function toggleBanner(id: string, current: boolean) {
    const { error: e } = await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    if (e) { setError(e.message); return; }
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b));
  }

  async function moveBanner(id: string, dir: "up" | "down") {
    const sorted = [...banners];
    const idx = sorted.findIndex(b => b.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
    const updated = sorted.map((b, i) => ({ ...b, sort_order: i }));
    setBanners(updated);
    await Promise.all(
      updated.map(b => supabase.from("banners").update({ sort_order: b.sort_order }).eq("id", b.id))
    );
  }

  // Load Overview
  const handleCoordSearch = useCallback(() => {
    const raw = coordInput.trim();
    const match = raw.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (!match) {
      setCoordError("صيغة غير صحيحة. مثال: 31.084952, 31.216691");
      return;
    }
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordError("إحداثيات خارج النطاق المسموح (lat: -90–90, lng: -180–180)");
      return;
    }
    setCoordError(null);
    setCoordCenter([lat, lng]);
    setCoordMarker([lat, lng]);
    setCoordZoom(15);
  }, [coordInput]);

  const loadOverview = useCallback(async () => {
    const [usersRes, landmarksRes, msgsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, country, preferred_language, created_at, avatar_url").order("created_at", { ascending: false }).limit(5),
      supabase.from("landmarks").select("id, is_published"),
      supabase.from("chat_messages").select("id, user_id"),
    ]);

    const allLandmarks = landmarksRes.data || [];
    const allMsgs = msgsRes.data || [];
    const uniqueUsers = new Set(allMsgs.map((m: any) => m.user_id)).size;

    setStats({
      users: (await supabase.from("profiles").select("id", { count: "exact", head: true })).count || 0,
      landmarks: allLandmarks.length,
      conversations: uniqueUsers,
      messages: allMsgs.length,
      published: allLandmarks.filter(l => l.is_published).length,
      unpublished: allLandmarks.filter(l => !l.is_published).length,
    });
    setRecentUsers(usersRes.data as DBProfile[] || []);
  }, []);

  // Load Landmarks
  const loadLandmarks = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("landmarks")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) throw new Error(e.message);
    setLandmarks(data as Landmark[] || []);
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) throw new Error(e.message);
    setUsers(data as DBProfile[] || []);
    const { data: chats } = await supabase
      .from("support_chats")
      .select("user_id, user_email")
      .not("user_id", "is", null);
    const emailMap: Record<string, string> = {};
    (chats || []).forEach((c: any) => {
      if (c.user_id && c.user_email && !emailMap[c.user_id]) emailMap[c.user_id] = c.user_email;
    });
    setUserEmails(emailMap);
  }, []);

  // Load Conversations
  const loadConversations = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("chat_messages")
      .select("id, user_id, prompt, created_at")
      .order("created_at", { ascending: false });
    if (e) throw new Error(e.message);

    const byUser: Record<string, any> = {};
    (data || []).forEach((msg: any) => {
      if (!byUser[msg.user_id]) {
        byUser[msg.user_id] = {
          id: msg.user_id, user_id: msg.user_id,
          title: "Chat Session", created_at: msg.created_at,
          updated_at: msg.created_at, profile: null, _messageCount: 0,
        };
      }
      byUser[msg.user_id]._messageCount++;
      if (msg.created_at > byUser[msg.user_id].updated_at)
        byUser[msg.user_id].updated_at = msg.created_at;
    });

    const convs = Object.values(byUser).sort(
      (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const userIds = convs.map((c: any) => c.user_id);
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const profileMap: Record<string, string | null> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p.display_name; });
      convs.forEach((c: any) => {
        c.profile = { display_name: profileMap[c.user_id] ?? null };
        c.title = profileMap[c.user_id] ? `${profileMap[c.user_id]}'s Chat` : "Anonymous Chat";
      });
    }
    setConversations(convs);
  }, []);

  // Load Visitors
  const loadVisitors = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("visitor_fingerprints")
      .select("*")
      .order("first_seen_at", { ascending: false });
    if (e) throw new Error(e.message);
    setVisitors(data as VisitorRecord[] || []);
  }, []);

  // Load Welcome Media
  const loadWelcomeMedia = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("welcome_media")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) throw new Error(e.message);
    setWelcomeMediaList(data as WelcomeMediaRecord[] || []);
  }, []);

  // Load Support Chats — direct Supabase (admin RLS policy allows full access)
  const loadSupportChats = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("support_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    if (e) throw new Error(e.message);
    setSupportChats(data as SupportChatRecord[] || []);
  }, []);

  // Load Support Chat Messages
  const loadChatMessages = useCallback(async (chatId: number) => {
    setLoadingMessages(true);
    try {
      const { data, error: e } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (e) throw new Error(e.message);
      setChatMessages(data as SupportMessageRecord[] || []);
      // Mark user messages as read + reset unread counter
      await supabase
        .from("support_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .eq("sender_type", "user")
        .is("read_at", null);
      await supabase
        .from("support_chats")
        .update({ unread_admin: 0 })
        .eq("id", chatId);
      setSupportChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_admin: 0 } : c));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Send Admin Reply
  const sendAdminReply = useCallback(async () => {
    if (!selectedChat || !adminReply.trim() || sendingReply) return;
    setSendingReply(true);
    const content = adminReply.trim();
    setAdminReply("");
    try {
      const { error: e } = await supabase.from("support_messages").insert({
        chat_id: selectedChat.id,
        sender_type: "admin",
        sender_name: "Support Team · Khety",
        content,
      });
      if (e) throw new Error(e.message);
      await supabase.from("support_chats").update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        status: "active",
        unread_user: selectedChat.unread_user + 1,
      }).eq("id", selectedChat.id);
      await loadChatMessages(selectedChat.id);
      setSupportChats(prev => prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, last_message: content, last_message_at: new Date().toISOString(), status: "active" as const }
          : c
      ));
    } catch (e: any) {
      setError(e.message);
    }
    setSendingReply(false);
  }, [selectedChat, adminReply, sendingReply, loadChatMessages]);

  // Send Location Request to user
  const sendLocationRequest = useCallback(async () => {
    if (!selectedChat || sendingReply) return;
    setSendingReply(true);
    try {
      const { error: e } = await supabase.from("support_messages").insert({
        chat_id: selectedChat.id,
        sender_type: "admin",
        sender_name: "Support Team · Khety",
        content: "__LOCATION_REQUEST__",
      });
      if (e) throw new Error(e.message);
      await supabase.from("support_chats").update({
        last_message: "📍 طلب الموقع",
        last_message_at: new Date().toISOString(),
        status: "active",
        unread_user: selectedChat.unread_user + 1,
      }).eq("id", selectedChat.id);
      await loadChatMessages(selectedChat.id);
    } catch (e: any) {
      setError(e.message);
    }
    setSendingReply(false);
  }, [selectedChat, sendingReply, loadChatMessages]);

  // Update Support Chat Status
  const updateChatStatus = useCallback(async (chatId: number, status: string) => {
    const { error: e } = await supabase
      .from("support_chats")
      .update({ status })
      .eq("id", chatId);
    if (e) { setError(e.message); return; }
    setSupportChats(prev => prev.map(c => c.id === chatId ? { ...c, status: status as any } : c));
    if (selectedChat?.id === chatId) setSelectedChat(prev => prev ? { ...prev, status: status as any } : null);
  }, [selectedChat]);

  // Load Locations
  const loadLocations = useCallback(async () => {
    const { data, error: e } = await supabase
      .from("user_last_location")
      .select("*")
      .order("last_seen_at", { ascending: false });
    if (e) throw new Error(e.message);
    setLocationUsers(data as LocationRecord[] || []);
  }, []);

  // Load Notifications (admin sees all) + pre-load users for picker + scheduled
  const loadAdminNotifications = useCallback(async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || "";

    const [notifRes, profilesRes, chatsRes, schedRes] = await Promise.all([
      supabase.from("system_notifications").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name, role").order("created_at", { ascending: false }),
      supabase.from("support_chats").select("user_id, user_email, user_name").not("user_id", "is", null),
      fetch("/api/scheduled/list", {
        headers: { "x-access-token": token },
      }).then(r => r.json()).catch(() => []),
    ]);
    if (notifRes.error) throw new Error(notifRes.error.message);
    setAdminNotifications(notifRes.data || []);
    setScheduledNotifs(Array.isArray(schedRes) ? schedRes : []);

    // Build user picker list: profiles enriched with email from support_chats
    const emailMap: Record<string, string> = {};
    (chatsRes.data || []).forEach((c: any) => {
      if (c.user_id && c.user_email && !emailMap[c.user_id]) {
        emailMap[c.user_id] = c.user_email;
      }
    });
    const pickerList = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.display_name || "Anonymous",
      email: emailMap[p.id] || undefined,
    }));
    setNotifUsersForPicker(pickerList);
  }, []);

  // Load Analytics
  const loadAnalytics = useCallback(async () => {
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    type WithCreatedAt = { created_at: string };
    type LandmarkRow   = { category: string };
    type VisitorRow    = { visit_count: number | null; os: string | null };

    const [profilesRes, msgsRes, convsRes, landmarksRes, pushRes, visitorsRes] = await Promise.all([
      supabase.from("profiles").select("created_at").gte("created_at", sevenWeeksAgo.toISOString()),
      supabase.from("chat_messages").select("created_at").gte("created_at", sevenWeeksAgo.toISOString()),
      supabase.from("conversations").select("created_at").gte("created_at", sevenWeeksAgo.toISOString()),
      supabase.from("landmarks").select("category"),
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
      supabase.from("visitor_fingerprints").select("visit_count, os"),
    ]);

    const errors = [profilesRes.error, msgsRes.error, convsRes.error, landmarksRes.error, visitorsRes.error, pushRes.error]
      .filter(Boolean)
      .map((e) => e!.message);
    if (errors.length > 0) throw new Error(`فشل تحميل التحليلات: ${errors.join("; ")}`);

    const getWeekLabel = (weeksAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - weeksAgo * 7);
      return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
    };

    const getWeekIndex = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const weeks = Math.floor(diff / (7 * 86400000));
      return Math.min(weeks, 6);
    };

    const signupBuckets = Array(7).fill(0);
    (profilesRes.data as WithCreatedAt[] || []).forEach((p) => {
      const idx = getWeekIndex(p.created_at);
      if (idx >= 0 && idx < 7) signupBuckets[idx]++;
    });

    const msgBuckets = Array(7).fill(0);
    (msgsRes.data as WithCreatedAt[] || []).forEach((m) => {
      const idx = getWeekIndex(m.created_at);
      if (idx >= 0 && idx < 7) msgBuckets[idx]++;
    });

    const convBuckets = Array(7).fill(0);
    ((convsRes.data || msgsRes.data || []) as WithCreatedAt[]).forEach((c) => {
      const idx = getWeekIndex(c.created_at);
      if (idx >= 0 && idx < 7) convBuckets[idx]++;
    });

    const weeklySignups = Array.from({ length: 7 }, (_, i) => ({
      label: getWeekLabel(6 - i),
      count: signupBuckets[6 - i] as number,
    }));
    const weeklyMessages = Array.from({ length: 7 }, (_, i) => ({
      label: getWeekLabel(6 - i),
      count: msgBuckets[6 - i] as number,
    }));
    const weeklyConversations = Array.from({ length: 7 }, (_, i) => ({
      label: getWeekLabel(6 - i),
      count: convBuckets[6 - i] as number,
    }));

    const catMap: Record<string, number> = {};
    (landmarksRes.data as LandmarkRow[] || []).forEach((l) => {
      catMap[l.category] = (catMap[l.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const osMap: Record<string, number> = {};
    (visitorsRes.data as VisitorRow[] || []).forEach((v) => {
      const osRaw: string = v.os || "Unknown";
      let os = "أخرى";
      if (/ios|iphone|ipad/i.test(osRaw)) os = "iOS";
      else if (/android/i.test(osRaw)) os = "Android";
      else if (/windows/i.test(osRaw)) os = "Windows";
      else if (/mac|macos/i.test(osRaw)) os = "macOS";
      else if (/linux/i.test(osRaw)) os = "Linux";
      osMap[os] = (osMap[os] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(osMap)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);

    const totalVisits = (visitorsRes.data as VisitorRow[] || []).reduce(
      (s, v) => s + (v.visit_count || 0), 0
    );

    setAnalyticsData({
      weeklySignups,
      weeklyMessages,
      weeklyConversations,
      categoryBreakdown,
      deviceBreakdown,
      totalPushSubs: pushRes.count || 0,
      totalVisits,
    });
  }, []);

  // Load App Settings
  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("app_settings").select("key, value");
    const s: Record<string, string> = {};
    (data || [] as { key: string; value: string }[]).forEach((row: { key: string; value: string }) => { s[row.key] = row.value; });
    setAppSettings(s);
    setSettingsDraft(s);
  }, []);

  async function saveSetting(key: string, value: string) {
    setSavingSettings(true);
    const { error: e } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (e) setError(e.message);
    else {
      setAppSettings(prev => ({ ...prev, [key]: value }));
      setSettingsDraft(prev => ({ ...prev, [key]: value }));
      if (key === "maintenance_mode") {
        logAuditEvent("change_setting", "setting", key, { key, value });
      }
    }
    setSavingSettings(false);
  }

  async function logAuditEvent(
    actionType: string,
    targetType: string | null,
    targetName: string | null,
    details?: Record<string, unknown>
  ) {
    try {
      await supabase.from("admin_audit_log").insert({
        admin_id: user?.id || null,
        admin_name: profile?.display_name || user?.email || "Admin",
        action_type: actionType,
        target_type: targetType,
        target_name: targetName || null,
        details: details || null,
      });
    } catch { }
  }

  const loadAuditLog = useCallback(async () => {
    setAuditLoading(true);
    const { data } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setAuditLogs(data as AuditLog[] || []);
    setAuditLoading(false);
  }, []);

  const loadReports = useCallback(async () => {
    setReportLoading(true);
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7); weekStart.setHours(0,0,0,0);
    const twoWeeksStart = new Date(now); twoWeeksStart.setDate(now.getDate() - 14); twoWeeksStart.setHours(0,0,0,0);
    const eightWeeksStart = new Date(now); eightWeeksStart.setDate(now.getDate() - 56);

    const [totalUsers, allUsers, allMsgs, allSupport, allLandmarks] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("created_at").gte("created_at", eightWeeksStart.toISOString()),
      supabase.from("chat_messages").select("created_at").gte("created_at", eightWeeksStart.toISOString()),
      supabase.from("support_chats").select("status"),
      supabase.from("landmarks").select("is_published"),
    ]);

    const usersData = allUsers.data || [];
    const msgsData = allMsgs.data || [];
    const supportData = allSupport.data || [];
    const landmarksData = allLandmarks.data || [];

    const inRange = (iso: string, from: Date, to: Date) => {
      const d = new Date(iso); return d >= from && d < to;
    };

    const weeks: ReportWeek[] = [];
    for (let i = 7; i >= 0; i--) {
      const ws = new Date(now); ws.setDate(now.getDate() - (i + 1) * 7); ws.setHours(0,0,0,0);
      const we = new Date(ws); we.setDate(ws.getDate() + 7);
      weeks.push({
        period: ws.toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
        new_users: usersData.filter(u => inRange(u.created_at, ws, we)).length,
        messages: msgsData.filter(m => inRange(m.created_at, ws, we)).length,
      });
    }

    setReport({
      total_users: totalUsers.count || 0,
      users_this_week: usersData.filter(u => inRange(u.created_at, weekStart, now)).length,
      users_last_week: usersData.filter(u => inRange(u.created_at, twoWeeksStart, weekStart)).length,
      messages_this_week: msgsData.filter(m => inRange(m.created_at, weekStart, now)).length,
      messages_last_week: msgsData.filter(m => inRange(m.created_at, twoWeeksStart, weekStart)).length,
      support_open: supportData.filter(s => s.status === "open").length,
      support_resolved: supportData.filter(s => s.status === "resolved" || s.status === "closed").length,
      landmarks_published: landmarksData.filter(l => l.is_published).length,
      landmarks_draft: landmarksData.filter(l => !l.is_published).length,
      weeks,
    });
    setReportLoading(false);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Poll active chat messages every 3 s (admin side)
  useEffect(() => {
    if (!selectedChat) return;
    const chatId = selectedChat.id;
    const id = setInterval(async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (!data) return;
      setChatMessages((prev) => {
        if (data.length === prev.length) return prev;
        return data as SupportMessageRecord[];
      });
    }, 3000);
    return () => clearInterval(id);
  }, [selectedChat?.id]);

  // Poll support chat list every 8 s to surface new chats / unread counts
  useEffect(() => {
    if (!isAdmin || !user) return;
    const id = setInterval(async () => {
      const { data } = await supabase
        .from("support_chats")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setSupportChats(data as SupportChatRecord[]);
    }, 8000);
    return () => clearInterval(id);
  }, [isAdmin, user]);

  // Live users presence subscription
  useEffect(() => {
    if (tab !== "live_users" || !isAdmin || !user) return;

    const channelName = `khety-presence-${user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    });

    type PresenceEntry = { user_id?: string; display_name?: string; page?: string; joined_at?: number; last_seen_at?: number };

    const syncUsers = () => {
      const state = channel.presenceState<PresenceEntry>();
      const seen = new Map<string, { userId: string; displayName: string; page: string; joinedAt: number; lastSeenAt: number }>();
      Object.values(state).forEach((arr) => {
        (Array.isArray(arr) ? arr : [arr]).forEach((p: PresenceEntry) => {
          if (p.user_id) {
            const prev = seen.get(p.user_id);
            const lastSeenAt = p.last_seen_at || p.joined_at || Date.now();
            if (!prev || lastSeenAt > prev.lastSeenAt) {
              seen.set(p.user_id, {
                userId: p.user_id,
                displayName: p.display_name || "Anonymous",
                page: p.page || "/",
                joinedAt: p.joined_at || Date.now(),
                lastSeenAt,
              });
            }
          }
        });
      });
      setOnlineUsers(Array.from(seen.values()));
    };

    channel
      .on("presence", { event: "sync" }, syncUsers)
      .on("presence", { event: "join" }, syncUsers)
      .on("presence", { event: "leave" }, syncUsers)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            display_name: profile?.display_name || user.email || "Admin",
            page: "/admin",
            joined_at: Date.now(),
          });
          syncUsers();
        }
      });

    const tick = setInterval(syncUsers, 5000);
    return () => { clearInterval(tick); supabase.removeChannel(channel); };
  }, [tab, isAdmin, user?.id, profile?.display_name]);

  // Live location real-time subscription (always active for admin)
  useEffect(() => {
    if (!isAdmin || !user) return;
    const channel = supabase
      .channel("admin-locations-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_last_location" },
        (payload) => {
          const record = payload.new as LocationRecord;
          if (!record) return;
          setLocationUsers(prev => {
            const idx = prev.findIndex(l => l.user_id === record.user_id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = record;
              return next.sort((a, b) =>
                new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
              );
            }
            return [record, ...prev];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, user?.id]);

  useEffect(() => {
    if (!isAdmin || !user) return;
    setDataLoading(true);
    setError(null);
    const loaders: Record<Tab, () => Promise<void>> = {
      overview: loadOverview,
      landmarks: loadLandmarks,
      users: loadUsers,
      conversations: loadConversations,
      visitors: loadVisitors,
      welcome_media: loadWelcomeMedia,
      support_chats: loadSupportChats,
      locations: loadLocations,
      notifications: loadAdminNotifications,
      analytics: loadAnalytics,
      live_users: async () => {},
      settings: loadSettings,
      audit_log: loadAuditLog,
      reports: loadReports,
      static_content: loadSettings,
      banners: loadBanners,
      invitations: async () => {},
      vip_codes: async () => {},
      canned_replies: async () => { if (!cannedLoaded) await loadCannedReplies(); },
      coord_search: async () => {},
    };
    loaders[tab]()
      .catch((e: any) => setError(e.message))
      .finally(() => setDataLoading(false));
  }, [tab, refreshKey, isAdmin, user, loadOverview, loadLandmarks, loadUsers, loadConversations, loadVisitors, loadWelcomeMedia, loadSupportChats, loadLocations, loadAdminNotifications, loadAnalytics, loadSettings, loadAuditLog, loadReports, loadBanners]);

  async function saveLandmark() {
    if (!editingLandmark?.name) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: editingLandmark.name,
        name_ar: editingLandmark.name_ar || null,
        description: editingLandmark.description || null,
        category: editingLandmark.category || "ancient",
        rating: editingLandmark.rating || 4.5,
        ticket_price: editingLandmark.ticket_price || null,
        opening_hours: editingLandmark.opening_hours || null,
        city: editingLandmark.city || "",
        region: editingLandmark.region || null,
        image_url: editingLandmark.image_url || null,
        latitude: editingLandmark.latitude || 30.0444,
        longitude: editingLandmark.longitude || 31.2357,
        historical_period: editingLandmark.historical_period || null,
        tags: Array.isArray(editingLandmark.tags) ? editingLandmark.tags : [],
        tips: Array.isArray(editingLandmark.tips) ? editingLandmark.tips : [],
        highlights: Array.isArray(editingLandmark.highlights) ? editingLandmark.highlights : [],
        is_published: editingLandmark.is_published ?? false,
      };
      if (isNewLandmark) {
        const { data, error: e } = await supabase.from("landmarks").insert(payload).select().single();
        if (e) throw new Error(e.message);
        setLandmarks(prev => [data as Landmark, ...prev]);
      } else {
        const { data, error: e } = await supabase.from("landmarks").update(payload).eq("id", editingLandmark.id!).select().single();
        if (e) throw new Error(e.message);
        setLandmarks(prev => prev.map(l => l.id === editingLandmark.id ? data as Landmark : l));
      }
      setEditingLandmark(null);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  }

  async function togglePublish(id: string, current: boolean) {
    const { error: e } = await supabase.from("landmarks").update({ is_published: !current }).eq("id", id);
    if (e) { setError(e.message); return; }
    setLandmarks(prev => prev.map(l => l.id === id ? { ...l, is_published: !current } : l));
    const lm = landmarks.find(l => l.id === id);
    logAuditEvent(!current ? "publish_landmark" : "unpublish_landmark", "landmark", lm?.name_ar || lm?.name || id);
  }

  async function deleteLandmark(id: string) {
    const lm = landmarks.find(l => l.id === id);
    const { error: e } = await supabase.from("landmarks").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    setLandmarks(prev => prev.filter(l => l.id !== id));
    setDeleteConfirm(null);
    logAuditEvent("delete_landmark", "landmark", lm?.name_ar || lm?.name || id);
  }

  async function toggleUserRole(uid: string, currentRole: string) {
    setTogglingRole(uid);
    const newRole = currentRole === "admin" ? "user" : "admin";
    const targetUser = users.find(u => u.id === uid);
    const { data, error: e } = await supabase.rpc("set_user_role", {
      p_target_user_id: uid,
      p_new_role: newRole,
    });
    if (e) {
      setError(e.message);
      setTogglingRole(null);
      return;
    }
    if (data?.error) {
      setError(data.error);
      setTogglingRole(null);
      return;
    }
    // Verify the change was actually saved in DB (RLS may silently block without returning an error)
    const { data: fresh } = await supabase.from("profiles").select("role").eq("id", uid).single();
    if (!fresh || fresh.role !== newRole) {
      setError(`فشل التغيير — تأكد أن الـ SQL الخاص بصلاحيات الأدمن (supabase_ban_system.sql) شُغِّل في Supabase`);
      setTogglingRole(null);
      return;
    }
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
    logAuditEvent(newRole === "admin" ? "promote_admin" : "demote_admin", "user", targetUser?.display_name || uid);
    setTogglingRole(null);
  }

  async function deleteUser(uid: string) {
    const targetUser = users.find(u => u.id === uid);
    const { error: e } = await supabase.from("profiles").delete().eq("id", uid);
    if (e) { setError(e.message); return; }
    setUsers(prev => prev.filter(u => u.id !== uid));
    setDeleteConfirm(null);
    logAuditEvent("delete_user", "user", targetUser?.display_name || uid);
  }

  async function toggleOfficialUser(uid: string, current: boolean) {
    const targetUser = users.find(u => u.id === uid);
    const { error: e } = await supabase.from("profiles").update({ is_official: !current }).eq("id", uid);
    if (e) { alert("خطأ: " + e.message); return; }
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_official: !current } : u));
    logAuditEvent("change_setting", "user", targetUser?.display_name || uid, { is_official: !current });
  }

  async function toggleVerifyUser(uid: string, current: boolean) {
    const targetUser = users.find(u => u.id === uid);
    const { error: e } = await supabase.from("profiles").update({ is_verified: !current }).eq("id", uid);
    if (e) { setError(e.message); return; }
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_verified: !current } : u));
    logAuditEvent("change_setting", "user", targetUser?.display_name || uid, { is_verified: !current });
  }

  async function toggleBanUser(uid: string, currentRole: string) {
    setBanningUser(uid);
    const newRole = currentRole === "banned" ? "user" : "banned";
    const targetUser = users.find(u => u.id === uid);
    const { data, error: e } = await supabase.rpc("set_user_role", {
      p_target_user_id: uid,
      p_new_role: newRole,
    });
    if (e) {
      setError(e.message);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
      logAuditEvent(newRole === "banned" ? "ban_user" : "unban_user", "user", targetUser?.display_name || uid);
    }
    setBanningUser(null);
  }

  function quickSendNotifToUser(u: DBProfile) {
    setNotifTarget("user");
    setNotifSelectedUser({ id: u.id, name: u.display_name || "Anonymous", email: userEmails[u.id] });
    setTab("notifications");
  }

  async function deleteConversation(userId: string) {
    const conv = conversations.find(c => c.id === userId);
    const { error: e } = await supabase.from("chat_messages").delete().eq("user_id", userId);
    if (e) { setError(e.message); return; }
    setConversations(prev => prev.filter(c => c.id !== userId));
    setDeleteConfirm(null);
    logAuditEvent("delete_conv", "conversation", conv?.profile?.display_name || userId);
  }

  async function loadMessages(userId: string) {
    if (convMessages[userId] && expandedConv === userId) { setExpandedConv(null); return; }
    if (convMessages[userId]) { setExpandedConv(userId); return; }
    const { data, error: e } = await supabase
      .from("chat_messages")
      .select("id, prompt, response, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (e) { setError(e.message); return; }
    const msgs: Message[] = [];
    (data || []).forEach((row: any) => {
      msgs.push({ id: row.id + "_u", role: "user", content: row.prompt, created_at: row.created_at });
      if (row.response) msgs.push({ id: row.id + "_a", role: "assistant", content: row.response, created_at: row.created_at });
    });
    setConvMessages(prev => ({ ...prev, [userId]: msgs }));
    setExpandedConv(userId);
  }

  async function uploadWelcomeMedia(file: File) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `welcome_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw new Error(upErr.message);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const mediaType: "image" | "video" = file.type.startsWith("video") ? "video" : "image";

      const { error: dbErr } = await supabase.from("welcome_media").insert({
        media_url: urlData.publicUrl,
        media_type: mediaType,
        duration: uploadDuration,
        is_active: true,
        display_mode: uploadDisplayMode,
      });
      if (dbErr) throw new Error(dbErr.message);

      await loadWelcomeMedia();
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function toggleWelcomeActive(id: string, current: boolean) {
    const { error: e } = await supabase.from("welcome_media").update({ is_active: !current }).eq("id", id);
    if (e) { setError(e.message); return; }
    setWelcomeMediaList(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  }

  async function deleteWelcomeMedia(id: string) {
    const { error: e } = await supabase.from("welcome_media").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    setWelcomeMediaList(prev => prev.filter(m => m.id !== id));
    setDeleteConfirm(null);
    logAuditEvent("delete_media", "welcome_media", id);
  }

  // CSV Export helper
  function exportCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
    const escape = (v: string | number | null | undefined) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // Filtered data
  const filteredLandmarks = landmarks.filter(l =>
    !landmarkSearch || l.name.toLowerCase().includes(landmarkSearch.toLowerCase()) ||
    l.city?.toLowerCase().includes(landmarkSearch.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    !userSearch || (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredConvs = conversations.filter(c =>
    !convSearch || c.title?.toLowerCase().includes(convSearch.toLowerCase())
  );
  const filteredVisitors = visitors.filter(v =>
    !visitorSearch ||
    (v.ip_address || "").includes(visitorSearch) ||
    (v.device_name || "").toLowerCase().includes(visitorSearch.toLowerCase()) ||
    (v.browser || "").toLowerCase().includes(visitorSearch.toLowerCase()) ||
    (v.os || "").toLowerCase().includes(visitorSearch.toLowerCase())
  );

  // Show loading while auth session OR profile fetch is in progress.
  // `loading` covers the initial session check; `profileLoading` covers the async
  // DB fetch that happens after the session resolves — without this second guard
  // `profile` is null momentarily, making `isAdmin = false` and flashing "Access Denied"
  // to users who ARE admins.
  if (loading || profileLoading) return <LoadingScarab message="Loading..." />;

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center px-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-lg font-bold">Sign in required</h1>
        <Link href="/login"><Button className="mt-4 rounded-xl">Sign In</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center px-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-lg font-bold text-foreground">ممنوع الوصول</h1>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          ليس لديك صلاحيات للوصول لهذه الصفحة
        </p>
        <Link href="/"><Button variant="outline" className="mt-4 rounded-xl">العودة للرئيسية</Button></Link>
      </div>
    );
  }

  const totalUnreadAdmin = supportChats.reduce((sum, c) => sum + (c.unread_admin || 0), 0);

  async function sendNotification() {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    if (notifTarget === "user" && !notifSelectedUser) {
      setError("يرجى اختيار المستخدم المستهدف من القائمة");
      return;
    }
    setSendingNotif(true);
    setError(null);
    try {
      const payload: any = {
        title: notifTitle.trim(),
        title_ar: notifTitleAr.trim() || null,
        body: notifBody.trim(),
        body_ar: notifBodyAr.trim() || null,
        type: notifType,
        target_type: notifTarget,
        created_by: user!.id,
      };
      if (notifTarget === "user" && notifSelectedUser) {
        payload.target_user_id = notifSelectedUser.id;
      }
      const { error: e } = await supabase.from("system_notifications").insert(payload);
      if (e) throw new Error(e.message);

      // Send Web Push in the background (server fetches subscriptions itself)
      sendPushNotification({
        title:          notifTitle.trim(),
        body:           notifBody.trim(),
        type:           notifType,
        target_user_id: notifTarget === "user" && notifSelectedUser
          ? notifSelectedUser.id : undefined,
      }).then(r => {
        if (r.total > 0) console.log(`[Push] ${r.sent}/${r.total} delivered`);
      }).catch(() => {/* best-effort */});

      setNotifTitle(""); setNotifTitleAr(""); setNotifBody(""); setNotifBodyAr("");
      setNotifType("info"); setNotifTarget("all");
      setNotifSelectedUser(null); setNotifUserSearch(""); setNotifPickerOpen(false);
      await loadAdminNotifications();
      logAuditEvent("send_notification", "notification", notifTitle.trim(), { target: notifTarget, to: notifSelectedUser?.name });
    } catch (e: any) { setError(e.message); }
    setSendingNotif(false);
  }

  async function broadcastPushPrompt() {
    setBroadcastingPushPrompt(true);
    setPushPromptSent(false);
    try {
      await sendPushBroadcast();
      setPushPromptSent(true);
      setTimeout(() => setPushPromptSent(false), 4000);
    } catch (e: any) {
      setError(e.message);
    }
    setBroadcastingPushPrompt(false);
  }

  async function deleteNotification(id: string) {
    setDeletingNotif(id);
    const { error: e } = await supabase.from("system_notifications").delete().eq("id", id);
    if (e) setError(e.message);
    else setAdminNotifications(prev => prev.filter(n => n.id !== id));
    setDeletingNotif(null);
  }

  async function createScheduledNotification() {
    if (!schedTitle.trim() || !schedBody.trim() || !schedAt) return;
    if (schedTarget === "user" && !schedTargetUser?.id) {
      setError("يرجى اختيار مستخدم محدد للإشعار المستهدف");
      return;
    }
    setSavingSched(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || "";
      const res = await fetch("/api/scheduled/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": token },
        body: JSON.stringify({
          title: schedTitle.trim(),
          title_ar: schedTitleAr.trim() || undefined,
          body: schedBody.trim(),
          body_ar: schedBodyAr.trim() || undefined,
          type: schedType,
          target_type: schedTarget,
          target_user_id: schedTarget === "user" ? schedTargetUser!.id : null,
          send_at: new Date(schedAt).toISOString(),
          created_by: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل جدولة الإشعار");
      setScheduledNotifs(prev => [...prev, data].sort((a, b) =>
        new Date(a.send_at).getTime() - new Date(b.send_at).getTime()
      ));
      setSchedTitle(""); setSchedTitleAr(""); setSchedBody(""); setSchedBodyAr("");
      setSchedAt(""); setSchedTarget("all"); setSchedTargetUser(null);
      setSchedFormOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingSched(false);
    }
  }

  async function cancelScheduledNotification(id: string) {
    setCancellingSchedId(id);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || "";
      const res = await fetch(`/api/scheduled/${id}`, {
        method: "DELETE",
        headers: { "x-access-token": token },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setScheduledNotifs(prev => prev.map(n => n.id === id ? { ...n, status: "cancelled" } : n));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCancellingSchedId(null);
    }
  }

  type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
  const TABS: { id: Tab; label: string; icon: LucideIcon; badge?: number; color: string; bg: string }[] = [
    { id: "support_chats", label: "الدعم",       icon: Headphones,      badge: totalUnreadAdmin || undefined,         color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { id: "overview",      label: "الرئيسية",    icon: LayoutDashboard, color: "text-primary",                        bg: "bg-primary/15" },
    { id: "notifications", label: "الإشعارات",   icon: Bell,            badge: adminNotifications.length || undefined, color: "text-yellow-400", bg: "bg-yellow-500/15" },
    { id: "analytics",     label: "التحليلات",   icon: BarChart2,       color: "text-indigo-400",                     bg: "bg-indigo-500/15" },
    { id: "landmarks",     label: "المعالم",     icon: MapPin,          badge: landmarks.length || undefined,         color: "text-amber-400",   bg: "bg-amber-500/15" },
    { id: "users",         label: "المستخدمون",  icon: Users,           badge: users.length || undefined,             color: "text-blue-400",    bg: "bg-blue-500/15" },
    { id: "conversations", label: "المحادثات",   icon: MessageSquare,   badge: conversations.length || undefined,     color: "text-violet-400",  bg: "bg-violet-500/15" },
    { id: "live_users",    label: "أونلاين",     icon: Radio,           badge: onlineUsers.length || undefined,       color: "text-green-400",   bg: "bg-green-500/15" },
    { id: "visitors",      label: "الزوار",      icon: Fingerprint,     badge: visitors.length || undefined,          color: "text-cyan-400",    bg: "bg-cyan-500/15" },
    { id: "locations",     label: "المواقع",     icon: Navigation,      badge: locationUsers.length || undefined,     color: "text-rose-400",    bg: "bg-rose-500/15" },
    { id: "welcome_media", label: "الوسائط",     icon: Play,            badge: welcomeMediaList.length || undefined,  color: "text-orange-400",  bg: "bg-orange-500/15" },
    { id: "settings",       label: "الإعدادات",    icon: Settings,        color: "text-slate-400",    bg: "bg-slate-500/15" },
    { id: "audit_log",      label: "السجل",        icon: ClipboardList,   color: "text-purple-400",   bg: "bg-purple-500/15" },
    { id: "reports",        label: "التقارير",     icon: FileBarChart2,   color: "text-teal-400",     bg: "bg-teal-500/15" },
    { id: "static_content", label: "المحتوى",      icon: PencilLine,      color: "text-pink-400",     bg: "bg-pink-500/15" },
    { id: "banners",         label: "البانرات",     icon: Megaphone,       color: "text-amber-400",    bg: "bg-amber-500/15", badge: banners.length || undefined },
    { id: "invitations",     label: "الدعوات",      icon: Gift,            color: "text-rose-400",     bg: "bg-rose-500/15" },
    { id: "vip_codes",       label: "كودات VIP",    icon: Crown,           color: "text-yellow-400",   bg: "bg-yellow-500/15" },
    { id: "canned_replies",  label: "الردود السريعة", icon: BookOpen,       color: "text-sky-400",      bg: "bg-sky-500/15", badge: cannedReplies.length || undefined },
    { id: "coord_search",    label: "الإحداثيات",    icon: Crosshair,      color: "text-teal-400",     bg: "bg-teal-500/15" },
  ];

  const adminTabsVisRaw: Record<string, boolean> = (() => {
    try { return JSON.parse(appSettings.admin_tabs_visibility || "{}"); } catch { return {}; }
  })();

  // ── Sub-admin role permissions ──────────────────────────────────
  // null admin_role + role='admin' → super_admin (sees everything)
  // 'content_admin'  → content management only
  // 'support_admin'  → support & users only
  const ROLE_ALLOWED: Record<string, Tab[]> = {
    content_admin: [
      "overview", "analytics",
      "landmarks", "banners", "static_content", "welcome_media",
      "audit_log",
    ],
    support_admin: [
      "overview", "analytics",
      "support_chats", "notifications",
      "users", "conversations", "live_users", "visitors", "locations",
      "canned_replies", "reports",
      "audit_log",
    ],
  };

  const allowedByRole: Set<string> | null =
    myAdminRole && ROLE_ALLOWED[myAdminRole]
      ? new Set(ROLE_ALLOWED[myAdminRole])
      : null; // null = super_admin = all tabs visible

  const visibleTabs = TABS.filter(t => {
    // Role check: if restricted, only allow tabs in the set
    if (allowedByRole && !allowedByRole.has(t.id)) return false;
    // Super-admin visibility toggle (from settings) — doesn't apply to settings itself
    if (t.id !== "settings" && adminTabsVisRaw[t.id] === false) return false;
    return true;
  });

  const activeTab = visibleTabs.find(t => t.id === tab) ?? visibleTabs[0] ?? TABS[0];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-b from-[#18120a] to-card border-b border-primary/25 shadow-lg shadow-primary/5">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#18120a]" />
            </div>
            <div>
              <h1 className="text-[15px] font-display font-bold text-foreground leading-none">لوحة الإدارة</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] text-primary/60 font-mono tracking-widest">KHETY ADMIN</p>
                {myAdminRole === "content_admin" && (
                  <span className="text-[9px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/25 px-1.5 py-0.5 rounded-full">محتوى</span>
                )}
                {myAdminRole === "support_admin" && (
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">دعم</span>
                )}
                {!myAdminRole && (
                  <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/25 px-1.5 py-0.5 rounded-full">سوبر أدمن</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={refresh}
            className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all">
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>

        {/* Tab scroll bar */}
        <div className="flex overflow-x-auto hide-scrollbar px-3 pb-3 gap-1.5">
          {visibleTabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95",
                  active ? cn(t.bg, "border border-white/10") : "opacity-55 hover:opacity-80"
                )}
              >
                <div className="relative">
                  <t.icon className={cn("w-4 h-4 transition-colors", active ? t.color : "text-muted-foreground")} />
                  {t.badge != null && t.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[13px] h-3 rounded-full bg-primary text-primary-foreground text-[7px] font-bold flex items-center justify-center px-0.5 leading-none">
                      {t.badge > 99 ? "99+" : t.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[11px] font-bold whitespace-nowrap transition-colors",
                  active ? t.color : "text-muted-foreground"
                )}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden bg-destructive/10 border-b border-destructive/20 px-5 py-2 flex items-center justify-between shrink-0">
            <p className="text-xs text-destructive font-medium">{error}</p>
            <button onClick={() => setError(null)}><X className="w-3.5 h-3.5 text-destructive" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="p-4 space-y-4">
                {/* Hero stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "المستخدمون", value: stats?.users ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", sub: "مسجّلون", onClick: () => setTab("users") },
                    { label: "المعالم", value: stats?.landmarks ?? 0, icon: MapPin, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", sub: `${stats?.published ?? 0} منشور`, onClick: () => setTab("landmarks") },
                    { label: "المحادثات", value: stats?.conversations ?? 0, icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", sub: "محادثات AI", onClick: () => setTab("conversations") },
                    { label: "الرسائل", value: stats?.messages ?? 0, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", sub: "إجمالي" },
                  ].map(s => (
                    <motion.div key={s.label} whileTap={{ scale: 0.97 }}
                      onClick={s.onClick}
                      className={cn("bg-card rounded-2xl border p-4 cursor-pointer active:opacity-80 transition-all", s.border)}>
                      <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center", s.bg)}>
                        <s.icon className={cn("w-5 h-5", s.color)} />
                      </div>
                      <p className={cn("text-3xl font-bold", s.color)}>{s.value.toLocaleString()}</p>
                      <p className="text-xs font-bold text-foreground mt-1">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Landmark status bar */}
                <div className="bg-card rounded-2xl border border-border/40 p-4">
                  <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <LandmarkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>حالة المعالم</span>
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-emerald-400">{stats?.published ?? 0}</p>
                      <p className="text-[10px] text-emerald-400/70 font-semibold mt-0.5">منشور</p>
                    </div>
                    <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-orange-400">{stats?.unpublished ?? 0}</p>
                      <p className="text-[10px] text-orange-400/70 font-semibold mt-0.5">مسودة</p>
                    </div>
                    <div className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-primary">{totalUnreadAdmin}</p>
                      <p className="text-[10px] text-primary/70 font-semibold mt-0.5">رسائل جديدة</p>
                    </div>
                  </div>
                  {/* progress bar */}
                  {(stats?.landmarks ?? 0) > 0 && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${Math.round(((stats?.published ?? 0) / (stats?.landmarks ?? 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-2xl border border-border/40 p-4">
                  <h3 className="text-xs font-bold text-foreground mb-3">إجراءات سريعة</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "إضافة معلم", icon: Plus, color: "text-amber-400", bg: "bg-amber-500/10", onClick: () => { setTab("landmarks"); setEditingLandmark(emptyLandmark()); setIsNewLandmark(true); } },
                      { label: "فتح الدعم", icon: Headphones, color: "text-emerald-400", bg: "bg-emerald-500/10", onClick: () => setTab("support_chats") },
                      { label: "المستخدمون", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", onClick: () => setTab("users") },
                      { label: "رفع وسائط", icon: Upload, color: "text-orange-400", bg: "bg-orange-500/10", onClick: () => setTab("welcome_media") },
                    ].map(a => (
                      <button key={a.label} onClick={a.onClick}
                        className={cn("flex items-center gap-2 p-3 rounded-xl border border-border/30 hover:border-border/60 transition-all active:scale-95", a.bg)}>
                        <a.icon className={cn("w-4 h-4 shrink-0", a.color)} />
                        <span className="text-xs font-semibold text-foreground">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Users */}
                {recentUsers.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border/40 p-4">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>أحدث المستخدمين</span>
                    </h3>
                    <div className="space-y-2.5">
                      {recentUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(u.display_name || "?").slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{u.display_name || "مجهول"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          {u.role === "admin" && (
                            <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold border border-primary/20">ADMIN</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setTab("users")} className="text-xs text-primary font-semibold flex items-center gap-1 mt-3 hover:underline">
                      كل المستخدمين <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── LANDMARKS ── */}
            {tab === "landmarks" && (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={landmarkSearch} onChange={e => setLandmarkSearch(e.target.value)} placeholder="بحث في المعالم..." className="pl-8 h-10 rounded-xl bg-card border-border/50 text-sm" dir="rtl" />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 px-3 rounded-xl" title="تصدير CSV"
                    onClick={() => exportCSV("landmarks.csv",
                      ["الاسم", "الاسم عربي", "المدينة", "الفئة", "التقييم", "منشور", "السعر", "التاريخ"],
                      filteredLandmarks.map(l => [l.name, l.name_ar, l.city, l.category, l.rating, l.is_published ? "نعم" : "لا", l.ticket_price, l.created_at]))}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" className="h-10 px-4 rounded-xl font-semibold"
                    onClick={() => { setEditingLandmark(emptyLandmark()); setIsNewLandmark(true); setError(null); }}>
                    <Plus className="w-4 h-4 mr-1" /> إضافة
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{filteredLandmarks.length} معلم</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> منشور</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" /> مسودة</span>
                  </div>
                </div>

                {filteredLandmarks.map(lm => (
                  <div key={lm.id} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                    <div className="flex items-start gap-3 p-3.5">
                      {lm.image_url ? (
                        <img src={lm.image_url} alt={lm.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-primary/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-bold text-foreground truncate">{lm.name}</p>
                              <span className={cn(
                                "shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                lm.is_published ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"
                              )}>
                                {lm.is_published ? "LIVE" : "DRAFT"}
                              </span>
                            </div>
                            {lm.name_ar && <p className="text-[11px] text-muted-foreground">{lm.name_ar}</p>}
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <Globe2 className="w-3 h-3" /> {lm.city}
                              <span className="capitalize">· {lm.category}</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 ml-0.5" /> {lm.rating}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button onClick={() => togglePublish(lm.id, lm.is_published)}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                              lm.is_published ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "bg-orange-500/10 hover:bg-orange-500/20")}>
                            {lm.is_published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-orange-400" />}
                          </button>
                          <button onClick={() => { setEditingLandmark({ ...lm }); setIsNewLandmark(false); setError(null); }}
                            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <button onClick={() => { setDeleteConfirm(lm.id); setDeleteType("landmark"); }}
                            className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                          {lm.ticket_price && (
                            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-0.5">
                              <DollarSign className="w-2.5 h-2.5" />{lm.ticket_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLandmarks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لم يُعثر على معالم</p>
                  </div>
                )}
              </div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="بحث في المستخدمين..." className="pl-8 h-10 rounded-xl bg-card border-border/50 text-sm" dir="rtl" />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 px-3 rounded-xl" title="تصدير CSV"
                    onClick={() => exportCSV("users.csv",
                      ["الاسم", "البريد الإلكتروني", "الدور", "الدولة", "اللغة", "تاريخ الانضمام"],
                      filteredUsers.map(u => [u.display_name, userEmails[u.id] || "", u.role, u.country, u.preferred_language, u.created_at]))}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {filteredUsers.length} مستخدم · {users.filter(u => u.role === "admin").length} إداري · {users.filter(u => u.role === "banned").length > 0 && <span className="text-destructive">{users.filter(u => u.role === "banned").length} محظور</span>}
                </p>

                {filteredUsers.map(u => (
                  <div key={u.id} className={cn("bg-card rounded-2xl border p-3.5 flex items-center gap-3",
                    u.role === "banned" ? "border-destructive/30 bg-destructive/5" : "border-border/40")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      u.role === "banned" ? "bg-destructive/10" : "bg-primary/10")}>
                      <span className={cn("text-sm font-bold", u.role === "banned" ? "text-destructive" : "text-primary")}>
                        {(u.display_name || "?").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">{u.display_name || "مجهول"}</p>
                        {u.role === "admin" && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                        {u.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" title="موثق" />}
                        {u.is_official && <span className="text-[8px] font-black px-1 py-0.5 rounded-full shrink-0" style={{background:"linear-gradient(135deg,#fde68a,#b45309)",color:"#1c0f00"}}>𓇳 KHETY</span>}
                        {u.role === "banned" && <span className="text-[9px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full font-bold">محظور</span>}
                      </div>
                      {userEmails[u.id] && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5" /> {userEmails[u.id]}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        {u.country && <><Globe2 className="w-2.5 h-2.5" /> {u.country} ·</>}
                        {new Date(u.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        u.role === "admin"  ? "bg-primary/15 text-primary" :
                        u.role === "banned" ? "bg-destructive/15 text-destructive" :
                        "bg-muted text-muted-foreground")}>
                        {u.role === "admin" ? "ADMIN" : u.role === "banned" ? "BANNED" : "USER"}
                      </span>
                      <div className="flex gap-1">
                        {u.id !== user?.id && u.role !== "banned" && (
                          <button onClick={() => quickSendNotifToUser(u)} title="إرسال إشعار"
                            className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                            <BellPlus className="w-3.5 h-3.5 text-yellow-400" />
                          </button>
                        )}
                        {u.id !== user?.id && u.role !== "banned" && (
                          <button
                            onClick={() => toggleVerifyUser(u.id, u.is_verified)}
                            title={u.is_verified ? "إلغاء التوثيق" : "توثيق الحساب"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              u.is_verified ? "bg-blue-500/15 hover:bg-blue-500/25" : "bg-slate-500/10 hover:bg-slate-500/20"
                            }`}>
                            <BadgeCheck className={`w-3.5 h-3.5 ${u.is_verified ? "text-blue-400" : "text-muted-foreground"}`} />
                          </button>
                        )}
                        {u.id !== user?.id && u.role !== "banned" && (
                          <button
                            onClick={() => toggleOfficialUser(u.id, u.is_official)}
                            title={u.is_official ? "إلغاء حساب المنصة" : "تعيين كحساب رسمي للمنصة"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-[10px] font-black ${
                              u.is_official ? "bg-amber-500/20 hover:bg-amber-500/30" : "bg-slate-500/10 hover:bg-slate-500/20"
                            }`}
                            style={u.is_official ? { color: "#f59e0b" } : {}}>
                            𓇳
                          </button>
                        )}
                        {u.id !== user?.id && u.role !== "admin" && (
                          <button onClick={() => toggleBanUser(u.id, u.role)} disabled={banningUser === u.id}
                            title={u.role === "banned" ? "رفع الحظر" : "حظر المستخدم"}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                              u.role === "banned" ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "bg-orange-500/10 hover:bg-orange-500/20",
                              banningUser === u.id && "opacity-40 cursor-not-allowed")}>
                            {banningUser === u.id
                              ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              : u.role === "banned"
                              ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              : <UserX className="w-3.5 h-3.5 text-orange-400" />}
                          </button>
                        )}
                        {u.role !== "banned" && (
                          <button onClick={() => toggleUserRole(u.id, u.role)} disabled={togglingRole === u.id || u.id === user?.id}
                            title={u.role === "admin" ? "إزالة الصلاحيات" : "ترقية لأدمن"}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs",
                              u.role === "admin" ? "bg-primary/10 hover:bg-primary/20" : "bg-slate-500/10 hover:bg-slate-500/20",
                              (togglingRole === u.id || u.id === user?.id) && "opacity-40 cursor-not-allowed")}>
                            {togglingRole === u.id ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              : u.role === "admin" ? <Shield className="w-3.5 h-3.5 text-primary" />
                              : <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                        )}
                        {/* Sub-Admin Role selector — only for admins, not self */}
                        {u.role === "admin" && u.id !== user?.id && !allowedByRole && (
                          <select
                            value={u.admin_role || "super_admin"}
                            onChange={e => setAdminRole(u.id, e.target.value === "super_admin" ? null : e.target.value)}
                            title="نوع صلاحية الأدمن"
                            className="h-7 rounded-lg bg-primary/8 border border-primary/20 text-primary text-[9px] font-bold px-1 cursor-pointer focus:outline-none hover:bg-primary/15 transition-colors">
                            <option value="super_admin">مدير عام</option>
                            <option value="content_admin">محتوى</option>
                            <option value="support_admin">دعم</option>
                          </select>
                        )}
                        {u.id !== user?.id && (
                          <button onClick={() => { setDeleteConfirm(u.id); setDeleteType("user"); }}
                            title="حذف نهائي"
                            className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لم يُعثر على مستخدمين</p>
                  </div>
                )}
              </div>
            )}

            {/* ── CONVERSATIONS ── */}
            {tab === "conversations" && (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={convSearch} onChange={e => setConvSearch(e.target.value)} placeholder="بحث في المحادثات..." className="pl-8 h-10 rounded-xl bg-card border-border/50 text-sm" dir="rtl" />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 px-3 rounded-xl" title="تصدير CSV"
                    onClick={() => exportCSV("conversations.csv",
                      ["المستخدم", "عدد الرسائل", "آخر نشاط"],
                      filteredConvs.map(c => [c.profile?.display_name ?? c.user_id, c._messageCount, c.updated_at]))}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{filteredConvs.length} محادثة</p>

                {filteredConvs.map(c => (
                  <div key={c.id} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                    <div className="flex items-center gap-3 p-3.5">
                      <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{c.title || "Untitled"}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                          <span className="font-medium text-foreground/60">{c.profile?.display_name || "مجهول"}</span>
                          · {c._messageCount} رسالة
                          · <Clock className="w-2.5 h-2.5 inline" /> {new Date(c.updated_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => loadMessages(c.id)} className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                          {expandedConv === c.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => { setDeleteConfirm(c.id); setDeleteType("conversation"); }}
                          className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedConv === c.id && convMessages[c.id] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t border-border/30 px-3.5 py-3 space-y-2 max-h-64 overflow-y-auto">
                            {convMessages[c.id].length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا توجد رسائل</p>}
                            {convMessages[c.id].map(msg => (
                              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[85%] px-3 py-2 rounded-xl text-xs",
                                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                                  <p className="leading-relaxed">{msg.content}</p>
                                  <p className="text-[9px] mt-1 opacity-60">
                                    {msg.role === "user" ? "مستخدم" : "AI"} · {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {filteredConvs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لا توجد محادثات بعد</p>
                  </div>
                )}
              </div>
            )}

            {/* ── VISITORS ── */}
            {tab === "visitors" && (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={visitorSearch} onChange={e => setVisitorSearch(e.target.value)}
                      placeholder="بحث بالـ IP أو الجهاز أو المتصفح..." className="pl-8 h-10 rounded-xl bg-card border-border/50 text-sm" dir="rtl" />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 px-3 rounded-xl" title="تصدير CSV"
                    onClick={() => exportCSV("visitors.csv",
                      ["الـ IP", "الجهاز", "المتصفح", "نظام التشغيل", "الشاشة", "التوقيت", "اللغة", "عدد الزيارات", "أول زيارة", "آخر زيارة"],
                      filteredVisitors.map(v => [v.ip_address, v.device_name, v.browser, v.os, v.screen, v.timezone, v.language, v.visit_count, v.first_seen_at, v.last_seen_at]))}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {filteredVisitors.length} زائر
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    إجمالي الزيارات: {visitors.reduce((s, v) => s + v.visit_count, 0)}
                  </span>
                </div>

                {filteredVisitors.map(v => (
                  <div key={v.id} className="bg-card rounded-2xl border border-border/40 p-3.5 space-y-2.5">
                    {/* Header row */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-foreground font-mono">{v.fingerprint_id.slice(0, 12)}…</p>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            v.visit_count === 1 ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary")}>
                            {v.visit_count === 1 ? "NEW" : `${v.visit_count}×`}
                          </span>
                          {v.user_id && <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">SIGNED IN</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Wifi className="w-2.5 h-2.5" /> {v.ip_address || "Unknown IP"}
                        </p>
                      </div>
                    </div>

                    {/* Device info */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 rounded-xl px-3 py-2">
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5">Device</p>
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5 text-primary shrink-0" />
                          <p className="text-[10px] text-foreground font-medium truncate">{v.device_name || "Unknown"}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{v.os || "—"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-xl px-3 py-2">
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5">Browser</p>
                        <div className="flex items-center gap-1">
                          <Monitor className="w-2.5 h-2.5 text-primary shrink-0" />
                          <p className="text-[10px] text-foreground font-medium truncate">{v.browser || "Unknown"}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{v.screen || "—"}</p>
                      </div>
                    </div>

                    {/* Time info */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 border-t border-border/30">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        First: {new Date(v.first_seen_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Last: {new Date(v.last_seen_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Language / Timezone */}
                    {(v.language || v.timezone) && (
                      <p className="text-[10px] text-muted-foreground/70">
                        {v.language && <span className="mr-3">🌐 {v.language}</span>}
                        {v.timezone && <span>🕐 {v.timezone}</span>}
                      </p>
                    )}
                  </div>
                ))}

                {filteredVisitors.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">لا يوجد زوار بعد</p>
                    <p className="text-xs mt-1 opacity-60">يظهر الزوار هنا عند فتح التطبيق</p>
                  </div>
                )}
              </div>
            )}

            {/* ── WELCOME MEDIA ── */}
            {tab === "welcome_media" && (
              <div className="p-4 space-y-4">
                {/* Upload Card */}
                <div className="bg-card rounded-2xl border border-border/40 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-primary" /> رفع وسيط ترحيبي جديد
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    اختر وضع العرض ثم ارفع الملف. مدعوم: صور (JPG, PNG, GIF, WebP) وفيديو (MP4, WebM).
                    حجم أقصى: 100 MB. البوكيت: <span className="text-primary font-mono">welcome-to-pocket</span>
                  </p>

                  {/* Display Mode Toggle */}
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      وضع العرض
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUploadDisplayMode("first_time")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all",
                          uploadDisplayMode === "first_time"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border/50 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        👋 أول مرة فقط
                      </button>
                      <button
                        onClick={() => setUploadDisplayMode("always")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all",
                          uploadDisplayMode === "always"
                            ? "bg-amber-500 text-black border-amber-500"
                            : "bg-background border-border/50 text-muted-foreground hover:border-amber-400/40"
                        )}
                      >
                        📢 دائم (كل زيارة)
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {uploadDisplayMode === "always"
                        ? "سيظهر للمستخدم في كل مرة يفتح فيها التطبيق"
                        : "يظهر مرة واحدة فقط عند أول دخول للتطبيق"}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      مدة العرض بالثواني (للصور فقط)
                    </label>
                    <Input
                      type="number" min="3" max="60"
                      value={uploadDuration}
                      onChange={e => setUploadDuration(Number(e.target.value))}
                      className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm w-32"
                    />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) uploadWelcomeMedia(file);
                    }}
                  />

                  <Button
                    className="w-full rounded-xl font-semibold gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> اختر صورة أو فيديو
                      </>
                    )}
                  </Button>
                </div>

                {/* Media List */}
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {welcomeMediaList.length} وسائط محفوظة
                </p>

                {welcomeMediaList.map(m => (
                  <div key={m.id} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                    {/* Thumbnail */}
                    <div
                      className="relative w-full aspect-video bg-black cursor-pointer"
                      onClick={() => setPreviewMedia(previewMedia?.id === m.id ? null : m)}
                    >
                      {m.media_type === "video" ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="w-10 h-10 text-white/40" />
                          <p className="absolute bottom-2 right-2 text-[10px] text-white/60 bg-black/50 px-2 py-1 rounded-lg">
                            فيديو · اضغط للمعاينة
                          </p>
                        </div>
                      ) : (
                        <img src={m.media_url} alt="Welcome media" className="w-full h-full object-cover" />
                      )}
                      {previewMedia?.id === m.id && m.media_type === "video" && (
                        <video src={m.media_url} controls autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" />
                      )}
                    </div>

                    {/* Info row */}
                    <div className="p-3.5 flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        m.media_type === "video" ? "bg-violet-500/10" : "bg-amber-500/10")}>
                        {m.media_type === "video"
                          ? <Video className="w-4 h-4 text-violet-400" />
                          : <ImageIcon className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            m.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {m.is_active ? "ACTIVE" : "OFF"}
                          </span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            (m.display_mode ?? "first_time") === "always"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-blue-500/15 text-blue-400")}>
                            {(m.display_mode ?? "first_time") === "always" ? "📢 دائم" : "👋 أول مرة"}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">{m.media_type}</span>
                          {m.media_type === "image" && (
                            <span className="text-[10px] text-muted-foreground">· {m.duration}s</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(m.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleWelcomeActive(m.id, m.is_active)}
                          title={m.is_active ? "إيقاف" : "تفعيل"}
                          className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                            m.is_active ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "bg-muted hover:bg-muted/70")}>
                          {m.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirm(m.id); setDeleteType("welcome_media"); }}
                          className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {welcomeMediaList.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">لا توجد وسائط ترحيبية</p>
                    <p className="text-xs mt-1 opacity-60">ارفع صورة أو فيديو لتظهر لأول زيارة</p>
                  </div>
                )}
              </div>
            )}

            {/* ── SUPPORT CHATS ── */}
            {tab === "support_chats" && (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Two-panel: chat list + selected chat */}
                <AnimatePresence mode="wait">
                  {!selectedChat ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4 space-y-2">
                      {/* Search */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input value={supportSearch} onChange={e => setSupportSearch(e.target.value)}
                          placeholder="بحث باسم أو بريد..." className="pl-8 h-9 rounded-xl bg-background text-xs" />
                      </div>

                      {supportChats
                        .filter(c => !supportSearch ||
                          c.user_name.toLowerCase().includes(supportSearch.toLowerCase()) ||
                          c.user_email.toLowerCase().includes(supportSearch.toLowerCase()))
                        .map(chat => {
                          const statusColor: Record<string, string> = {
                            open: "bg-amber-500/15 text-amber-400",
                            active: "bg-emerald-500/15 text-emerald-400",
                            resolved: "bg-blue-500/15 text-blue-400",
                            closed: "bg-muted text-muted-foreground",
                          };
                          const statusLabel: Record<string, string> = {
                            open: "منتظر", active: "نشط", resolved: "محلول", closed: "مغلق",
                          };
                          return (
                            <motion.button key={chat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              onClick={() => { setSelectedChat(chat); loadChatMessages(chat.id); }}
                              className="w-full text-left bg-card rounded-2xl border border-border/40 p-3.5 hover:border-primary/30 transition-all active:scale-[0.99] relative">
                              {chat.unread_admin > 0 && (
                                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                  {chat.unread_admin}
                                </span>
                              )}
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm shrink-0">
                                  {chat.user_name.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-xs font-bold text-foreground truncate">{chat.user_name}</p>
                                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0", statusColor[chat.status] || "bg-muted text-muted-foreground")}>
                                      {statusLabel[chat.status] || chat.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground truncate">{chat.user_email}</p>
                                  {chat.last_message && (
                                    <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">{chat.last_message}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    {chat.user_country && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{chat.user_country}</span>}
                                    {chat.user_device && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Monitor className="w-2.5 h-2.5" />{chat.user_device}</span>}
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                      {new Date(chat.updated_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}

                      {supportChats.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">لا توجد محادثات دعم بعد</p>
                          <p className="text-xs mt-1 opacity-60">ستظهر هنا عندما يتواصل المستخدمون</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col flex-1 overflow-hidden">
                      {/* Chat header */}
                      <div className="shrink-0 bg-card/80 border-b border-border/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => { setSelectedChat(null); setChatMessages([]); }}
                            className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rotate-180" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{selectedChat.user_name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{selectedChat.user_email}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {(["open", "active", "resolved", "closed"] as const).map(s => (
                              <button key={s} onClick={() => updateChatStatus(selectedChat.id, s)}
                                className={cn("text-[9px] px-2 py-1 rounded-full font-bold transition-all border",
                                  selectedChat.status === s
                                    ? s === "resolved" ? "bg-blue-500/20 text-blue-400 border-blue-400/30"
                                      : s === "closed" ? "bg-muted text-muted-foreground border-border"
                                      : s === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                                      : "bg-amber-500/20 text-amber-400 border-amber-400/30"
                                    : "bg-transparent text-muted-foreground border-border/40 hover:border-border")}>
                                {s === "open" ? "منتظر" : s === "active" ? "نشط" : s === "resolved" ? "محلول" : "مغلق"}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* User info pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {selectedChat.user_device && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Monitor className="w-2.5 h-2.5" />{selectedChat.user_device}</span>}
                          {selectedChat.user_browser && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{selectedChat.user_browser}</span>}
                          {selectedChat.user_os && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{selectedChat.user_os}</span>}
                          {selectedChat.user_country && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{selectedChat.user_country}</span>}
                          {selectedChat.user_location_city && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{selectedChat.user_location_city}</span>}
                          {selectedChat.user_ip && <span className="text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{String(selectedChat.user_ip)}</span>}
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingMessages ? (
                          <div className="flex justify-center py-8">
                            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">لا توجد رسائل بعد</p>
                          </div>
                        ) : chatMessages.map(msg => {
                          const isAdmin = msg.sender_type === "admin";

                          // Special: Location Request
                          if (msg.content === "__LOCATION_REQUEST__" && isAdmin) {
                            return (
                              <div key={msg.id} className="flex gap-2 flex-row-reverse">
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">A</div>
                                <div className="max-w-[72%] flex flex-col items-end">
                                  <div className="bg-blue-500/15 border border-blue-400/40 rounded-2xl rounded-tr-md px-3 py-2.5 space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                      <span className="text-[11px] font-bold text-blue-400">طلب مشاركة الموقع</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">تم إرسال طلب الموقع للمستخدم</p>
                                  </div>
                                  <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                                    {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // Location message → embedded map
                          if (isLocationMessage(msg.content)) {
                            const msgTime = new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
                            return (
                              <div key={msg.id} className={cn("flex gap-2", isAdmin ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1",
                                  isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                  {isAdmin ? "A" : msg.sender_name.slice(0, 1).toUpperCase()}
                                </div>
                                <div className={cn("max-w-[78%] flex flex-col", isAdmin ? "items-end" : "items-start")}>
                                  <div className={cn(
                                    "rounded-2xl overflow-hidden p-2",
                                    isAdmin ? "bg-primary/10 border border-primary/20 rounded-tr-md" : "bg-card border border-border/40 rounded-tl-md"
                                  )}>
                                    <LocationMapBubble content={msg.content} time={msgTime} isUser={!isAdmin} compact />
                                  </div>
                                  {isAdmin && (
                                    <div className="flex items-center gap-1 mt-0.5 px-1">
                                      {msg.read_at ? <CheckCheck className="w-2.5 h-2.5 text-primary" /> : <Clock3 className="w-2.5 h-2.5 text-muted-foreground" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id} className={cn("flex gap-2", isAdmin ? "flex-row-reverse" : "flex-row")}>
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1",
                                isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                {isAdmin ? "A" : msg.sender_name.slice(0, 1).toUpperCase()}
                              </div>
                              <div className={cn("max-w-[72%]", isAdmin ? "items-end" : "items-start", "flex flex-col")}>
                                <div className={cn("px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap",
                                  isAdmin
                                    ? "bg-primary text-primary-foreground rounded-tr-md"
                                    : "bg-card border border-border/40 text-foreground rounded-tl-md")}>
                                  {msg.content}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 px-1">
                                  <span className="text-[9px] text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {isAdmin && (msg.read_at ? <CheckCheck className="w-2.5 h-2.5 text-primary" /> : <Clock3 className="w-2.5 h-2.5 text-muted-foreground" />)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Reply input */}
                      {selectedChat.status !== "closed" && selectedChat.status !== "resolved" && (
                        <div className="shrink-0 bg-card border-t border-border/40 px-3 py-3 space-y-2">
                          {/* Canned Replies picker */}
                          <div className="relative">
                            <button
                              onClick={() => { if (!cannedLoaded) loadCannedReplies(); setCannedPicker(p => !p); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold hover:bg-sky-500/20 transition-colors">
                              <BookOpen className="w-3 h-3" /> ردود سريعة
                            </button>
                            <AnimatePresence>
                              {cannedPicker && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                  className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border/60 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                                  <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">اختر رداً جاهزاً</span>
                                    <button onClick={() => setCannedPicker(false)} className="w-5 h-5 rounded-full bg-muted/40 flex items-center justify-center">
                                      <X className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                  {cannedLoading ? (
                                    <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                                  ) : cannedReplies.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground text-center py-5">لا توجد ردود سريعة بعد</p>
                                  ) : (
                                    <div className="divide-y divide-border/20">
                                      {cannedReplies.map(r => (
                                        <button key={r.id}
                                          onClick={() => { setAdminReply(r.body_ar || r.body); setCannedPicker(false); }}
                                          className="w-full text-right px-3 py-2.5 hover:bg-primary/8 transition-colors">
                                          <p className="text-xs font-bold text-foreground truncate">{r.title_ar || r.title}</p>
                                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{r.body_ar || r.body}</p>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Location request button */}
                          <button
                            onClick={sendLocationRequest}
                            disabled={sendingReply}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-400 text-[11px] font-bold transition-all hover:bg-blue-500/20 active:scale-95 disabled:opacity-50"
                          >
                            <Navigation className="w-3.5 h-3.5 shrink-0" />
                            طلب موقع المستخدم
                          </button>
                          <div className="flex items-end gap-2">
                            <textarea
                              value={adminReply}
                              onChange={e => setAdminReply(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminReply(); }}}
                              placeholder="اكتب ردك هنا..."
                              rows={1}
                              dir="rtl"
                              className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed max-h-20"
                              style={{ fieldSizing: "content" } as any}
                            />
                            <button
                              onClick={sendAdminReply}
                              disabled={!adminReply.trim() || sendingReply}
                              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                              {sendingReply
                                ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                : <Send className="w-3.5 h-3.5 text-primary-foreground" />}
                            </button>
                          </div>
                        </div>
                      )}
                      {(selectedChat.status === "closed" || selectedChat.status === "resolved") && (
                        <div className="shrink-0 bg-muted/30 border-t border-border/40 px-4 py-3 text-center">
                          <p className="text-[11px] text-muted-foreground">المحادثة {selectedChat.status === "closed" ? "مغلقة" : "محلولة"} — غير الحالة لإعادة الرد</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── LOCATIONS ── */}
            {tab === "locations" && (() => {
              const liveThresholdMs  = 2 * 60 * 1000;
              const recentThresholdMs = 15 * 60 * 1000;

              const filtered = locationUsers.filter(u =>
                !locationSearch ||
                (u.user_email || "").toLowerCase().includes(locationSearch.toLowerCase()) ||
                (u.user_name  || "").toLowerCase().includes(locationSearch.toLowerCase()) ||
                (u.city       || "").toLowerCase().includes(locationSearch.toLowerCase()) ||
                (u.country    || "").toLowerCase().includes(locationSearch.toLowerCase())
              );

              const liveCount   = locationUsers.filter(l => Date.now() - new Date(l.last_seen_at).getTime() < liveThresholdMs).length;

              return (
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-rose-400" />
                      مواقع المستخدمين
                      {liveCount > 0 && (
                        <span className="flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
                          <span className="relative flex w-1.5 h-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          {liveCount} مباشر
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{locationUsers.length} مستخدم</span>
                      <Button size="sm" variant="outline" className="h-7 px-2 rounded-lg" title="تصدير CSV"
                        onClick={() => exportCSV("locations.csv",
                          ["الاسم", "البريد الإلكتروني", "المدينة", "الدولة", "خط العرض", "خط الطول", "إجمالي النقاط", "آخر ظهور"],
                          locationUsers.map(l => [l.user_name, l.user_email, l.city, l.country, l.latitude, l.longitude, l.total_locations, l.last_seen_at]))}>
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <p className="text-[10px] text-rose-300">
                      يُطلب الإذن تلقائياً عند فتح التطبيق · يتحدث كل 30 ثانية أو عند التحرك
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={locationSearch} onChange={e => setLocationSearch(e.target.value)}
                      placeholder="بحث باسم أو بريد أو مدينة..." className="pl-8 h-9 rounded-xl bg-background text-xs" dir="rtl" />
                  </div>

                  {/* Cards */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
                        <Navigation className="w-7 h-7 text-rose-400" />
                      </div>
                      <p className="text-sm font-medium">لا توجد بيانات موقع</p>
                      <p className="text-xs mt-1 opacity-60">
                        سيظهر الموقع هنا تلقائياً بمجرد منح المستخدم إذن الموقع في التطبيق
                      </p>
                    </div>
                  ) : (
                    filtered.map(loc => {
                      const msSince  = Date.now() - new Date(loc.last_seen_at || 0).getTime();
                      const isLive   = msSince < liveThresholdMs;
                      const isRecent = msSince < recentThresholdMs;
                      const minsAgo  = Math.floor(msSince / 60000);
                      const hasCoords = loc.latitude != null && loc.longitude != null;

                      return (
                        <div key={loc.user_id || loc.user_email}
                          className={cn("bg-card rounded-2xl border overflow-hidden",
                            isLive ? "border-emerald-500/40" : isRecent ? "border-rose-500/20" : "border-border/40")}>

                          <div className="p-3.5 flex items-start gap-3">
                            {/* Avatar / status */}
                            <div className="relative shrink-0 mt-0.5">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
                                isLive ? "bg-emerald-500/15" : isRecent ? "bg-rose-500/10" : "bg-muted/50")}>
                                <Navigation className={cn("w-4.5 h-4.5",
                                  isLive ? "text-emerald-400" : isRecent ? "text-rose-400" : "text-muted-foreground")} />
                              </div>
                              {isLive && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-emerald-400">
                                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs font-bold text-foreground truncate">{loc.user_name || "مجهول"}</p>
                                {isLive && (
                                  <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                                    مباشر
                                  </span>
                                )}
                              </div>
                              {loc.user_email && (
                                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5 shrink-0" />{loc.user_email}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {loc.city    && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{loc.city}</span>}
                                {loc.country && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{loc.country}</span>}
                              </div>
                              <div className="flex items-center justify-between mt-1.5 gap-2">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock3 className="w-2.5 h-2.5 shrink-0" />
                                  {isLive ? "الآن" : minsAgo < 60 ? `منذ ${minsAgo} د` : `منذ ${Math.floor(minsAgo / 60)} س`}
                                  {loc.total_locations != null && <span className="ml-1 opacity-60">· {loc.total_locations} نقطة</span>}
                                </p>
                                {hasCoords && (
                                  <a href={`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline shrink-0">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {loc.latitude!.toFixed(4)}, {loc.longitude!.toFixed(4)}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mini map */}
                          {hasCoords && (
                            <div className="mx-3.5 mb-3.5 rounded-xl overflow-hidden border border-border/30" style={{ height: 140 }}>
                              <iframe
                                title={`loc-${loc.user_id}`}
                                width="100%"
                                height="140"
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.longitude! - 0.01},${loc.latitude! - 0.01},${loc.longitude! + 0.01},${loc.latitude! + 0.01}&layer=mapnik&marker=${loc.latitude},${loc.longitude}`}
                                style={{ border: "none", display: "block" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}

            {/* ── NOTIFICATIONS ── */}
            {tab === "notifications" && (
              <div className="p-4 space-y-4">
                {/* Send form */}
                <div className="bg-card rounded-2xl border border-yellow-500/20 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-yellow-400" /> إرسال إشعار جديد
                  </h3>

                  {/* Type selector */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">نوع الإشعار</p>
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { v: "info",    label: "معلومة",   color: "text-blue-400",    border: "border-blue-400/40",    bg: "bg-blue-400/10" },
                        { v: "success", label: "نجاح",     color: "text-emerald-400", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
                        { v: "warning", label: "تحذير",    color: "text-amber-400",   border: "border-amber-400/40",   bg: "bg-amber-400/10" },
                        { v: "alert",   label: "تنبيه",    color: "text-rose-400",    border: "border-rose-400/40",    bg: "bg-rose-400/10" },
                      ] as const).map(t => (
                        <button key={t.v} onClick={() => setNotifType(t.v)}
                          className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                            notifType === t.v ? [t.bg, t.border, t.color] : "border-border/30 text-muted-foreground hover:border-border/60")}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target selector */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">المستهدف</p>
                    <div className="flex gap-2 mb-2">
                      {([
                        { v: "all",  label: "جميع المستخدمين" },
                        { v: "user", label: "مستخدم محدد" },
                      ] as const).map(t => (
                        <button key={t.v} onClick={() => { setNotifTarget(t.v); setNotifSelectedUser(null); setNotifUserSearch(""); setNotifPickerOpen(false); }}
                          className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                            notifTarget === t.v
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "border-border/30 text-muted-foreground hover:border-border/60")}>
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {notifTarget === "user" && (
                      <div className="relative">
                        {/* Selected user chip */}
                        {notifSelectedUser ? (
                          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-primary">{notifSelectedUser.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{notifSelectedUser.name}</p>
                              {notifSelectedUser.email && (
                                <p className="text-[10px] text-muted-foreground truncate">{notifSelectedUser.email}</p>
                              )}
                            </div>
                            <button onClick={() => { setNotifSelectedUser(null); setNotifUserSearch(""); }}
                              className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                              <Input
                                value={notifUserSearch}
                                onChange={e => { setNotifUserSearch(e.target.value); setNotifPickerOpen(true); }}
                                onFocus={() => setNotifPickerOpen(true)}
                                onBlur={() => setTimeout(() => setNotifPickerOpen(false), 180)}
                                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                className="pl-8 h-9 rounded-xl bg-background border-border/50 text-xs"
                                dir="rtl"
                              />
                            </div>
                            {notifPickerOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                                {notifUsersForPicker
                                  .filter(u => {
                                    if (!notifUserSearch.trim()) return true;
                                    const q = notifUserSearch.toLowerCase();
                                    return u.name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                                  })
                                  .slice(0, 20)
                                  .map(u => (
                                    <button key={u.id}
                                      onClick={() => { setNotifSelectedUser(u); setNotifUserSearch(""); setNotifPickerOpen(false); }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-primary/8 transition-colors text-left border-b border-border/20 last:border-0">
                                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-primary">{u.name.slice(0, 2).toUpperCase()}</span>
                                      </div>
                                      <div className="flex-1 min-w-0 text-right">
                                        <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                                        {u.email ? (
                                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                                        ) : (
                                          <p className="text-[10px] text-muted-foreground/40 font-mono truncate">{u.id.slice(0, 12)}…</p>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                {notifUsersForPicker.filter(u => {
                                  if (!notifUserSearch.trim()) return true;
                                  const q = notifUserSearch.toLowerCase();
                                  return u.name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                                }).length === 0 && (
                                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                                    لا يوجد مستخدم بهذا الاسم أو البريد
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title EN + AR */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">العنوان (EN) *</p>
                      <Input value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                        placeholder="Title in English"
                        className="h-9 rounded-xl bg-background border-border/50 text-xs" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">العنوان (AR)</p>
                      <Input value={notifTitleAr} onChange={e => setNotifTitleAr(e.target.value)}
                        placeholder="العنوان بالعربية"
                        className="h-9 rounded-xl bg-background border-border/50 text-xs" dir="rtl" />
                    </div>
                  </div>

                  {/* Body EN + AR */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">النص (EN) *</p>
                    <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)}
                      placeholder="Notification body in English..."
                      rows={2}
                      className="w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">النص (AR)</p>
                    <textarea value={notifBodyAr} onChange={e => setNotifBodyAr(e.target.value)}
                      placeholder="نص الإشعار بالعربية..."
                      rows={2} dir="rtl"
                      className="w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>

                  <Button
                    onClick={sendNotification}
                    disabled={sendingNotif || !notifTitle.trim() || !notifBody.trim()}
                    className="w-full h-10 rounded-xl text-sm font-bold gap-2">
                    {sendingNotif
                      ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> جاري الإرسال...</>
                      : <><Send className="w-4 h-4" /> إرسال الإشعار</>}
                  </Button>
                </div>

                {/* Push Prompt Broadcast Button */}
                <div className="bg-card rounded-2xl border border-violet-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">طلب تفعيل الإشعارات</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        يظهر بانر تلقائي لجميع المستخدمين المتصلين الذين لم يفعّلوا الإشعارات بعد
                      </p>
                      <button
                        onClick={broadcastPushPrompt}
                        disabled={broadcastingPushPrompt || pushPromptSent}
                        className={cn(
                          "mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          pushPromptSent
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 active:scale-95 disabled:opacity-60"
                        )}
                      >
                        {broadcastingPushPrompt ? (
                          <><div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" /> جاري الإرسال...</>
                        ) : pushPromptSent ? (
                          <><Zap className="w-3.5 h-3.5" /> تم الإرسال بنجاح ✓</>
                        ) : (
                          <><Zap className="w-3.5 h-3.5" /> إرسال طلب التفعيل للجميع</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── SCHEDULED NOTIFICATIONS ── */}
                <div className="bg-card rounded-2xl border border-blue-500/20 p-4 space-y-3">
                  <button
                    onClick={() => setSchedFormOpen(o => !o)}
                    className="w-full flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">جدولة إشعار</p>
                        <p className="text-[10px] text-muted-foreground">إرسال إشعار في وقت محدد</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scheduledNotifs.filter(n => n.status === "pending").length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">
                          {scheduledNotifs.filter(n => n.status === "pending").length} pending
                        </span>
                      )}
                      {schedFormOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {schedFormOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 pt-1"
                      >
                        {/* Type row */}
                        <div className="flex gap-2 flex-wrap">
                          {([
                            { v: "info",    label: "معلومة",   color: "text-blue-400",    border: "border-blue-400/40",    bg: "bg-blue-400/10" },
                            { v: "success", label: "نجاح",     color: "text-emerald-400", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
                            { v: "warning", label: "تحذير",    color: "text-amber-400",   border: "border-amber-400/40",   bg: "bg-amber-400/10" },
                            { v: "alert",   label: "تنبيه",    color: "text-rose-400",    border: "border-rose-400/40",    bg: "bg-rose-400/10" },
                          ] as const).map(t => (
                            <button key={t.v} onClick={() => setSchedType(t.v)}
                              className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all",
                                schedType === t.v ? [t.bg, t.border, t.color] : "border-border/30 text-muted-foreground hover:border-border/60")}>
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Target row */}
                        <div className="flex gap-2">
                          {([{ v: "all", label: "للجميع" }, { v: "user", label: "مستخدم محدد" }] as const).map(t => (
                            <button key={t.v} onClick={() => { setSchedTarget(t.v); setSchedTargetUser(null); }}
                              className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                schedTarget === t.v
                                  ? "bg-primary/15 border-primary/40 text-primary"
                                  : "border-border/30 text-muted-foreground hover:border-border/60")}>
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* User picker for scheduled (simplified) */}
                        {schedTarget === "user" && (
                          <div>
                            {schedTargetUser ? (
                              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
                                <p className="text-xs flex-1 text-foreground">{schedTargetUser.name}</p>
                                <button onClick={() => setSchedTargetUser(null)}>
                                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                              </div>
                            ) : (
                              <select
                                className="w-full rounded-xl bg-background border border-border/50 text-xs px-3 py-2 focus:outline-none"
                                onChange={e => {
                                  const u = notifUsersForPicker.find(u => u.id === e.target.value);
                                  if (u) setSchedTargetUser(u);
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>اختر مستخدماً...</option>
                                {notifUsersForPicker.map(u => (
                                  <option key={u.id} value={u.id}>{u.name}{u.email ? ` — ${u.email}` : ""}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {/* Title EN / AR */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">العنوان (EN) *</p>
                            <Input value={schedTitle} onChange={e => setSchedTitle(e.target.value)}
                              placeholder="Title..." className="h-8 rounded-xl bg-background border-border/50 text-xs" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">العنوان (AR)</p>
                            <Input value={schedTitleAr} onChange={e => setSchedTitleAr(e.target.value)}
                              placeholder="العنوان..." className="h-8 rounded-xl bg-background border-border/50 text-xs" dir="rtl" />
                          </div>
                        </div>

                        {/* Body */}
                        <textarea value={schedBody} onChange={e => setSchedBody(e.target.value)}
                          placeholder="Notification body (EN) *..." rows={2}
                          className="w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
                        <textarea value={schedBodyAr} onChange={e => setSchedBodyAr(e.target.value)}
                          placeholder="نص الإشعار (AR)..." rows={2} dir="rtl"
                          className="w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />

                        {/* Date/time */}
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">موعد الإرسال *</p>
                          <input type="datetime-local"
                            value={schedAt}
                            onChange={e => setSchedAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full rounded-xl bg-background border border-border/50 text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                          />
                        </div>

                        <Button
                          onClick={createScheduledNotification}
                          disabled={savingSched || !schedTitle.trim() || !schedBody.trim() || !schedAt || (schedTarget === "user" && !schedTargetUser)}
                          className="w-full h-9 rounded-xl text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700">
                          {savingSched
                            ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> جاري الجدولة...</>
                            : <><Calendar className="w-3.5 h-3.5" /> جدولة الإشعار</>}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Scheduled list */}
                  {scheduledNotifs.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border/20">
                      {scheduledNotifs.map(n => {
                        const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
                          pending:   { label: "في الانتظار", color: "text-blue-400",    bg: "bg-blue-400/10" },
                          sent:      { label: "تم الإرسال",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
                          failed:    { label: "فشل",         color: "text-rose-400",    bg: "bg-rose-400/10" },
                          cancelled: { label: "ملغى",        color: "text-muted-foreground", bg: "bg-muted/30" },
                        };
                        const st = STATUS_CFG[n.status] || STATUS_CFG.pending;
                        return (
                          <div key={n.id} className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock3 className="w-2.5 h-2.5" />
                                {new Date(n.send_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0", st.bg, st.color)}>{st.label}</span>
                            {n.status === "pending" && (
                              <button
                                onClick={() => cancelScheduledNotification(n.id)}
                                disabled={cancellingSchedId === n.id}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0">
                                {cancellingSchedId === n.id
                                  ? <div className="w-3 h-3 rounded-full border border-muted-foreground border-t-transparent animate-spin" />
                                  : <X className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sent notifications list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Inbox className="w-3.5 h-3.5 text-muted-foreground" /> الإشعارات المرسلة
                    </h3>
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{adminNotifications.length}</span>
                  </div>

                  {adminNotifications.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">لم يتم إرسال إشعارات بعد</p>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {adminNotifications.map(n => {
                      const TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
                        info:    { label: "معلومة", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
                        success: { label: "نجاح",   color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                        warning: { label: "تحذير",  color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
                        alert:   { label: "تنبيه",  color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20" },
                      };
                      const cfg = TYPE_CFG[n.type] || TYPE_CFG.info;
                      return (
                        <motion.div key={n.id}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                          className="bg-card rounded-2xl border border-border/40 p-3.5">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5", cfg.bg, cfg.border)}>
                              {n.type === "info"    && <Info       className={cn("w-3.5 h-3.5", cfg.color)} />}
                              {n.type === "success" && <CheckCircle2 className={cn("w-3.5 h-3.5", cfg.color)} />}
                              {n.type === "warning" && <AlertTriangle className={cn("w-3.5 h-3.5", cfg.color)} />}
                              {n.type === "alert"   && <Zap         className={cn("w-3.5 h-3.5", cfg.color)} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="text-xs font-bold text-foreground">{n.title}</p>
                                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", cfg.bg, cfg.color)}>{cfg.label}</span>
                                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                  n.target_type === "all"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-violet-400/10 text-violet-400")}>
                                  {n.target_type === "all" ? "للجميع" : (
                                    (() => {
                                      const u = notifUsersForPicker.find(u => u.id === n.target_user_id);
                                      return u ? (u.email || u.name) : "مستخدم محدد";
                                    })()
                                  )}
                                </span>
                              </div>
                              {n.title_ar && <p className="text-[10px] text-muted-foreground" dir="rtl">{n.title_ar}</p>}
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-1.5 flex items-center gap-1">
                                <Clock3 className="w-2.5 h-2.5" />
                                {new Date(n.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNotification(n.id)}
                              disabled={deletingNotif === n.id}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0 mt-0.5">
                              {deletingNotif === n.id
                                ? <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground border-t-transparent animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {tab === "analytics" && (
              <div className="p-4 space-y-5">
                {!analyticsData ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "إجمالي الزيارات", value: analyticsData.totalVisits, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                        { label: "اشتراكات Push", value: analyticsData.totalPushSubs, icon: Bell, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                      ].map(s => (
                        <div key={s.label} className={cn("rounded-2xl border p-3.5", s.bg, s.border)}>
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", s.bg)}>
                            <s.icon className={cn("w-4 h-4", s.color)} />
                          </div>
                          <p className="text-xl font-bold text-foreground">{s.value.toLocaleString("ar-EG")}</p>
                          <p className={cn("text-[10px] font-semibold mt-0.5", s.color)}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Weekly signups chart */}
                    <div className="bg-card rounded-2xl border border-border/40 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold text-foreground">تسجيلات أسبوعية (7 أسابيع)</h3>
                      </div>
                      {(() => {
                        const max = Math.max(...analyticsData.weeklySignups.map(w => w.count), 1);
                        return (
                          <div className="flex items-end gap-2 h-28">
                            {analyticsData.weeklySignups.map((w, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-muted-foreground font-bold">{w.count || ""}</span>
                                <div className="w-full rounded-t-lg bg-blue-500/15 border-t border-blue-500/40 transition-all relative overflow-hidden"
                                  style={{ height: `${Math.max((w.count / max) * 80, w.count > 0 ? 6 : 3)}px` }}>
                                  {w.count > 0 && <div className="absolute inset-0 bg-gradient-to-t from-blue-500/40 to-blue-500/10" />}
                                </div>
                                <span className="text-[8px] text-muted-foreground text-center leading-tight">{w.label}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Weekly messages chart */}
                    <div className="bg-card rounded-2xl border border-border/40 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                        <h3 className="text-xs font-bold text-foreground">رسائل AI أسبوعياً (7 أسابيع)</h3>
                      </div>
                      {(() => {
                        const max = Math.max(...analyticsData.weeklyMessages.map(w => w.count), 1);
                        return (
                          <div className="flex items-end gap-2 h-28">
                            {analyticsData.weeklyMessages.map((w, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-muted-foreground font-bold">{w.count || ""}</span>
                                <div className="w-full rounded-t-lg bg-violet-500/15 border-t border-violet-500/40 transition-all relative overflow-hidden"
                                  style={{ height: `${Math.max((w.count / max) * 80, w.count > 0 ? 6 : 3)}px` }}>
                                  {w.count > 0 && <div className="absolute inset-0 bg-gradient-to-t from-violet-500/40 to-violet-500/10" />}
                                </div>
                                <span className="text-[8px] text-muted-foreground text-center leading-tight">{w.label}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Weekly conversations chart */}
                    <div className="bg-card rounded-2xl border border-border/40 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-teal-400" />
                        <h3 className="text-xs font-bold text-foreground">المحادثات أسبوعياً (7 أسابيع)</h3>
                      </div>
                      {(() => {
                        const max = Math.max(...analyticsData.weeklyConversations.map(w => w.count), 1);
                        return (
                          <div className="flex items-end gap-2 h-28">
                            {analyticsData.weeklyConversations.map((w, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-muted-foreground font-bold">{w.count || ""}</span>
                                <div className="w-full rounded-t-lg bg-teal-500/15 border-t border-teal-500/40 transition-all relative overflow-hidden"
                                  style={{ height: `${Math.max((w.count / max) * 80, w.count > 0 ? 6 : 3)}px` }}>
                                  {w.count > 0 && <div className="absolute inset-0 bg-gradient-to-t from-teal-500/40 to-teal-500/10" />}
                                </div>
                                <span className="text-[8px] text-muted-foreground text-center leading-tight">{w.label}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Category breakdown */}
                    {analyticsData.categoryBreakdown.length > 0 && (
                      <div className="bg-card rounded-2xl border border-border/40 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <h3 className="text-xs font-bold text-foreground">توزيع المعالم حسب الفئة</h3>
                        </div>
                        <div className="space-y-2.5">
                          {(() => {
                            const maxCat = Math.max(...analyticsData.categoryBreakdown.map(c => c.count), 1);
                            return analyticsData.categoryBreakdown.map(c => (
                              <div key={c.category}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[11px] font-semibold capitalize text-foreground">{c.category}</span>
                                  <span className="text-[10px] text-amber-400 font-bold">{c.count}</span>
                                </div>
                                <div className="h-2 rounded-full bg-amber-500/10 overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/40 transition-all"
                                    style={{ width: `${(c.count / maxCat) * 100}%` }} />
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Device breakdown */}
                    {analyticsData.deviceBreakdown.length > 0 && (
                      <div className="bg-card rounded-2xl border border-border/40 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Smartphone className="w-4 h-4 text-rose-400" />
                          <h3 className="text-xs font-bold text-foreground">توزيع الأجهزة حسب النظام</h3>
                        </div>
                        <div className="space-y-2.5">
                          {(() => {
                            const maxDev = Math.max(...analyticsData.deviceBreakdown.map(d => d.count), 1);
                            const total = analyticsData.deviceBreakdown.reduce((s, d) => s + d.count, 0);
                            return analyticsData.deviceBreakdown.map(d => (
                              <div key={d.os}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[11px] font-semibold text-foreground">{d.os}</span>
                                  <span className="text-[10px] text-rose-400 font-bold">
                                    {d.count} ({Math.round((d.count / total) * 100)}%)
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-rose-500/10 overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-rose-500/60 to-rose-400/40 transition-all"
                                    style={{ width: `${(d.count / maxDev) * 100}%` }} />
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── LIVE USERS ── */}
            {tab === "live_users" && (
              <div className="p-4 space-y-4">
                <div className="bg-card rounded-2xl border border-green-500/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-foreground">المستخدمون الآن</h3>
                    </div>
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                      {onlineUsers.length} أونلاين
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">يتجدد تلقائياً عبر Realtime Presence</p>
                </div>

                {onlineUsers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">لا يوجد مستخدمون متصلون حالياً</p>
                    <p className="text-xs mt-1 opacity-60">يظهر المستخدمون هنا عند فتح التطبيق</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {onlineUsers.map((u) => {
                      const pageLabels: Record<string, string> = {
                        "/": "الرئيسية", "/chat": "المحادثة", "/explore": "الاستكشاف",
                        "/map": "الخريطة", "/safety": "السلامة", "/profile": "الملف",
                        "/admin": "لوحة الأدمن", "/support": "الدعم",
                      };
                      const pageLabel = pageLabels[u.page] || u.page;
                      const elapsed = Math.floor((Date.now() - u.lastSeenAt) / 60000);
                      return (
                        <div key={u.userId}
                          className="bg-card rounded-2xl border border-border/40 p-3.5 flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-green-400">{u.displayName.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-card" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{u.displayName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/15">
                                {pageLabel}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                منذ {elapsed < 1 ? "أقل من دقيقة" : `${elapsed} د`}
                              </span>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── APP SETTINGS ── */}
            {tab === "settings" && (() => {
              const mTypeOpts = [
                { value: "planned",   label: "مجدولة",    labelEn: "Planned",   icon: Wrench,        activeCls: "bg-amber-500/20 border-amber-500 text-amber-300" },
                { value: "emergency", label: "طارئة",     labelEn: "Emergency", icon: AlertTriangle,  activeCls: "bg-red-500/20 border-red-500 text-red-300" },
                { value: "update",    label: "تحديث",     labelEn: "Update",    icon: ArrowUpCircle,  activeCls: "bg-blue-500/20 border-blue-500 text-blue-300" },
              ] as const;

              const modeOn = appSettings.maintenance_mode === "true";
              const mType = appSettings.maintenance_type || "planned";
              const mProgress = parseInt(appSettings.maintenance_progress || "0") || 0;

              const mPreviewColors = {
                planned:   { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", bar: "from-amber-500 to-amber-400" },
                emergency: { bg: "bg-red-500/10",   border: "border-red-500/30",   text: "text-red-300",   bar: "from-red-500 to-red-400" },
                update:    { bg: "bg-blue-500/10",  border: "border-blue-500/30",  text: "text-blue-300",  bar: "from-blue-500 to-blue-400" },
              }[mType as "planned" | "emergency" | "update"] || { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", bar: "from-amber-500 to-amber-400" };

              return (
              <div className="p-4 space-y-4">

                {/* ─ MAINTENANCE MODE ─ */}
                <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                  <div className="px-4 pt-4 pb-2 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-foreground">وضع الصيانة</h3>
                      </div>
                      <button
                        onClick={() => saveSetting("maintenance_mode", modeOn ? "false" : "true")}
                        disabled={savingSettings}
                        className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", modeOn ? "bg-amber-500" : "bg-muted")}>
                        <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", modeOn ? "left-[calc(100%-21px)]" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {modeOn
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />وضع الصيانة مفعّل</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />التطبيق يعمل بشكل طبيعي</span>
                      }
                      <span className="text-[10px] text-muted-foreground">· الأدمن لا يتأثر</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Type selector */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">نوع الصيانة</label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {mTypeOpts.map(opt => {
                          const MIcon = opt.icon;
                          const isActive = mType === opt.value;
                          return (
                            <button key={opt.value}
                              onClick={() => saveSetting("maintenance_type", opt.value)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-center",
                                isActive ? opt.activeCls : "bg-muted/30 border-border/40 text-muted-foreground hover:border-border"
                              )}>
                              <MIcon className="w-4 h-4" />
                              <span className="text-[10px] font-bold">{opt.label}</span>
                              <span className="text-[9px] opacity-60">{opt.labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom message AR */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">رسالة الصيانة (عربي)</label>
                      <textarea
                        value={settingsDraft.maintenance_message_ar ?? (appSettings.maintenance_message_ar || "")}
                        onChange={e => setSettingsDraft(prev => ({ ...prev, maintenance_message_ar: e.target.value }))}
                        onBlur={() => saveSetting("maintenance_message_ar", settingsDraft.maintenance_message_ar ?? (appSettings.maintenance_message_ar || ""))}
                        rows={2} dir="rtl"
                        placeholder="نعمل على تحسين تجربتك. سنعود قريباً!"
                        className="mt-1.5 w-full rounded-xl bg-background border border-border/50 text-sm text-foreground p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    {/* Custom message EN */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">رسالة الصيانة (إنجليزي)</label>
                      <textarea
                        value={settingsDraft.maintenance_message_en ?? (appSettings.maintenance_message_en || "")}
                        onChange={e => setSettingsDraft(prev => ({ ...prev, maintenance_message_en: e.target.value }))}
                        onBlur={() => saveSetting("maintenance_message_en", settingsDraft.maintenance_message_en ?? (appSettings.maintenance_message_en || ""))}
                        rows={2} dir="ltr"
                        placeholder="We're working to improve your experience. We'll be back soon!"
                        className="mt-1.5 w-full rounded-xl bg-background border border-border/50 text-sm text-foreground p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    {/* End time + countdown */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">وقت الانتهاء المتوقع (للعداد التنازلي)</label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="datetime-local"
                          value={settingsDraft.maintenance_end_time ?? (appSettings.maintenance_end_time || "")}
                          onChange={e => setSettingsDraft(prev => ({ ...prev, maintenance_end_time: e.target.value }))}
                          onBlur={() => saveSetting("maintenance_end_time", settingsDraft.maintenance_end_time ?? (appSettings.maintenance_end_time || ""))}
                          className="flex-1 rounded-xl bg-background border border-border/50 text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        {appSettings.maintenance_end_time && (
                          <button onClick={() => saveSetting("maintenance_end_time", "")}
                            className="px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            مسح
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">اتركه فارغاً لإخفاء العداد التنازلي</p>
                    </div>

                    {/* Progress slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <SlidersHorizontal className="w-3 h-3 inline mr-1" />نسبة التقدم
                        </label>
                        <span className={cn("text-sm font-bold", mPreviewColors.text)}>{mProgress}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={5}
                        value={mProgress}
                        onChange={e => {
                          const v = e.target.value;
                          setSettingsDraft(prev => ({ ...prev, maintenance_progress: v }));
                          saveSetting("maintenance_progress", v);
                        }}
                        className="w-full accent-amber-500 cursor-pointer" />
                      <div className="mt-2 w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", mPreviewColors.bar)} style={{ width: `${mProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">0% = شريط متحرك · أكثر من 0% = شريط ثابت بالنسبة</p>
                    </div>

                    {/* Contact email */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <Mail className="w-3 h-3 inline mr-1" />بريد التواصل أثناء الصيانة
                      </label>
                      <input
                        type="email" dir="ltr"
                        value={settingsDraft.maintenance_contact_email ?? (appSettings.maintenance_contact_email || "")}
                        onChange={e => setSettingsDraft(prev => ({ ...prev, maintenance_contact_email: e.target.value }))}
                        onBlur={() => saveSetting("maintenance_contact_email", settingsDraft.maintenance_contact_email ?? (appSettings.maintenance_contact_email || ""))}
                        placeholder="support@example.com"
                        className="mt-1.5 w-full rounded-xl bg-background border border-border/50 text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">اتركه فارغاً لإخفاء زر "تواصل معنا"</p>
                    </div>

                    {/* Live preview */}
                    <div className={cn("rounded-2xl p-4 border-2", mPreviewColors.bg, mPreviewColors.border)}>
                      <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">معاينة شاشة الصيانة</p>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", mPreviewColors.bg, mPreviewColors.border)}>
                          {mType === "planned" && <Wrench className={cn("w-5 h-5", mPreviewColors.text)} />}
                          {mType === "emergency" && <AlertTriangle className={cn("w-5 h-5", mPreviewColors.text)} />}
                          {mType === "update" && <ArrowUpCircle className={cn("w-5 h-5", mPreviewColors.text)} />}
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", mPreviewColors.text)}>
                            {mType === "planned" ? "تحت الصيانة" : mType === "emergency" ? "صيانة طارئة" : "جارٍ التحديث"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {settingsDraft.maintenance_message_ar || appSettings.maintenance_message_ar || "نعمل على تحسين تجربتك..."}
                          </p>
                        </div>
                      </div>
                      {mProgress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                            <span>تقدم الأعمال</span>
                            <span className={mPreviewColors.text}>{mProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                            <div className={cn("h-full rounded-full bg-gradient-to-r", mPreviewColors.bar)} style={{ width: `${mProgress}%` }} />
                          </div>
                        </div>
                      )}
                      {appSettings.maintenance_end_time && (
                        <div className={cn("mt-2 text-[10px] font-medium flex items-center gap-1", mPreviewColors.text)}>
                          <Clock3 className="w-3 h-3" />
                          عداد تنازلي مفعّل حتى: {new Date(appSettings.maintenance_end_time).toLocaleString("ar-EG")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─ ANNOUNCEMENT ─ */}
                <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                  <div className="px-4 pt-4 pb-2 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-bold text-foreground">إعلان للمستخدمين</h3>
                      </div>
                      <button
                        onClick={() => saveSetting("announcement_enabled", appSettings.announcement_enabled === "true" ? "false" : "true")}
                        disabled={savingSettings}
                        className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", appSettings.announcement_enabled === "true" ? "bg-blue-500" : "bg-muted")}>
                        <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", appSettings.announcement_enabled === "true" ? "left-[calc(100%-21px)]" : "left-0.5")} />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">شريط إعلان يظهر أعلى التطبيق لجميع المستخدمين</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">نص الإعلان</label>
                      <textarea
                        value={settingsDraft.announcement_text ?? (appSettings.announcement_text || "")}
                        onChange={e => setSettingsDraft(prev => ({ ...prev, announcement_text: e.target.value }))}
                        onBlur={() => saveSetting("announcement_text", settingsDraft.announcement_text ?? (appSettings.announcement_text || ""))}
                        rows={2} dir="rtl"
                        placeholder="اكتب نص الإعلان هنا..."
                        className="mt-1.5 w-full rounded-xl bg-background border border-border/50 text-sm text-foreground p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">لون الإعلان</label>
                      <div className="flex gap-2 mt-2">
                        {(["info", "success", "warning", "alert"] as const).map(color => {
                          const cls = { info: "bg-blue-500 border-blue-600", success: "bg-emerald-500 border-emerald-600", warning: "bg-amber-500 border-amber-600", alert: "bg-red-500 border-red-600" }[color];
                          const labels = { info: "معلومة", success: "نجاح", warning: "تحذير", alert: "تنبيه" };
                          return (
                            <button key={color} onClick={() => saveSetting("announcement_color", color)}
                              className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold text-white border-2 transition-all", cls, appSettings.announcement_color !== color && "opacity-40")}>
                              {labels[color]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {(settingsDraft.announcement_text || appSettings.announcement_text) && (
                      <div className={cn("rounded-xl px-3 py-2.5 text-xs border",
                        appSettings.announcement_color === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                        appSettings.announcement_color === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                        appSettings.announcement_color === "alert"   ? "bg-red-500/10 border-red-500/30 text-red-300" :
                                                                        "bg-blue-500/10 border-blue-500/30 text-blue-300")}>
                        <p className="text-[10px] font-semibold mb-1 opacity-60">معاينة:</p>
                        <p dir="rtl">{settingsDraft.announcement_text || appSettings.announcement_text}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─ INSTALL GATE ─ */}
                <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                  <div className="px-4 pt-4 pb-2 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-foreground">شاشة تنزيل التطبيق</h3>
                      </div>
                      <button
                        onClick={() => saveSetting("install_gate_enabled", appSettings.install_gate_enabled === "true" ? "false" : "true")}
                        disabled={savingSettings}
                        className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", appSettings.install_gate_enabled === "true" ? "bg-emerald-500" : "bg-muted")}>
                        <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", appSettings.install_gate_enabled === "true" ? "left-[calc(100%-21px)]" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {appSettings.install_gate_enabled === "true"
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />الشاشة مفعّلة</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/40 border border-border/40 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block" />الشاشة معطّلة</span>
                      }
                      <span className="text-[10px] text-muted-foreground">· الأدمن لا يتأثر</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">تجبر الزوار على تثبيت التطبيق قبل الدخول · يُعرض لهم دليل التنزيل حسب نظام التشغيل</p>
                  </div>
                  <div className="p-4">
                    <div className={cn(
                      "rounded-xl border p-3 flex items-center gap-3 transition-all",
                      appSettings.install_gate_enabled === "true"
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : "bg-muted/20 border-border/30 opacity-50"
                    )}>
                      <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground">كيف تعمل الشاشة؟</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          عند الدخول للموقع يرى المستخدم شاشة كاملة تطلب منه تثبيت التطبيق · تختفي تلقائياً بعد التثبيت · iOS/Android/Desktop كل جهاز يرى تعليمات مناسبة له
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─ PAGE VISIBILITY ─ */}
                {(() => {
                  const DEFAULT_PAGES = { home: true, explore: true, map: true, chat: true, safety: true, transit: true, community: true, guides: true, support: true };
                  const pageVis: Record<string, boolean> = (() => { try { return { ...DEFAULT_PAGES, ...JSON.parse(appSettings.page_visibility || "{}") }; } catch { return { ...DEFAULT_PAGES }; } })();
                  const PAGE_META = [
                    { key: "home",      labelAr: "الرئيسية",   labelEn: "Home",      color: "text-primary",    bg: "bg-primary/15",      border: "border-primary/30" },
                    { key: "explore",   labelAr: "اكتشاف",     labelEn: "Explore",   color: "text-amber-400",  bg: "bg-amber-500/15",    border: "border-amber-500/30" },
                    { key: "map",       labelAr: "الخريطة",    labelEn: "Map",       color: "text-emerald-400",bg: "bg-emerald-500/15",  border: "border-emerald-500/30" },
                    { key: "chat",      labelAr: "خيتي AI",    labelEn: "Chat",      color: "text-violet-400", bg: "bg-violet-500/15",   border: "border-violet-500/30" },
                    { key: "safety",    labelAr: "الأمان",     labelEn: "Safety",    color: "text-red-400",    bg: "bg-red-500/15",      border: "border-red-500/30" },
                    { key: "transit",   labelAr: "المواصلات",  labelEn: "Transit",   color: "text-blue-400",   bg: "bg-blue-500/15",     border: "border-blue-500/30" },
                    { key: "community", labelAr: "المجتمع",    labelEn: "Community", color: "text-pink-400",   bg: "bg-pink-500/15",     border: "border-pink-500/30" },
                    { key: "guides",    labelAr: "المرشدون",   labelEn: "Guides",    color: "text-orange-400", bg: "bg-orange-500/15",   border: "border-orange-500/30" },
                    { key: "support",   labelAr: "الدعم",      labelEn: "Support",   color: "text-cyan-400",   bg: "bg-cyan-500/15",     border: "border-cyan-500/30" },
                  ];
                  const togglePage = async (key: string) => {
                    const updated = { ...pageVis, [key]: !pageVis[key] };
                    await saveSetting("page_visibility", JSON.stringify(updated));
                  };
                  return (
                    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                      <div className="px-4 pt-4 pb-3 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">التحكم في صفحات التطبيق</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">إخفاء الصفحة يمنع المستخدمين من الوصول إليها · الأدمن لا يتأثر</p>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {PAGE_META.map(p => {
                          const isOn = pageVis[p.key] !== false;
                          return (
                            <button
                              key={p.key}
                              onClick={() => togglePage(p.key)}
                              disabled={savingSettings}
                              className={cn(
                                "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-right",
                                isOn ? `${p.bg} ${p.border}` : "bg-muted/20 border-border/30 opacity-60"
                              )}
                            >
                              <div className="flex flex-col items-start min-w-0">
                                <span className={cn("text-[11px] font-bold truncate", isOn ? p.color : "text-muted-foreground")}>{p.labelAr}</span>
                                <span className="text-[9px] text-muted-foreground/60 font-mono">{p.labelEn}</span>
                              </div>
                              <div className={cn("w-9 h-5 rounded-full shrink-0 relative transition-colors", isOn ? "bg-primary" : "bg-muted/60")}>
                                <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", isOn ? "left-[calc(100%-18px)]" : "left-0.5")} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* ─ ADMIN TABS VISIBILITY ─ */}
                {(() => {
                  const DEFAULT_ADMIN_TABS: Record<string, boolean> = { support_chats: true, overview: true, notifications: true, analytics: true, landmarks: true, users: true, conversations: true, live_users: true, visitors: true, locations: true, welcome_media: true, settings: true, audit_log: true, reports: true, static_content: true, banners: true, invitations: true, vip_codes: true };
                  const tabVis: Record<string, boolean> = (() => { try { return { ...DEFAULT_ADMIN_TABS, ...JSON.parse(appSettings.admin_tabs_visibility || "{}") }; } catch { return { ...DEFAULT_ADMIN_TABS }; } })();
                  const TAB_META = [
                    { key: "overview",      labelAr: "الرئيسية",   color: "text-primary",    bg: "bg-primary/15",    border: "border-primary/30" },
                    { key: "support_chats", labelAr: "الدعم",      color: "text-emerald-400",bg: "bg-emerald-500/15",border: "border-emerald-500/30" },
                    { key: "landmarks",     labelAr: "المعالم",    color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/30" },
                    { key: "users",         labelAr: "المستخدمون", color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/30" },
                    { key: "conversations", labelAr: "المحادثات",  color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30" },
                    { key: "notifications", labelAr: "الإشعارات",  color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
                    { key: "analytics",     labelAr: "التحليلات",  color: "text-indigo-400", bg: "bg-indigo-500/15", border: "border-indigo-500/30" },
                    { key: "live_users",    labelAr: "أونلاين",    color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30" },
                    { key: "visitors",      labelAr: "الزوار",     color: "text-cyan-400",   bg: "bg-cyan-500/15",   border: "border-cyan-500/30" },
                    { key: "locations",     labelAr: "المواقع",    color: "text-rose-400",   bg: "bg-rose-500/15",   border: "border-rose-500/30" },
                    { key: "welcome_media", labelAr: "الوسائط",    color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
                    { key: "audit_log",     labelAr: "السجل",      color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
                    { key: "reports",       labelAr: "التقارير",   color: "text-teal-400",   bg: "bg-teal-500/15",   border: "border-teal-500/30" },
                    { key: "static_content",labelAr: "المحتوى",    color: "text-pink-400",   bg: "bg-pink-500/15",   border: "border-pink-500/30" },
                    { key: "banners",       labelAr: "البانرات",   color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/30" },
                    { key: "invitations",   labelAr: "الدعوات",    color: "text-rose-400",   bg: "bg-rose-500/15",   border: "border-rose-500/30" },
                    { key: "vip_codes",     labelAr: "كودات VIP",  color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
                    { key: "settings",      labelAr: "الإعدادات",  color: "text-slate-400",  bg: "bg-slate-500/15",  border: "border-slate-500/30" },
                  ];
                  const toggleAdminTab = async (key: string) => {
                    if (key === "settings") return;
                    const updated = { ...tabVis, [key]: !tabVis[key] };
                    await saveSetting("admin_tabs_visibility", JSON.stringify(updated));
                  };
                  return (
                    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                      <div className="px-4 pt-4 pb-3 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <h3 className="text-sm font-bold text-foreground">التحكم في تابات لوحة الإدارة</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">إخفاء التاب يزيله من شريط التنقل العلوي · تاب الإعدادات محمي دائماً</p>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {TAB_META.map(t => {
                          const isSettings = t.key === "settings";
                          const isOn = isSettings || tabVis[t.key] !== false;
                          return (
                            <button
                              key={t.key}
                              onClick={() => toggleAdminTab(t.key)}
                              disabled={savingSettings || isSettings}
                              className={cn(
                                "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-right",
                                isOn ? `${t.bg} ${t.border}` : "bg-muted/20 border-border/30 opacity-60",
                                isSettings && "cursor-not-allowed"
                              )}
                            >
                              <div className="flex flex-col items-start min-w-0">
                                <span className={cn("text-[11px] font-bold truncate", isOn ? t.color : "text-muted-foreground")}>{t.labelAr}</span>
                                {isSettings && <span className="text-[9px] text-muted-foreground/60">محمي</span>}
                              </div>
                              <div className={cn("w-9 h-5 rounded-full shrink-0 relative transition-colors", isOn ? "bg-primary" : "bg-muted/60")}>
                                <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", isOn ? "left-[calc(100%-18px)]" : "left-0.5")} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* ─ NOTES ─ */}
                <div className="bg-muted/30 rounded-2xl border border-border/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground">ملاحظات</p>
                  </div>
                  <ul className="text-[11px] text-muted-foreground/70 space-y-1 list-disc list-inside">
                    <li>قم بتشغيل supabase_app_settings.sql في محرر Supabase SQL لتفعيل هذه الميزة</li>
                    <li>التغييرات تنعكس خلال 30 ثانية لجميع المستخدمين</li>
                    <li>الأدمن لا يتأثر بوضع الصيانة</li>
                    <li>العداد التنازلي يظهر فقط إذا حددت وقت الانتهاء</li>
                    <li>شريط التقدم لا يظهر إذا كانت النسبة 0%</li>
                  </ul>
                </div>
              </div>
              );
            })()}

            {/* ── AUDIT LOG ── */}
            {tab === "audit_log" && (() => {
              const ACTION_META: Record<string, { label: string; color: string; bg: string; icon: React.FC<{className?:string}> }> = {
                ban_user:          { label: "حظر مستخدم",        color: "text-red-400",     bg: "bg-red-500/10",     icon: ({ className }) => <Shield className={className} /> },
                unban_user:        { label: "رفع الحظر",          color: "text-emerald-400", bg: "bg-emerald-500/10", icon: ({ className }) => <ShieldCheck className={className} /> },
                delete_user:       { label: "حذف مستخدم",        color: "text-red-400",     bg: "bg-red-500/10",     icon: ({ className }) => <Trash2 className={className} /> },
                promote_admin:     { label: "ترقية لأدمن",       color: "text-amber-400",   bg: "bg-amber-500/10",   icon: ({ className }) => <Crown className={className} /> },
                demote_admin:      { label: "إزالة صلاحية أدمن", color: "text-orange-400",  bg: "bg-orange-500/10",  icon: ({ className }) => <UserX className={className} /> },
                delete_landmark:   { label: "حذف معلم",          color: "text-red-400",     bg: "bg-red-500/10",     icon: ({ className }) => <Trash2 className={className} /> },
                publish_landmark:  { label: "نشر معلم",          color: "text-emerald-400", bg: "bg-emerald-500/10", icon: ({ className }) => <Eye className={className} /> },
                unpublish_landmark:{ label: "إخفاء معلم",        color: "text-slate-400",   bg: "bg-slate-500/10",   icon: ({ className }) => <EyeOff className={className} /> },
                delete_conv:       { label: "حذف محادثة AI",     color: "text-violet-400",  bg: "bg-violet-500/10",  icon: ({ className }) => <MessageSquare className={className} /> },
                change_setting:    { label: "تغيير إعداد",       color: "text-blue-400",    bg: "bg-blue-500/10",    icon: ({ className }) => <Settings className={className} /> },
                send_notification: { label: "إرسال إشعار",       color: "text-yellow-400",  bg: "bg-yellow-500/10",  icon: ({ className }) => <Bell className={className} /> },
                delete_media:      { label: "حذف وسائط",         color: "text-orange-400",  bg: "bg-orange-500/10",  icon: ({ className }) => <Trash2 className={className} /> },
              };

              const filterOpts = [
                { id: "all", label: "الكل" },
                { id: "user", label: "المستخدمون" },
                { id: "landmark", label: "المعالم" },
                { id: "setting", label: "الإعدادات" },
                { id: "notification", label: "الإشعارات" },
              ];

              const filtered = auditFilter === "all"
                ? auditLogs
                : auditLogs.filter(l => l.target_type === auditFilter);

              const timeAgo = (iso: string) => {
                const diff = Date.now() - new Date(iso).getTime();
                const m = Math.floor(diff / 60000);
                const h = Math.floor(diff / 3600000);
                const d = Math.floor(diff / 86400000);
                if (d > 0) return `منذ ${d} يوم`;
                if (h > 0) return `منذ ${h} س`;
                if (m > 0) return `منذ ${m} د`;
                return "الآن";
              };

              return (
                <div className="p-4 space-y-3">
                  {/* Filter */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {filterOpts.map(f => (
                      <button key={f.id} onClick={() => setAuditFilter(f.id)}
                        className={cn("shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all",
                          auditFilter === f.id ? "bg-purple-500/20 border border-purple-500/40 text-purple-300" : "bg-muted/40 border border-border/30 text-muted-foreground hover:text-foreground")}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {auditLoading ? (
                    <div className="flex justify-center py-12"><LoadingScarab message="" /></div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <ClipboardList className="w-7 h-7 text-purple-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">لا توجد أحداث مسجّلة</p>
                      <p className="text-[11px] text-muted-foreground/50 text-center max-w-[220px]">
                        شغّل supabase_audit_log.sql في Supabase SQL Editor لتفعيل هذه الميزة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map(log => {
                        const meta = ACTION_META[log.action_type] || {
                          label: log.action_type, color: "text-muted-foreground", bg: "bg-muted/20",
                          icon: ({ className }: {className?:string}) => <Activity className={className} />,
                        };
                        const MetaIcon = meta.icon;
                        return (
                          <div key={log.id}
                            className="bg-card rounded-2xl border border-border/40 p-3 flex items-start gap-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", meta.bg,
                              meta.color.replace("text-", "border-").replace("400", "500/30"))}>
                              <MetaIcon className={cn("w-4 h-4", meta.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("text-xs font-bold", meta.color)}>{meta.label}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(log.created_at)}</span>
                              </div>
                              {log.target_name && (
                                <p className="text-[11px] text-foreground mt-0.5 truncate" dir="rtl">
                                  {log.target_name}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                بواسطة: {log.admin_name || "أدمن"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-muted/20 rounded-xl border border-border/20 p-3">
                    <p className="text-[10px] text-muted-foreground/60 text-center">
                      يُسجَّل تلقائياً: الحظر، الترقية، الحذف، النشر، الإشعارات، تغيير الصيانة
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* ── REPORTS ── */}
            {tab === "reports" && (() => {
              const pct = (a: number, b: number) => b === 0 ? 0 : Math.round(((a - b) / b) * 100);
              const arrow = (v: number) => v > 0 ? `↑ ${v}%` : v < 0 ? `↓ ${Math.abs(v)}%` : "—";
              const arrowColor = (v: number) => v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-muted-foreground";

              const maxUsers = Math.max(...(report?.weeks.map(w => w.new_users) || [1]), 1);
              const maxMsgs  = Math.max(...(report?.weeks.map(w => w.messages) || [1]), 1);

              return (
                <div className="p-4 space-y-4">
                  {reportLoading ? (
                    <div className="flex justify-center py-12"><LoadingScarab message="" /></div>
                  ) : !report ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                      <FileBarChart2 className="w-10 h-10 text-teal-400" />
                      <p className="text-sm text-muted-foreground">لا توجد بيانات</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "مستخدم جديد هذا الأسبوع", value: report.users_this_week, prev: report.users_last_week, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                          { label: "رسالة AI هذا الأسبوع", value: report.messages_this_week, prev: report.messages_last_week, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
                          { label: "تذاكر دعم مفتوحة", value: report.support_open, prev: 0, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                          { label: "تذاكر محلولة", value: report.support_resolved, prev: 0, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                        ].map(card => {
                          const change = pct(card.value, card.prev);
                          return (
                            <div key={card.label} className={cn("rounded-2xl border p-3.5", card.bg, card.border)}>
                              <p className="text-[10px] text-muted-foreground leading-tight mb-2">{card.label}</p>
                              <p className={cn("text-2xl font-bold font-mono", card.color)}>{card.value}</p>
                              {card.prev > 0 && (
                                <p className={cn("text-[10px] font-semibold mt-1", arrowColor(change))}>
                                  {arrow(change)} مقارنة بالأسبوع السابق
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Landmarks Bar */}
                      <div className="bg-card rounded-2xl border border-border/40 p-4">
                        <p className="text-xs font-bold text-foreground mb-3">حالة المعالم</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 h-3 rounded-full bg-muted/40 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                              style={{ width: `${report.landmarks_published + report.landmarks_draft === 0 ? 0 : (report.landmarks_published / (report.landmarks_published + report.landmarks_draft)) * 100}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0">
                            {report.landmarks_published} / {report.landmarks_published + report.landmarks_draft}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-[10px] text-emerald-400 font-medium">منشور: {report.landmarks_published}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">مسودة: {report.landmarks_draft}</span>
                        </div>
                      </div>

                      {/* Weekly Chart — Users */}
                      <div className="bg-card rounded-2xl border border-border/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-foreground">مستخدمون جدد (8 أسابيع)</p>
                          <span className="text-[10px] text-blue-400 font-semibold">
                            {report.weeks.reduce((s, w) => s + w.new_users, 0)} إجمالي
                          </span>
                        </div>
                        <div className="flex items-end gap-1 h-20">
                          {report.weeks.map((w, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full rounded-t-md bg-blue-500/20 border border-blue-500/30 transition-all"
                                style={{ height: `${Math.max((w.new_users / maxUsers) * 64, w.new_users > 0 ? 8 : 2)}px` }}>
                                {w.new_users > 0 && (
                                  <div className="w-full h-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 opacity-80" />
                                )}
                              </div>
                              <span className="text-[8px] text-muted-foreground/60">{w.period.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Weekly Chart — Messages */}
                      <div className="bg-card rounded-2xl border border-border/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-foreground">رسائل AI (8 أسابيع)</p>
                          <span className="text-[10px] text-violet-400 font-semibold">
                            {report.weeks.reduce((s, w) => s + w.messages, 0)} إجمالي
                          </span>
                        </div>
                        <div className="flex items-end gap-1 h-20">
                          {report.weeks.map((w, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full rounded-t-md bg-violet-500/20 border border-violet-500/30 transition-all"
                                style={{ height: `${Math.max((w.messages / maxMsgs) * 64, w.messages > 0 ? 8 : 2)}px` }}>
                                {w.messages > 0 && (
                                  <div className="w-full h-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 opacity-80" />
                                )}
                              </div>
                              <span className="text-[8px] text-muted-foreground/60">{w.period.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Users */}
                      <div className="bg-card rounded-2xl border border-border/40 p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">إجمالي المستخدمين المسجلين</p>
                          <p className="text-2xl font-bold font-mono text-primary">{report.total_users.toLocaleString("ar-EG")}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── STATIC CONTENT ── */}
            {tab === "static_content" && (() => {
              async function saveStatic(key: string, value: string) {
                setSavingStatic(true);
                await saveSetting(key, value);
                setSavingStatic(false);
              }

              const sections = [
                {
                  title: "بانر الترحيب",
                  icon: BookOpen,
                  color: "text-pink-400",
                  bg: "bg-pink-500/10",
                  border: "border-pink-500/20",
                  fields: [
                    { key: "content_welcome_title", label: "العنوان الرئيسي", placeholder: "مرحباً بك في دليل الفراعنة", rows: 1, dir: "rtl" },
                    { key: "content_welcome_subtitle", label: "النص الفرعي", placeholder: "اكتشف حضارة مصر العريقة مع خيتي", rows: 2, dir: "rtl" },
                  ],
                },
                {
                  title: "نصائح السلامة",
                  icon: ShieldCheck,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                  fields: [
                    { key: "content_safety_tip_1", label: "نصيحة 1", placeholder: "احتفظ بنسخة من جواز سفرك...", rows: 2, dir: "rtl" },
                    { key: "content_safety_tip_2", label: "نصيحة 2", placeholder: "تجنب المشي منفرداً ليلاً...", rows: 2, dir: "rtl" },
                    { key: "content_safety_tip_3", label: "نصيحة 3", placeholder: "احرص على شرب المياه المعبأة...", rows: 2, dir: "rtl" },
                    { key: "content_safety_tip_4", label: "نصيحة 4", placeholder: "تواصل مع السفارة عند وصولك...", rows: 2, dir: "rtl" },
                    { key: "content_safety_tip_5", label: "نصيحة 5", placeholder: "تأكد من تأمين سفر شامل...", rows: 2, dir: "rtl" },
                  ],
                },
                {
                  title: "الأسئلة الشائعة",
                  icon: MessageSquare,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                  fields: [
                    { key: "content_faq_1_q", label: "سؤال 1", placeholder: "ما هي أفضل وقت لزيارة مصر؟", rows: 1, dir: "rtl" },
                    { key: "content_faq_1_a", label: "إجابة 1", placeholder: "الأشهر من أكتوبر إلى أبريل...", rows: 2, dir: "rtl" },
                    { key: "content_faq_2_q", label: "سؤال 2", placeholder: "هل يلزم تأشيرة لدخول مصر؟", rows: 1, dir: "rtl" },
                    { key: "content_faq_2_a", label: "إجابة 2", placeholder: "معظم الجنسيات تحصل على تأشيرة...", rows: 2, dir: "rtl" },
                    { key: "content_faq_3_q", label: "سؤال 3", placeholder: "ما العملة المستخدمة في مصر؟", rows: 1, dir: "rtl" },
                    { key: "content_faq_3_a", label: "إجابة 3", placeholder: "الجنيه المصري (EGP)...", rows: 2, dir: "rtl" },
                  ],
                },
                {
                  title: "من نحن",
                  icon: Globe2,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                  fields: [
                    { key: "content_about", label: "نص من نحن", placeholder: "دليل الفراعنة — تطبيق سياحي يقدم...", rows: 4, dir: "rtl" },
                    { key: "content_contact_email", label: "البريد الإلكتروني للتواصل", placeholder: "hello@khetyguide.com", rows: 1, dir: "ltr" },
                  ],
                },
              ];

              return (
                <div className="p-4 space-y-4">
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <PencilLine className="w-4 h-4 text-pink-400 shrink-0" />
                    <p className="text-[11px] text-pink-300">
                      التعديلات تُحفظ تلقائياً عند الخروج من الحقل · تُخزَّن في جدول app_settings
                    </p>
                  </div>

                  {sections.map(section => {
                    const SIcon = section.icon;
                    return (
                      <div key={section.title} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
                        <div className={cn("px-4 py-3 border-b border-border/30 flex items-center gap-2", section.bg)}>
                          <SIcon className={cn("w-4 h-4", section.color)} />
                          <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                          {savingStatic && <span className="text-[10px] text-muted-foreground mr-auto">جاري الحفظ...</span>}
                        </div>
                        <div className="p-4 space-y-3">
                          {section.fields.map(field => (
                            <div key={field.key}>
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
                              <textarea
                                rows={field.rows}
                                dir={field.dir as "rtl" | "ltr"}
                                placeholder={field.placeholder}
                                value={staticDraft[field.key] ?? (appSettings[field.key] || "")}
                                onChange={e => setStaticDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                                onBlur={() => saveStatic(field.key, staticDraft[field.key] ?? (appSettings[field.key] || ""))}
                                className="mt-1.5 w-full rounded-xl bg-background border border-border/50 text-sm text-foreground p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-muted/30 rounded-2xl border border-border/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground">كيفية الاستخدام</p>
                    </div>
                    <ul className="text-[11px] text-muted-foreground/70 space-y-1 list-disc list-inside">
                      <li>اقرأ هذه البيانات في صفحات التطبيق عبر useAppSettings hook</li>
                      <li>مثال: settings['content_safety_tip_1'] في صفحة السلامة</li>
                      <li>أضف المفاتيح الجديدة في supabase_app_settings.sql</li>
                    </ul>
                  </div>
                </div>
              );
            })()}

            {tab === "invitations" && (() => {
              const topInviters = (() => {
                const byInviter: Record<string, { name: string; count: number; points: number }> = {};
                invRows.forEach(r => {
                  if (!r.inviter) return;
                  if (!byInviter[r.inviter]) byInviter[r.inviter] = { name: r.inviter, count: 0, points: r.inviter_points };
                  byInviter[r.inviter].count++;
                });
                return Object.values(byInviter).sort((a, b) => b.count - a.count).slice(0, 5);
              })();

              return (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-rose-400" />
                      نظام الدعوات
                      <span className="text-[10px] text-muted-foreground font-normal">({invRows.length} دعوة)</span>
                    </h3>
                    <button onClick={() => { setInvLoaded(false); loadInvitations(); }}
                      className="w-7 h-7 rounded-xl bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Top inviters */}
                  {topInviters.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">أكثر الداعين</p>
                      <div className="space-y-2">
                        {topInviters.map((u, i) => (
                          <div key={u.name + i} className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-muted-foreground/60 w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">{u.count} دعوة</span>
                              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">{u.points} نقطة</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  {invLoading ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                  ) : invRows.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                      <Gift className="w-8 h-8 text-rose-400/40" />
                      <p className="text-sm text-muted-foreground">لا توجد دعوات بعد</p>
                      <p className="text-[10px] text-muted-foreground/60 text-center max-w-[220px]">
                        شغّل supabase_invitations.sql في Supabase SQL Editor أولاً
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invRows.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/40">
                          <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                            <Gift className="w-3.5 h-3.5 text-rose-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">
                              <span className="text-primary">{r.inviter}</span>
                              <span className="text-muted-foreground mx-1">دعا</span>
                              <span>{r.invitee}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">+50</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {tab === "vip_codes" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-black text-foreground">كودات الترحيب الخاص (VIP)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({vipCodes.length} كود)</span>
                  </div>
                  <button onClick={() => { setVipLoaded(false); loadVipCodes(); }}
                    className="text-[11px] text-primary font-semibold px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                    تحديث
                  </button>
                </div>

                {/* Create form */}
                <div className="bg-card rounded-2xl border border-yellow-400/20 p-4 space-y-3">
                  <p className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" /> إنشاء كود VIP جديد
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">الكود</label>
                      <input
                        value={vipForm.code}
                        onChange={e => setVipForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="مثال: VIP2024"
                        maxLength={30}
                        className="w-full h-9 px-3 rounded-xl bg-background border border-border/60 text-sm font-mono tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">الرمز الفرعوني</label>
                      <input
                        value={vipForm.welcome_glyph}
                        onChange={e => setVipForm(f => ({ ...f, welcome_glyph: e.target.value }))}
                        placeholder="𓇳"
                        className="w-full h-9 px-3 rounded-xl bg-background border border-border/60 text-xl text-center text-foreground focus:outline-none focus:border-yellow-400/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">عنوان الترحيب</label>
                    <input
                      value={vipForm.welcome_title}
                      onChange={e => setVipForm(f => ({ ...f, welcome_title: e.target.value }))}
                      placeholder="أهلاً بك في مجتمعنا"
                      className="w-full h-9 px-3 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/40"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">رسالة الترحيب</label>
                    <textarea
                      value={vipForm.welcome_msg}
                      onChange={e => setVipForm(f => ({ ...f, welcome_msg: e.target.value }))}
                      rows={2}
                      placeholder="يسعدنا انضمامك إلى عائلة دليل الفراعنة"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/40 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">حد الاستخدام (اتركه فارغاً = غير محدود)</label>
                      <input
                        value={vipForm.max_uses}
                        onChange={e => setVipForm(f => ({ ...f, max_uses: e.target.value }))}
                        type="number"
                        placeholder="غير محدود"
                        min="1"
                        className="w-full h-9 px-3 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/40"
                      />
                    </div>
                    <button
                      onClick={createVipCode}
                      disabled={vipSaving || !vipForm.code.trim()}
                      className="mt-4 h-9 px-5 rounded-xl bg-yellow-400 text-black text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
                    >
                      {vipSaving ? "جاري..." : "إنشاء"}
                    </button>
                  </div>

                  {vipError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                      <span className="text-destructive text-xs font-semibold shrink-0">خطأ:</span>
                      <p className="text-xs text-destructive/90 break-all">{vipError}</p>
                    </div>
                  )}
                </div>

                {/* Codes list */}
                {vipLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : vipCodes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <span className="text-3xl">𓇳</span>
                    <p className="text-sm text-muted-foreground">لا توجد كودات VIP بعد</p>
                    <p className="text-[10px] text-muted-foreground/60">أنشئ كوداً أعلاه</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vipCodes.map(c => (
                      <div key={c.id} className={`rounded-2xl border p-4 space-y-2 transition-all ${c.is_active ? "border-yellow-400/25 bg-yellow-400/[0.04]" : "border-border/30 bg-card opacity-60"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-2xl leading-none shrink-0">{c.welcome_glyph}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black font-mono text-yellow-400 tracking-wider">{c.code}</span>
                                {c.is_active
                                  ? <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">نشط</span>
                                  : <span className="text-[9px] bg-muted/30 text-muted-foreground border border-border/30 px-1.5 py-0.5 rounded-full font-bold">متوقف</span>
                                }
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{c.welcome_title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-muted-foreground">
                              {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} استخدام
                            </span>
                            <button
                              onClick={() => toggleVipCode(c.id, c.is_active)}
                              className={`text-[10px] px-2 py-1 rounded-lg font-semibold transition-colors ${c.is_active ? "bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"}`}
                            >
                              {c.is_active ? "إيقاف" : "تفعيل"}
                            </button>
                            <button
                              onClick={() => deleteVipCode(c.id)}
                              className="text-[10px] px-2 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 font-semibold transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 pr-9 leading-relaxed">{c.welcome_msg}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info box */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    عند تسجيل أي شخص باستخدام كود VIP سيظهر له مودال ترحيب خاص مخصص. الكودات VIP منفصلة عن كودات الدعوة العادية.
                  </p>
                </div>
              </div>
            )}

            {/* ── CANNED REPLIES ── */}
            {tab === "canned_replies" && (
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" /> الردود السريعة
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cannedReplies.length} رد جاهز — تظهر في شات الدعم للإدمن</p>
                  </div>
                  <button onClick={() => { setCannedForm({ title: "", title_ar: "", body: "", body_ar: "", category: "general" }); setCannedEditId(null); setCannedFormOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400 text-xs font-bold hover:bg-sky-500/25 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> إضافة رد
                  </button>
                </div>

                {/* Add/Edit form */}
                <AnimatePresence>
                  {cannedFormOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="bg-card rounded-2xl border border-sky-500/20 p-4 space-y-3">
                        <h4 className="text-xs font-bold text-foreground">{cannedEditId ? "تعديل الرد" : "رد جديد"}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">العنوان (EN) *</label>
                            <Input value={cannedForm.title} onChange={e => setCannedForm(f => ({ ...f, title: e.target.value }))}
                              placeholder="Quick Reply Title" className="mt-1 h-9 rounded-xl text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">العنوان (AR)</label>
                            <Input value={cannedForm.title_ar} onChange={e => setCannedForm(f => ({ ...f, title_ar: e.target.value }))}
                              placeholder="عنوان الرد" dir="rtl" className="mt-1 h-9 rounded-xl text-xs" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">نص الرد (EN) *</label>
                          <textarea value={cannedForm.body} onChange={e => setCannedForm(f => ({ ...f, body: e.target.value }))}
                            placeholder="Reply body in English..." rows={2}
                            className="mt-1 w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-sky-400/40" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">نص الرد (AR)</label>
                          <textarea value={cannedForm.body_ar} onChange={e => setCannedForm(f => ({ ...f, body_ar: e.target.value }))}
                            placeholder="نص الرد بالعربية..." rows={2} dir="rtl"
                            className="mt-1 w-full rounded-xl bg-background border border-border/50 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-sky-400/40" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">الفئة</label>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {["general", "info", "pricing", "timing", "greeting"].map(cat => (
                              <button key={cat} onClick={() => setCannedForm(f => ({ ...f, category: cat }))}
                                className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all capitalize",
                                  cannedForm.category === cat
                                    ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                                    : "border-border/30 text-muted-foreground hover:border-border/60")}>
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" onClick={() => { setCannedFormOpen(false); setCannedEditId(null); }}>إلغاء</Button>
                          <Button size="sm" disabled={cannedSaving || !cannedForm.title.trim() || !cannedForm.body.trim()}
                            className="flex-1 rounded-xl text-xs bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30"
                            onClick={saveCannedReply}>
                            {cannedSaving ? "جاري الحفظ..." : cannedEditId ? "حفظ التعديلات" : "إضافة الرد"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* List */}
                {cannedLoading ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : cannedReplies.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm font-bold text-foreground mb-1">لا توجد ردود سريعة</p>
                    <p className="text-xs text-muted-foreground">أضف رداً جاهزاً يظهر للإدمن أثناء شات الدعم</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cannedReplies.map(r => (
                      <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-card rounded-2xl border border-border/30 p-3.5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-foreground">{r.title_ar || r.title}</p>
                            <span className="text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded-full capitalize">{r.category}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => { setCannedForm({ title: r.title, title_ar: r.title_ar || "", body: r.body, body_ar: r.body_ar || "", category: r.category }); setCannedEditId(r.id); setCannedFormOpen(true); }}
                              className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                              <Pencil className="w-3 h-3 text-blue-400" />
                            </button>
                            <button onClick={() => deleteCannedReply(r.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{r.body_ar || r.body}</p>
                        {r.title !== (r.title_ar || r.title) && (
                          <p className="text-[10px] text-muted-foreground/50 mt-1 italic">{r.title} — {r.body}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "coord_search" && (
              <div className="p-4 space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-teal-400" /> بحث بالإحداثيات
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">أدخل الإحداثيات بصيغة <span className="font-mono text-teal-400">lat, lng</span> للانتقال للموقع</p>
                </div>

                {/* Search Input */}
                <div className="flex gap-2">
                  <input
                    value={coordInput}
                    onChange={e => { setCoordInput(e.target.value); setCoordError(null); }}
                    onKeyDown={e => e.key === "Enter" && handleCoordSearch()}
                    placeholder="31.084952, 31.216691"
                    className="flex-1 bg-card border border-border/60 rounded-xl px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50"
                  />
                  <button
                    onClick={handleCoordSearch}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs font-bold hover:bg-teal-500/25 active:scale-95 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    بحث
                  </button>
                </div>

                {/* Error */}
                {coordError && (
                  <div className="flex items-center gap-2 text-[11px] text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {coordError}
                  </div>
                )}

                {/* Layer Switcher */}
                <div className="flex gap-2">
                  {([
                    { id: "osm",       label: "خريطة",    icon: Globe2,    active: "bg-blue-500/20 border-blue-500/40 text-blue-300",    idle: "bg-card border-border/40 text-muted-foreground" },
                    { id: "satellite", label: "ساتلايت",  icon: Globe,     active: "bg-teal-500/20 border-teal-500/40 text-teal-300",    idle: "bg-card border-border/40 text-muted-foreground" },
                    { id: "dark",      label: "داكن",     icon: Moon,      active: "bg-slate-500/20 border-slate-400/40 text-slate-300", idle: "bg-card border-border/40 text-muted-foreground" },
                  ] as const).map(({ id, label, icon: Icon, active, idle }) => (
                    <button
                      key={id}
                      onClick={() => setCoordMapStyle(id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all",
                        coordMapStyle === id ? active : idle
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>

                {/* Map (normal) */}
                <div className="rounded-2xl overflow-hidden border border-border/50 relative" style={{ height: 360 }}>
                  <MapContainer
                    center={coordCenter}
                    zoom={coordZoom}
                    maxZoom={20}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl
                  >
                    {coordMapStyle === "osm" && <TileLayer key="osm" attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={20} />}
                    {coordMapStyle === "satellite" && <>
                      <TileLayer key="satellite" attribution="&copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={19} maxZoom={20} />
                      <TileLayer key="satellite-labels" url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={19} maxZoom={20} opacity={1} />
                    </>}
                    {coordMapStyle === "dark" && <TileLayer key="dark" attribution="&copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxNativeZoom={20} maxZoom={20} />}
                    <CoordFlyTo center={coordCenter} zoom={coordZoom} />
                    {coordMarker && (
                      <Marker position={coordMarker} icon={coordMarkerIcon}>
                        <Popup>
                          <div className="text-center space-y-1 py-1">
                            <p className="font-mono text-xs font-bold">{coordMarker[0].toFixed(6)}</p>
                            <p className="font-mono text-xs font-bold">{coordMarker[1].toFixed(6)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  {/* Fullscreen button */}
                  <button
                    onClick={() => setCoordFullscreen(true)}
                    className="absolute top-2 right-2 z-[500] w-8 h-8 rounded-lg bg-card/90 backdrop-blur border border-border/60 flex items-center justify-center hover:bg-card transition-colors shadow"
                    title="شاشة كاملة"
                  >
                    <Maximize2 className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Fullscreen overlay */}
                <AnimatePresence>
                  {coordFullscreen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[9999] bg-background flex flex-col"
                    >
                      {/* Overlay header */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-card/80 backdrop-blur border-b border-border/50 shrink-0">
                        <div className="flex gap-2 flex-1">
                          <input
                            value={coordInput}
                            onChange={e => { setCoordInput(e.target.value); setCoordError(null); }}
                            onKeyDown={e => e.key === "Enter" && handleCoordSearch()}
                            placeholder="31.084952, 31.216691"
                            className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                          />
                          <button
                            onClick={handleCoordSearch}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs font-bold hover:bg-teal-500/25 transition-all"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Layer switcher */}
                        <div className="flex gap-1.5">
                          {([
                            { id: "osm",       icon: Globe2, label: "خريطة" },
                            { id: "satellite", icon: Globe,  label: "ساتلايت" },
                            { id: "dark",      icon: Moon,   label: "داكن" },
                          ] as const).map(({ id, icon: Icon, label }) => (
                            <button
                              key={id}
                              onClick={() => setCoordMapStyle(id)}
                              title={label}
                              className={cn(
                                "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                                coordMapStyle === id
                                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                                  : "bg-card border-border/40 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                        {/* Close */}
                        <button
                          onClick={() => setCoordFullscreen(false)}
                          className="w-8 h-8 rounded-lg bg-card border border-border/40 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
                          title="إغلاق"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Full map */}
                      <div className="flex-1 relative">
                        <MapContainer
                          center={coordCenter}
                          zoom={coordZoom}
                          maxZoom={20}
                          style={{ height: "100%", width: "100%" }}
                          zoomControl
                        >
                          {coordMapStyle === "osm" && <TileLayer key="osm-fs" attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={20} />}
                          {coordMapStyle === "satellite" && <>
                            <TileLayer key="satellite-fs" attribution="&copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={19} maxZoom={20} />
                            <TileLayer key="satellite-labels-fs" url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={19} maxZoom={20} opacity={1} />
                          </>}
                          {coordMapStyle === "dark" && <TileLayer key="dark-fs" attribution="&copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxNativeZoom={20} maxZoom={20} />}
                          <CoordFlyTo center={coordCenter} zoom={coordZoom} />
                          {coordMarker && (
                            <Marker position={coordMarker} icon={coordMarkerIcon}>
                              <Popup>
                                <div className="text-center space-y-1 py-1">
                                  <p className="font-mono text-xs font-bold">{coordMarker[0].toFixed(6)}</p>
                                  <p className="font-mono text-xs font-bold">{coordMarker[1].toFixed(6)}</p>
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                        {/* Coordinates badge */}
                        {coordMarker && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 bg-card/90 backdrop-blur border border-border/60 rounded-2xl px-4 py-2 shadow-xl">
                            <span className="font-mono text-xs text-teal-300">{coordMarker[0].toFixed(6)}, {coordMarker[1].toFixed(6)}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(`${coordMarker[0].toFixed(6)}, ${coordMarker[1].toFixed(6)}`)}
                              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" /> نسخ
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Copy / Info row */}
                {coordMarker && (
                  <div className="flex items-center justify-between bg-teal-500/8 border border-teal-500/20 rounded-xl px-4 py-2.5">
                    <span className="font-mono text-xs text-teal-300">
                      {coordMarker[0].toFixed(6)}, {coordMarker[1].toFixed(6)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${coordMarker[0].toFixed(6)}, ${coordMarker[1].toFixed(6)}`)}
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> نسخ
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "banners" && (() => {
              const BannerPreview = ({ b }: { b: Omit<Banner, "id" | "created_at"> | Banner }) => (
                <div
                  className="relative h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0"
                  style={{ background: `linear-gradient(135deg, ${b.bg_from}, ${b.bg_to})` }}
                >
                  {b.image_url && (
                    <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: b.accent }}>Khety Guide</p>
                    <p className="text-xs font-display font-black text-white truncate">{b.title_ar || b.title || "عنوان البانر"}</p>
                    {(b.subtitle_ar || b.subtitle) && (
                      <p className="text-[9px] text-white/60 truncate">{b.subtitle_ar || b.subtitle}</p>
                    )}
                  </div>
                </div>
              );

              return (
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                      البانرات الترويجية
                      <span className="text-[10px] text-muted-foreground font-normal">({banners.length} بانر)</span>
                    </h3>
                    <Button size="sm"
                      className="h-8 px-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-bold"
                      onClick={() => { setBannerForm(EMPTY_BANNER); setEditingBannerId(null); setBannerFormOpen(true); }}>
                      <Plus className="w-3 h-3 mr-1" /> إضافة
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <p className="text-[10px] text-amber-300">
                      تظهر البانرات في الصفحة الرئيسية للمستخدمين مع انتقال تلقائي كل 4.5 ثانية
                    </p>
                  </div>

                  {/* Banner List */}
                  {banners.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Megaphone className="w-7 h-7 text-amber-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">لا توجد بانرات بعد</p>
                      <p className="text-[11px] text-muted-foreground/50 text-center max-w-[220px]">
                        شغّل supabase_banners.sql في Supabase SQL Editor أولاً ثم أضف بانراتك
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {banners.map((b, i) => (
                        <div key={b.id}
                          className={cn("bg-card rounded-2xl border overflow-hidden",
                            b.is_active ? "border-amber-500/30" : "border-border/40 opacity-60")}>
                          <BannerPreview b={b} />
                          <div className="p-3 flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{b.title_ar || b.title || "بدون عنوان"}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                  b.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/30 text-muted-foreground")}>
                                  {b.is_active ? "نشط" : "معطّل"}
                                </span>
                                {b.link_url && <span className="text-[9px] text-primary">🔗 رابط</span>}
                                {b.image_url && <span className="text-[9px] text-blue-400">🖼 صورة</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Reorder */}
                              <button onClick={() => moveBanner(b.id, "up")} disabled={i === 0}
                                className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center disabled:opacity-30 hover:bg-muted/60 transition-colors">
                                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => moveBanner(b.id, "down")} disabled={i === banners.length - 1}
                                className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center disabled:opacity-30 hover:bg-muted/60 transition-colors">
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              {/* Toggle */}
                              <button onClick={() => toggleBanner(b.id, b.is_active)}
                                className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors">
                                {b.is_active
                                  ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                                  : <ToggleLeft  className="w-4 h-4 text-muted-foreground" />}
                              </button>
                              {/* Edit */}
                              <button onClick={() => {
                                setBannerForm({ ...b });
                                setEditingBannerId(b.id);
                                setBannerFormOpen(true);
                              }} className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              {/* Delete */}
                              <button onClick={() => { setDeleteType("banner"); setDeleteConfirm(b.id); }}
                                className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          </>
        )}
      </div>

      {/* ── BANNER FORM SHEET ── */}
      <AnimatePresence>
        {bannerFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4"
            onClick={() => setBannerFormOpen(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border/60 rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {editingBannerId ? "تعديل البانر" : "إضافة بانر جديد"}
                </h3>
                <button onClick={() => setBannerFormOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Live Preview */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">معاينة مباشرة</p>
                {(() => {
                  const BannerPreview = ({ b }: { b: Omit<Banner, "id" | "created_at"> }) => (
                    <div className="relative h-24 rounded-2xl overflow-hidden border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${b.bg_from}, ${b.bg_to})` }}>
                      {b.image_url && (
                        <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: b.accent }}>Khety Guide</p>
                        <p className="text-sm font-display font-black text-white truncate">{b.title_ar || b.title || "عنوان البانر"}</p>
                        {(b.subtitle_ar || b.subtitle) && (
                          <p className="text-[10px] text-white/60 truncate">{b.subtitle_ar || b.subtitle}</p>
                        )}
                      </div>
                    </div>
                  );
                  return <BannerPreview b={bannerForm} />;
                })()}
              </div>

              {/* Fields */}
              {[
                { key: "title_ar",    label: "العنوان (عربي)",    dir: "rtl", placeholder: "اكتشف مصر الفرعونية" },
                { key: "title",       label: "العنوان (English)",  dir: "ltr", placeholder: "Discover Ancient Egypt" },
                { key: "subtitle_ar", label: "النص الفرعي (عربي)", dir: "rtl", placeholder: "استكشف 12 معلماً تاريخياً" },
                { key: "subtitle",    label: "النص الفرعي (English)", dir: "ltr", placeholder: "Explore 12 iconic landmarks" },
                { key: "link_url",    label: "الرابط عند الضغط",   dir: "ltr", placeholder: "https:// أو /explore" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</label>
                  <Input
                    dir={f.dir as "rtl" | "ltr"}
                    placeholder={f.placeholder}
                    value={(bannerForm as any)[f.key] || ""}
                    onChange={e => setBannerForm(prev => ({ ...prev, [f.key]: e.target.value || null }))}
                    className="mt-1 h-9 rounded-xl text-sm"
                  />
                </div>
              ))}

              {/* Image Upload */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">صورة الخلفية</label>
                <input
                  ref={bannerImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadBannerImage(f); }}
                />
                <div className="mt-1 flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => bannerImageRef.current?.click()}
                    disabled={bannerUploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50">
                    {bannerUploading
                      ? <><div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> جاري الرفع...</>
                      : <><Upload className="w-3.5 h-3.5" /> اختر صورة</>}
                  </button>
                  {bannerForm.image_url && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <img src={bannerForm.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-border/40 shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate">تم الرفع</span>
                      <button
                        type="button"
                        onClick={() => { setBannerForm(prev => ({ ...prev, image_url: null })); if (bannerImageRef.current) bannerImageRef.current.value = ""; }}
                        className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "bg_from", label: "لون البداية" },
                  { key: "bg_to",   label: "لون النهاية" },
                  { key: "accent",  label: "لون التمييز" },
                ].map(c => (
                  <div key={c.key} className="flex flex-col items-center gap-1.5">
                    <label className="text-[9px] font-semibold text-muted-foreground text-center">{c.label}</label>
                    <div className="relative w-10 h-10">
                      <div className="w-10 h-10 rounded-xl border border-border/50 overflow-hidden">
                        <input
                          type="color"
                          value={(bannerForm as any)[c.key] || "#000000"}
                          onChange={e => setBannerForm(prev => ({ ...prev, [c.key]: e.target.value }))}
                          className="w-14 h-14 -m-1 cursor-pointer"
                        />
                      </div>
                    </div>
                    <span className="text-[8px] text-muted-foreground font-mono">{(bannerForm as any)[c.key]}</span>
                  </div>
                ))}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-muted/20 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-foreground">نشط</span>
                <button onClick={() => setBannerForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className="transition-colors">
                  {bannerForm.is_active
                    ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                    : <ToggleLeft  className="w-6 h-6 text-muted-foreground" />}
                </button>
              </div>

              {/* Save */}
              <Button onClick={saveBanner} disabled={savingBanner}
                className="w-full h-11 rounded-2xl font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30">
                {savingBanner ? "جاري الحفظ..." : editingBannerId ? "حفظ التعديلات" : "إضافة البانر"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4"
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="bg-card w-full max-w-sm rounded-2xl p-5 border border-border/60 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    حذف {deleteType === "landmark" ? "المعلم" : deleteType === "user" ? "المستخدم" : deleteType === "welcome_media" ? "الوسائط" : deleteType === "banner" ? "البانر" : "المحادثة"}؟
                  </p>
                  <p className="text-xs text-muted-foreground">لا يمكن التراجع عن هذا الإجراء.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
                <Button variant="destructive" size="sm" className="flex-1 rounded-xl" onClick={() => {
                  if (deleteType === "landmark") deleteLandmark(deleteConfirm);
                  else if (deleteType === "user") deleteUser(deleteConfirm);
                  else if (deleteType === "welcome_media") deleteWelcomeMedia(deleteConfirm);
                  else if (deleteType === "banner") deleteBanner(deleteConfirm);
                  else deleteConversation(deleteConfirm);
                }}>حذف</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LANDMARK EDIT DRAWER ── */}
      <AnimatePresence>
        {editingLandmark && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full bg-card rounded-t-3xl border-t border-border/40 shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "92dvh" }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{isNewLandmark ? "Add Landmark" : "Edit Landmark"}</h3>
                </div>
                <button onClick={() => setEditingLandmark(null)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Published</p>
                    <p className="text-[10px] text-muted-foreground">Visible to app users</p>
                  </div>
                  <button onClick={() => setEditingLandmark(prev => ({ ...prev!, is_published: !prev!.is_published }))}
                    className={cn("w-11 h-6 rounded-full transition-colors relative", editingLandmark.is_published ? "bg-emerald-500" : "bg-muted")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                      editingLandmark.is_published ? "left-[calc(100%-21px)]" : "left-0.5")} />
                  </button>
                </div>

                {[
                  { label: "Name (English) *", key: "name", placeholder: "e.g. Luxor Temple" },
                  { label: "Name (Arabic)", key: "name_ar", placeholder: "مثال: معبد الأقصر" },
                  { label: "City *", key: "city", placeholder: "e.g. Luxor" },
                  { label: "Region", key: "region", placeholder: "e.g. Upper Egypt" },
                  { label: "Ticket Price", key: "ticket_price", placeholder: "e.g. 100 EGP or Free" },
                  { label: "Opening Hours", key: "opening_hours", placeholder: "e.g. 6:00 AM - 10:00 PM" },
                  { label: "Historical Period", key: "historical_period", placeholder: "e.g. New Kingdom" },
                  { label: "Image URL", key: "image_url", placeholder: "https://..." },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
                    <Input value={(editingLandmark as any)[key] || ""} onChange={e => setEditingLandmark(prev => ({ ...prev!, [key]: e.target.value }))}
                      placeholder={placeholder} className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm" />
                  </div>
                ))}

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rating (1-5)</label>
                  <Input type="number" min="1" max="5" step="0.1" value={editingLandmark.rating || 4.5}
                    onChange={e => setEditingLandmark(prev => ({ ...prev!, rating: parseFloat(e.target.value) }))}
                    className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Latitude</label>
                    <Input type="number" step="0.0001" value={editingLandmark.latitude || 30.0444}
                      onChange={e => setEditingLandmark(prev => ({ ...prev!, latitude: parseFloat(e.target.value) }))}
                      className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Longitude</label>
                    <Input type="number" step="0.0001" value={editingLandmark.longitude || 31.2357}
                      onChange={e => setEditingLandmark(prev => ({ ...prev!, longitude: parseFloat(e.target.value) }))}
                      className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm" />
                  </div>
                </div>

                {/* Gallery */}
                {!isNewLandmark && editingLandmark.id && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-sky-400" /> ألبوم الصور ({landmarkImages.length})
                      </label>
                      <div className="flex items-center gap-1.5">
                        {galleryLandmarkId !== editingLandmark.id && (
                          <button onClick={() => loadLandmarkImages(editingLandmark.id!)}
                            className="text-[10px] text-sky-400 font-semibold hover:underline">تحميل الألبوم</button>
                        )}
                        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f && editingLandmark.id) uploadGalleryImage(f, editingLandmark.id!); }} />
                        <button onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-500/25 text-sky-400 text-[10px] font-bold hover:bg-sky-500/25 transition-colors disabled:opacity-50">
                          {galleryUploading ? <><div className="w-3 h-3 border border-sky-400 border-t-transparent rounded-full animate-spin" /> رفع...</> : <><Upload className="w-3 h-3" /> رفع صورة</>}
                        </button>
                      </div>
                    </div>
                    {galleryLandmarkId === editingLandmark.id && landmarkImages.length === 0 && (
                      <p className="text-[11px] text-muted-foreground text-center py-4 bg-muted/20 rounded-xl border border-border/30">لا توجد صور في الألبوم — ارفع صورة لتبدأ</p>
                    )}
                    {galleryLandmarkId === editingLandmark.id && landmarkImages.length > 0 && (
                      <div className="space-y-2">
                        {/* Preview strip */}
                        <div className="flex gap-1.5 overflow-x-auto py-1">
                          {landmarkImages.map((img, i) => (
                            <div key={img.id} onClick={() => setGalleryActiveIdx(i)}
                              className={cn("relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                                galleryActiveIdx === i ? "border-sky-400 scale-105" : "border-transparent hover:border-white/30")}>
                              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        {/* Active image controls */}
                        {landmarkImages[galleryActiveIdx] && (
                          <div className="bg-muted/30 rounded-xl p-2.5 flex items-center gap-2">
                            <img src={landmarkImages[galleryActiveIdx].image_url} alt=""
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border/40" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground truncate">{landmarkImages[galleryActiveIdx].image_url.split("/").pop()}</p>
                              <p className="text-[9px] text-muted-foreground/60">صورة {galleryActiveIdx + 1} من {landmarkImages.length}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => moveGalleryImage(landmarkImages[galleryActiveIdx].id, "up")} disabled={galleryActiveIdx === 0}
                                className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center disabled:opacity-30 hover:bg-muted/80">
                                <ChevronUp className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <button onClick={() => moveGalleryImage(landmarkImages[galleryActiveIdx].id, "down")} disabled={galleryActiveIdx === landmarkImages.length - 1}
                                className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center disabled:opacity-30 hover:bg-muted/80">
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <button onClick={() => deleteGalleryImage(landmarkImages[galleryActiveIdx].id)}
                                className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center hover:bg-red-500/25">
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setEditingLandmark(prev => ({ ...prev!, category: cat }))}
                        className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize",
                          editingLandmark.category === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border/50 text-muted-foreground hover:border-primary/40")}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                  <textarea value={editingLandmark.description || ""}
                    onChange={e => setEditingLandmark(prev => ({ ...prev!, description: e.target.value }))}
                    placeholder="Describe this landmark..." rows={3}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tips (one per line)
                  </label>
                  <textarea value={Array.isArray(editingLandmark.tips) ? editingLandmark.tips.join("\n") : editingLandmark.tips || ""}
                    onChange={e => setEditingLandmark(prev => ({ ...prev!, tips: e.target.value.split("\n") }))}
                    placeholder="Tip 1&#10;Tip 2" rows={3}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Highlights (one per line)
                  </label>
                  <textarea value={Array.isArray(editingLandmark.highlights) ? editingLandmark.highlights.join("\n") : editingLandmark.highlights || ""}
                    onChange={e => setEditingLandmark(prev => ({ ...prev!, highlights: e.target.value.split("\n") }))}
                    placeholder="Highlight 1&#10;Highlight 2" rows={3}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
                  <Input value={Array.isArray(editingLandmark.tags) ? editingLandmark.tags.join(", ") : editingLandmark.tags || ""}
                    onChange={e => setEditingLandmark(prev => ({ ...prev!, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
                    placeholder="ancient, must-visit, ..."
                    className="mt-1.5 h-10 rounded-xl bg-background border-border/50 text-sm" />
                </div>
              </div>

              <div className="px-5 py-4 border-t border-border/40 shrink-0 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingLandmark(null)}>Cancel</Button>
                <Button className="flex-1 rounded-xl gap-1.5 font-semibold" onClick={saveLandmark} disabled={saving || !editingLandmark?.name}>
                  {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {isNewLandmark ? "Create" : "Save"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
