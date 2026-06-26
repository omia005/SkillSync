import { create } from "zustand";


export const useCVStore = create((set) => ({
  cv: null,
  loading: false,

  setCV: (data) => set({ cv: data }),

  updatePersonal: (field, value) =>
    set((state) => ({
      cv: {
        ...state.cv,
        personal: {
          ...state.cv.personal,
          [field]: value,
        },
      },
    })),

addEducation: (newEdu) =>
     set((state) => ({
       cv: {
         ...state.cv,
         education: [
           ...state.cv.education,
           newEdu,
         ],
       },
     })),

  updateEducation: (index, field, value) =>
    set((state) => {
      const updated = [...state.cv.education];
      updated[index][field] = value;

      return {
        cv: {
          ...state.cv,
          education: updated,
        },
      };
    }),

addExperience: (newExp) =>
     set((state) => ({
       cv: {
         ...state.cv,
         experience: [
           ...state.cv.experience,
           newExp,
         ],
       },
     })),

  updateExperience: (index, field, value) =>
    set((state) => {
      const updated = [...state.cv.experience];
      updated[index][field] = value;

      return {
        cv: {
          ...state.cv,
          experience: updated,
        },
      };
    }),

  addSkill: (skill) =>
    set((state) => ({
      cv: {
        ...state.cv,
        skills: [...state.cv.skills, skill],
      },
    })),

  removeSkill: (index) =>
    set((state) => ({
      cv: {
        ...state.cv,
        skills: state.cv.skills.filter((_, i) => i !== index),
      },
    })),
}));