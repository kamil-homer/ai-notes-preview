import { create } from "zustand";

export const useUserState = create((set) => ({
  user: undefined, // undefined oznacza "nie wiemy jeszcze", null oznacza "sprawdziliśmy i nie ma użytkownika"
  setUser: (user) => set({ user }),
}));
