import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rglpanrtumanmhbqbhch.supabase.co";
const supabaseAnonKey = "sb_publishable_vqaasnq1nsDrJBLldESMsQ_et07dMQf";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Landmark {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  category: string;
  image_url: string | null;
  rating: number;
  latitude: number;
  longitude: number;
  city: string;
  region: string | null;
  opening_hours: string | null;
  ticket_price: string | null;
  historical_period: string | null;
  tags: string[];
  highlights: string[];
  tips: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  admin_role: string | null;
  country: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  landmark_id: string;
  created_at: string;
}

export interface UserVisited {
  id: string;
  user_id: string;
  landmark_id: string;
  visited_at: string;
  notes?: string | null;
}

export interface TravelProfile {
  id: string;
  user_id: string;
  trip_duration: string | null;
  visit_purpose: string | null;
  tourism_types: string[];
  preferred_cities: string[];
  budget_range: string | null;
  travelers_count: number;
  has_children: boolean;
  preferred_language: string;
  first_visit: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorFingerprint {
  id: string;
  fingerprint_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  canvas_hash: string | null;
  user_id: string | null;
  visit_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export interface WelcomeMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  duration: number;
  is_active: boolean;
  display_mode: "first_time" | "always";
  created_at: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  type: "info" | "warning" | "success" | "alert";
  target_type: "all" | "user";
  target_user_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NotificationRead {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: string;
}
