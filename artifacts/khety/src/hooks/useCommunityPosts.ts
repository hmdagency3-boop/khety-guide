import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;       // legacy single image
  image_urls: string[];            // new multi-image array
  landmark_id: string | null;
  location_tag: string | null;
  likes_count: number;
  created_at: string;
  author_name: string | null;     // denormalised snapshot at post time
  author_avatar: string | null;   // denormalised snapshot at post time
  author_verified: boolean;       // denormalised snapshot at post time
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
    is_official?: boolean;
  } | null;
  landmark: {
    name: string;
    name_ar?: string | null;
  } | null;
  liked_by_me?: boolean;
  comments_count: number;
}

function isTableMissingError(err: any): boolean {
  return (
    err?.message?.includes("does not exist") ||
    err?.message?.includes("schema cache") ||
    err?.code === "42P01" ||
    err?.code === "PGRST200"
  );
}

/** Normalise: always return a flat array of image URLs from a raw DB row */
function normaliseImages(row: any): string[] {
  if (Array.isArray(row.image_urls) && row.image_urls.length > 0) return row.image_urls;
  if (row.image_url) return [row.image_url];
  return [];
}

export function useCommunityPosts(currentUserId?: string) {
  const [posts, setPosts]     = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Raw posts  (select * so it works before & after the image_urls migration)
      const { data: rawPosts, error: postsErr } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (postsErr) {
        if (isTableMissingError(postsErr)) { setPosts([]); return; }
        throw postsErr;
      }

      const rows = rawPosts || [];
      if (rows.length === 0) { setPosts([]); return; }

      // 2. Profiles (include is_verified)
      const userIds = [...new Set(rows.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      // 3. Landmarks
      const landmarkIds = [...new Set(rows.map((p) => p.landmark_id).filter(Boolean))] as string[];
      let landmarkMap: Record<string, { name: string; name_ar: string | null }> = {};
      if (landmarkIds.length > 0) {
        const { data: landmarks } = await supabase
          .from("landmarks").select("id, name, name_ar").in("id", landmarkIds);
        landmarkMap = Object.fromEntries((landmarks || []).map((l) => [l.id, l]));
      }

      // 4. Liked set
      let likedSet = new Set<string>();
      if (currentUserId) {
        const { data: likes } = await supabase
          .from("community_likes").select("post_id")
          .eq("user_id", currentUserId).in("post_id", rows.map((p) => p.id));
        likedSet = new Set((likes || []).map((l: any) => l.post_id));
      }

      // 5. Comment counts (graceful — table may not exist yet)
      const commentCountMap: Record<string, number> = {};
      try {
        const postIds = rows.map((p) => p.id);
        const { data: commentRows } = await supabase
          .from("community_comments")
          .select("post_id")
          .in("post_id", postIds);
        (commentRows || []).forEach((r: any) => {
          commentCountMap[r.post_id] = (commentCountMap[r.post_id] ?? 0) + 1;
        });
      } catch (_) {}

      // 6. Merge — prefer denormalised author fields, fall back to profileMap
      const merged: CommunityPost[] = rows.map((p) => {
        const fromProfiles   = profileMap[p.user_id] ?? null;
        const resolvedName     = p.author_name     ?? fromProfiles?.display_name ?? null;
        const resolvedAvatar   = p.author_avatar   ?? fromProfiles?.avatar_url   ?? null;
        const resolvedVerified = fromProfiles?.is_verified ?? p.author_verified   ?? false;
        const resolvedOfficial = fromProfiles?.is_official ?? false;
        return {
          ...p,
          image_urls:      normaliseImages(p),
          author_name:     resolvedName,
          author_avatar:   resolvedAvatar,
          author_verified: Boolean(resolvedVerified),
          profile: {
            display_name: resolvedName,
            avatar_url:   resolvedAvatar,
            is_verified:  Boolean(resolvedVerified),
            is_official:  Boolean(resolvedOfficial),
          },
          landmark:       p.landmark_id ? (landmarkMap[p.landmark_id] ?? null) : null,
          liked_by_me:    likedSet.has(p.id),
          comments_count: commentCountMap[p.id] ?? 0,
        };
      });

      /* Official platform posts first, then newest first */
      merged.sort((a, b) => {
        const aOff = a.profile?.is_official ? 1 : 0;
        const bOff = b.profile?.is_official ? 1 : 0;
        if (bOff !== aOff) return bOff - aOff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setPosts(merged);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
    await supabase.rpc("toggle_community_like", { p_post_id: postId, p_user_id: currentUserId });
  }, [currentUserId]);

  const createPost = useCallback(
    async (content: string, imageFiles: File[], locationTag: string, landmarkId?: string | null) => {
      if (!currentUserId) throw new Error("Not authenticated");

      // Snapshot author info so the post always shows name/avatar/verified regardless of RLS
      const { data: myProfile } = await supabase
        .from("profiles").select("display_name, avatar_url, is_verified").eq("id", currentUserId).single();

      // Upload all images
      const image_urls: string[] = [];
      for (const file of imageFiles) {
        const ext  = file.name.split(".").pop();
        const path = `${currentUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("community-posts").upload(path, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("community-posts").getPublicUrl(path);
        image_urls.push(urlData.publicUrl);
      }

      const { error: insertErr } = await supabase.from("community_posts").insert({
        user_id:       currentUserId,
        content:       content.trim(),
        image_url:     image_urls[0] ?? null,
        image_urls,
        location_tag:  locationTag.trim() || null,
        landmark_id:   landmarkId ?? null,
        author_name:     myProfile?.display_name ?? null,
        author_avatar:   myProfile?.avatar_url   ?? null,
        author_verified: myProfile?.is_verified  ?? false,
      });

      if (insertErr) throw insertErr;
      await fetchPosts();
    },
    [currentUserId, fetchPosts]
  );

  const deletePost = useCallback(async (postId: string) => {
    await supabase.from("community_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return { posts, loading, error, fetchPosts, toggleLike, createPost, deletePost };
}
