import { create } from "zustand";

export const useNotesState = create((set) => ({
  notes: [],
  currentNoteTitle: "",
  currentNoteContent: {},
  currentNotePlainText: "",
  setNotes: (newNotes) => set({ notes: newNotes }),
  addNote: (newNote) => set((state) => ({ notes: [...state.notes, newNote] })),
  updateNote: (updatedNote, id) =>
    set((state) => {
      console.log(updatedNote, id);
      return {
        notes: state.notes.map((note) =>
          note.id != id ? note : { ...note, ...updatedNote }
        ),
      };
    }),
  updateNoteTitle: ({ newTitle, id }) =>
    set((state) => {
      console.log(newTitle, id);
      const updatedNotes = state.notes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            title: newTitle,
          };
        }
      });
      return { notes: updatedNotes };
    }),
  removeNote: (deletedNote) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== deletedNote.id),
    })),
  setCurrentNoteTitle: (newTitle) => set({ currentNoteTitle: newTitle }),
  setCurrentNoteContent: (newContent) =>
    set({ currentNoteContent: newContent }),
  setCurrentNotePlainText: (newPlainText) =>
    set({ currentNotePlainText: newPlainText }),
}));
