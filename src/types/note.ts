export type SourceType = "manual" | "pdf" | "docx" | "image";

export interface NoteItem {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  content: string;
  summary: string | null;
  sourceType: SourceType;
  fileUrl: string | null;
  originalFilename: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithCourse extends NoteItem {
  courseName: string | null;
  courseEmoji: string | null;
  courseColor: string | null;
}
