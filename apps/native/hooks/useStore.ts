import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import { useSubscription } from "./useSubscription";

export interface Resource {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  author: string;
  subject: string;
  grade: string;
  category: string;
  resource_type: string;
  download_url: string;
  download_count: number;
  tier_required: "free" | "plus" | "pro";
  created_at: string;
}

export function useStore() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);

  const canAccess = useCallback((resource: Resource) => {
    if (resource.tier_required === "free") return true;
    if (resource.tier_required === "plus" && (subscription.isPlus || subscription.isPro)) return true;
    if (resource.tier_required === "pro" && subscription.isPro) return true;
    return false;
  }, [subscription.isPlus, subscription.isPro]);

  const fetchResources = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from("educational_resources")
      .select("*")
      .order("download_count", { ascending: false });

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }
    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }
    if (subjectFilter) {
      query = query.eq("subject", subjectFilter);
    }
    if (gradeFilter) {
      query = query.eq("grade", gradeFilter);
    }

    const { data } = await query;
    if (data) {
      setResources(data as Resource[]);
    }
    setLoading(false);
  }, [user, searchQuery, categoryFilter, subjectFilter, gradeFilter]);

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user, fetchResources]);

  const downloadResource = useCallback(async (resource: Resource) => {
    if (!user || !canAccess(resource)) return null;

    const { error } = await supabase
      .from("resource_downloads")
      .insert({
        user_id: user.id,
        resource_id: resource.id,
      });

    if (!error) {
      await supabase
        .from("educational_resources")
        .update({ download_count: resource.download_count + 1 })
        .eq("id", resource.id);

      fetchResources();
    }

    return error;
  }, [user, canAccess, fetchResources]);

  return {
    resources,
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    subjectFilter,
    setSubjectFilter,
    gradeFilter,
    setGradeFilter,
    canAccess,
    downloadResource,
    fetchResources,
  };
}