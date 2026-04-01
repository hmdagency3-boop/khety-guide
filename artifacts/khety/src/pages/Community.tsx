import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Users, ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { PostCard } from "@/components/PostCard";
import { CreatePostModal } from "@/components/CreatePostModal";
import { Link } from "wouter";

export default function Community() {
  const { user, profile } = useAuth();
  const { i18n } = useTranslation("t");
  const isRtl = i18n.language === "ar";

  const { posts, loading, error, fetchPosts, toggleLike, createPost, deletePost } =
    useCommunityPosts(user?.id);

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto hide-scrollbar pb-28" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Header ─────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/6">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-display font-black text-foreground leading-none">
                {isRtl ? "المجتمع" : "Community"}
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isRtl ? "ذكريات ومشاركات السياح" : "Traveller memories & posts"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────── */}
      <div className="flex-1 px-4 pt-4 space-y-3">

        {/* Not logged in */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center"
          >
            <Users className="w-8 h-8 text-primary/50 mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground mb-1">
              {isRtl ? "انضم للمجتمع" : "Join the community"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {isRtl ? "سجّل دخولك لتشارك ذكرياتك" : "Sign in to share your memories"}
            </p>
            <Link href="/login">
              <span className="inline-block px-5 py-2 rounded-xl bg-primary text-black text-xs font-bold">
                {isRtl ? "تسجيل الدخول" : "Sign In"}
              </span>
            </Link>
          </motion.div>
        )}

        {/* Loading */}
        {loading && posts.length === 0 && (
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-white/3 border border-white/6 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/8" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-white/8 rounded-full" />
                    <div className="h-2 w-16 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="h-32 bg-white/5 rounded-2xl" />
                <div className="h-3 w-full bg-white/5 rounded-full" />
                <div className="h-3 w-3/4 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <ImageOff className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">
              {isRtl ? "لا توجد مشاركات بعد" : "No posts yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRtl ? "كن أول من يشارك ذكرياته!" : "Be the first to share a memory!"}
            </p>
          </motion.div>
        )}

        {/* Posts */}
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

      {/* ── FAB: Create post ─────────────────────── */}
      {user && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-24 end-4 z-40 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center"
        >
          <Plus className="w-6 h-6 text-black" />
        </motion.button>
      )}

      {/* Create post modal */}
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(content, images, locationTag, landmarkId) =>
          createPost(content, images, locationTag, landmarkId)
        }
        userName={profile?.display_name || user?.email?.split("@")[0]}
        avatarUrl={profile?.avatar_url}
      />
    </div>
  );
}
