import { create } from "zustand";

export const useUserState = create((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));
