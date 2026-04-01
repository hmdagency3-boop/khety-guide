import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface InviteeInfo {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface InvitationData {
  invite_code: string | null;
  invite_points: number;
  invitees: InviteeInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInvitations(): InvitationData {
  const { user } = useAuth();
  const [invite_code, setInviteCode] = useState<string | null>(null);
  const [invite_points, setInvitePoints] = useState(0);
  const [invitees, setInvitees] = useState<InviteeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("invite_code, invite_points")
      .eq("id", user.id)
      .single();

    if (pErr) { setError(pErr.message); setLoading(false); return; }

    setInviteCode(profile.invite_code);
    setInvitePoints(profile.invite_points ?? 0);

    const { data: invs, error: iErr } = await supabase
      .from("invitations")
      .select("invitee_id, created_at, profiles!invitations_invitee_id_fkey(id, display_name)")
      .eq("inviter_id", user.id)
      .order("created_at", { ascending: false });

    if (!iErr && invs) {
      setInvitees(invs.map((row: any) => ({
        id: row.invitee_id,
        display_name: row.profiles?.display_name ?? null,
        created_at: row.created_at,
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { invite_code, invite_points, invitees, loading, error, refetch: fetch };
}

export async function redeemInviteCode(code: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("redeem_invite_code", { p_code: code.trim().toUpperCase() });
  if (error) return { ok: false, error: error.message };
  if (data?.ok === false) return { ok: false, error: data.error };
  return { ok: true };
}
