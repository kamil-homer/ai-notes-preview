import { create } from "zustand";

export const useUserState = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
