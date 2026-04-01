import { useState, useEffect, useCallback } from "react";
import { supabase, type Landmark } from "@/lib/supabase";

interface UseLandmarksOptions {
  search?: string;
  category?: string;
  enabled?: boolean;
}

interface UseLandmarksReturn {
  data: Landmark[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLandmarks(options: UseLandmarksOptions = {}): UseLandmarksReturn {
  const { search, category, enabled = true } = options;
  const [data, setData] = useState<Landmark[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("landmarks")
        .select("*")
        .eq("is_published", true)
        .order("rating", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(
          `name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,name_ar.ilike.%${q}%`
        );
      }

      const { data: rows, error: err } = await query;
      if (err) throw err;
      setData(rows ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load landmarks");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

interface UseLandmarkReturn {
  data: Landmark | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLandmark(id: string | null): UseLandmarkReturn {
  const [data, setData] = useState<Landmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: row, error: err } = await supabase
        .from("landmarks")
        .select("*")
        .eq("id", id)
        .single();

      if (err) throw err;
      setData(row);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load landmark");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
