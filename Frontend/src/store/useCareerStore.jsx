import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCareerStore = create(
  persist(
    (set) => ({
      selectedSlug: null,

      selectCareer: (slug) =>
        set((state) => ({
          selectedSlug: state.selectedSlug === slug ? null : slug,
        })),
    }),
    {
      name: "career-storage", // localStorage key
    }
  )
);