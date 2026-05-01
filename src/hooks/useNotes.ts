import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase/client";
import { useAuthStore } from "../stores/authStore";
import type { NoteItem, NoteWithCourse, SourceType } from "../types/note";

function mapNoteToItem(n: any): NoteItem {
  return {
    id: n.id,
    userId: n.user_id,
    courseId: n.course_id ?? null,
    title: n.title ?? "",
    content: n.content ?? "",
    summary: n.summary ?? null,
    sourceType: (n.source_type as SourceType) ?? "manual",
    fileUrl: n.file_url ?? null,
    originalFilename: n.original_filename ?? null,
    isPinned: n.is_pinned ?? false,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  };
}

export function useNotes() {
  const user = useAuthStore((s) => s.user);
  const [notes, setNotes] = useState<NoteWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!supabase || !user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select(
          "id, user_id, course_id, title, content, summary, source_type, file_url, original_filename, is_pinned, created_at, updated_at, courses:title (id, title, emoji, color)",
        )
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (!error && data) {
        const mapped: NoteWithCourse[] = data.map((n: any) => {
          const item = mapNoteToItem(n);
          const course = Array.isArray(n.courses) ? n.courses[0] : n.courses;
          return {
            ...item,
            courseName: course?.title ?? null,
            courseEmoji: course?.emoji ?? null,
            courseColor: course?.color ?? null,
          };
        });
        setNotes(mapped);
      } else {
        console.error("Failed to fetch notes:", error);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (params: Partial<NoteItem>): Promise<NoteItem | null> => {
      if (!supabase || !user) return null;

      const insertData: Record<string, any> = {
        user_id: user.id,
        title: params.title ?? "Untitled",
        content: params.content ?? "",
        course_id: params.courseId ?? null,
        source_type: params.sourceType ?? "manual",
        summary: params.summary ?? null,
        file_url: params.fileUrl ?? null,
        original_filename: params.originalFilename ?? null,
        is_pinned: params.isPinned ?? false,
      };

      const { data, error } = await supabase
        .from("notes")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Failed to create note:", error);
        return null;
      }

      await fetchNotes();
      return data ? mapNoteToItem(data) : null;
    },
    [user, fetchNotes],
  );

  const updateNote = useCallback(
    async (id: string, params: Partial<NoteItem>): Promise<NoteItem | null> => {
      if (!supabase || !user) return null;

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (params.title !== undefined) updateData.title = params.title;
      if (params.content !== undefined) updateData.content = params.content;
      if (params.courseId !== undefined) updateData.course_id = params.courseId;
      if (params.summary !== undefined) updateData.summary = params.summary;
      if (params.sourceType !== undefined)
        updateData.source_type = params.sourceType;
      if (params.fileUrl !== undefined) updateData.file_url = params.fileUrl;
      if (params.originalFilename !== undefined)
        updateData.original_filename = params.originalFilename;
      if (params.isPinned !== undefined) updateData.is_pinned = params.isPinned;

      const { data, error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update note:", error);
        return null;
      }

      await fetchNotes();
      return data ? mapNoteToItem(data) : null;
    },
    [user, fetchNotes],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      if (!supabase || !user) return;

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to delete note:", error);
      } else {
        await fetchNotes();
      }
    },
    [user, fetchNotes],
  );

  const togglePin = useCallback(
    async (id: string, isPinned: boolean): Promise<void> => {
      await updateNote(id, { isPinned });
    },
    [updateNote],
  );

  return {
    notes,
    isLoading,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}
