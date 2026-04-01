import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Grid3x3, ChevronRight, ImageOff } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OfficialBadge } from "@/components/OfficialBadge";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "@/components/PostCard";
import type { CommunityPost } from "@/hooks/useCommunityPosts";

interface PublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_official: boolean;
}

function normaliseImages(row: any): string[] {
  if (Array.isArray(row.image_urls) && row.image_urls.length > 0) return row.image_urls;
  if (row.image_url) return [row.image_url];
  return [];
}

export default function UserPublicProfile() {
  const [, params] = useRoute("/user/:userId");
  const [, navigate] = useLocation();
  const { i18n } = useTranslation("t");
  const isRtl = i18n.language === "ar";
  const { user } = useAuth();

  const userId = params?.userId ?? "";

  const [profile, setProfile]   = useState<PublicProfile | null>(null);
  const [posts, setPosts]       = useState<CommunityPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [likedSet, setLikedSet] = useState(new Set<string>());

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, is_verified, is_official")
        .eq("id", userId)
        .single();
      setProfile(profileData ?? null);

      // Fetch this user's posts
      const { data: rawPosts } = await supabase
        .from("community_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      const rows = rawPosts || [];

      // Landmark names
      const landmarkIds = [...new Set(rows.map((p: any) => p.landmark_id).filter(Boolean))] as string[];
      let landmarkMap: Record<string, { name: string; name_ar: string | null }> = {};
      if (landmarkIds.length > 0) {
        const { data: landmarks } = await supabase
          .from("landmarks").select("id, name, name_ar").in("id", landmarkIds);
        landmarkMap = Object.fromEntries((landmarks || []).map((l: any) => [l.id, l]));
      }

      // Current user's likes
      let liked = new Set<string>();
      if (user?.id) {
        const { data: likes } = await supabase
          .from("community_likes").select("post_id")
          .eq("user_id", user.id).in("post_id", rows.map((p: any) => p.id));
        liked = new Set((likes || []).map((l: any) => l.post_id));
      }
      setLikedSet(liked);

      const merged: CommunityPost[] = rows.map((p: any) => ({
        ...p,
        image_urls:      normaliseImages(p),
        author_name:     profileData?.display_name ?? p.author_name ?? null,
        author_avatar:   profileData?.avatar_url   ?? p.author_avatar ?? null,
        author_verified: Boolean(profileData?.is_verified ?? p.author_verified ?? false),
        profile: profileData ? {
          display_name: profileData.display_name,
          avatar_url:   profileData.avatar_url,
          is_verified:  profileData.is_verified,
          is_official:  profileData.is_official,
        } : null,
        landmark:       p.landmark_id ? (landmarkMap[p.landmark_id] ?? null) : null,
        liked_by_me:    liked.has(p.id),
        comments_count: 0,
      }));
      setPosts(merged);
      setLoading(false);
    })();
  }, [userId, user?.id]);

  async function toggleLike(postId: string) {
    if (!user?.id) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
    await supabase.rpc("toggle_community_like", { p_post_id: postId, p_user_id: user.id });
  }

  async function deletePost(postId: string) {
    await supabase.from("community_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const displayName = profile?.display_name || (isRtl ? "مستخدم" : "User");
  const initials    = displayName.slice(0, 2).toUpperCase();
  const isOwnProfile = user?.id === userId;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto hide-scrollbar pb-28" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/6 flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate("/community")}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center shrink-0"
        >
          {isRtl ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ArrowLeft className="w-4 h-4 text-muted-foreground" />}
        </button>
        <p className="text-sm font-bold text-foreground truncate flex-1">{displayName}</p>
      </div>

      {/* ── Profile card ───────────────────────────────── */}
      <div className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {/* Avatar */}
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={displayName}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-primary/20 shadow-xl shrink-0" />
            : <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-xl">
                <span className="text-2xl font-black text-primary">{initials}</span>
              </div>
          }

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg font-display font-black text-foreground truncate">{displayName}</h1>
              {profile?.is_verified && (
                <VerifiedBadge size={20} />
              )}
              {profile?.is_official && (
                <OfficialBadge size="md" />
              )}
            </div>
            {profile?.bio && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-base font-black text-foreground leading-none">{posts.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isRtl ? "منشور" : "Posts"}</p>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div className="text-center">
                <p className="text-base font-black text-foreground leading-none">{totalLikes}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isRtl ? "إعجاب" : "Likes"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Own profile redirect chip */}
        {isOwnProfile && (
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 border border-white/8 text-xs font-semibold text-muted-foreground hover:bg-white/8 transition-colors"
          >
            {isRtl ? "تعديل ملفك الشخصي" : "Edit your profile"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <Grid3x3 className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground/60 font-semibold">
          {isRtl ? "المنشورات" : "Posts"}
        </span>
        <div className="flex-1 h-px bg-white/6" />
      </div>

      {/* ── Loading ────────────────────────────────────── */}
      {loading && (
        <div className="px-4 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-white/3 border border-white/6 p-4 animate-pulse">
              <div className="h-40 bg-white/5 rounded-2xl mb-3" />
              <div className="h-3 w-3/4 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ──────────────────────────────────────── */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-14 h-14 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
            <ImageOff className="w-6 h-6 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">
            {isRtl ? "لا توجد منشورات" : "No posts yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOwnProfile
              ? (isRtl ? "شارك ذكرياتك الأولى!" : "Share your first memory!")
              : (isRtl ? "لم ينشر هذا المستخدم بعد" : "This user hasn't posted yet")}
          </p>
        </div>
      )}

      {/* ── Posts feed ─────────────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div className="px-4 space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={toggleLike}
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
