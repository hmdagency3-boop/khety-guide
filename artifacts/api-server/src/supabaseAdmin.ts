import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rglpanrtumanmhbqbhch.supabase.co";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_vqaasnq1nsDrJBLldESMsQ_et07dMQf";

if (!SUPABASE_SERVICE_KEY) {
  console.warn(
    "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Falling back to anon key — RLS policies must allow server writes, " +
      "or set SUPABASE_SERVICE_ROLE_KEY to bypass RLS."
  );
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY
    ? {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    : undefined
);
