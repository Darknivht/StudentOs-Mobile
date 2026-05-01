import { create } from "zustand";

interface NotesEditorState {
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;

  setDirty: (dirty: boolean) => void;
  setSaved: () => void;
  setSaving: (saving: boolean) => void;
  reset: () => void;
}

export const useNotesEditorStore = create<NotesEditorState>()((set) => ({
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  setDirty: (isDirty) => set({ isDirty }),
  setSaved: () =>
    set({ isDirty: false, lastSavedAt: new Date(), isSaving: false }),
  setSaving: (isSaving) => set({ isSaving }),
  reset: () => set({ isDirty: false, lastSavedAt: null, isSaving: false }),
}));
