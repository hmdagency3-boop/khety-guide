import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string | null;
  author_avatar: string | null;
  author_verified: boolean;
  author_official: boolean;
  created_at: string;
}

export function usePostComments(postId: string, currentUserId?: string) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(100);
    setComments(data || []);
    setLoading(false);
    setLoaded(true);
  }, [postId, loaded]);

  const addComment = useCallback(async (content: string) => {
    if (!currentUserId || !content.trim()) return;
    setSubmitting(true);
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, is_verified, is_official")
      .eq("id", currentUserId)
      .single();

    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id:         postId,
        user_id:         currentUserId,
        content:         content.trim(),
        author_name:     myProfile?.display_name    ?? null,
        author_avatar:   myProfile?.avatar_url      ?? null,
        author_verified: myProfile?.is_verified     ?? false,
        author_official: (myProfile as any)?.is_official ?? false,
      })
      .select()
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as PostComment]);
    }
    setSubmitting(false);
  }, [postId, currentUserId]);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from("community_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return { comments, loading, loaded, submitting, fetchComments, addComment, deleteComment };
}
