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

  addEducation: () =>
    set((state) => ({
      cv: {
        ...state.cv,
        education: [
          ...state.cv.education,
          {
            school: "",
            degree: "",
            field: "",
            start_date: "",
            end_date: "",
          },
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

  addExperience: () =>
    set((state) => ({
      cv: {
        ...state.cv,
        experience: [
          ...state.cv.experience,
          {
            company: "",
            role: "",
            start_date: "",
            end_date: "",
            description: "",
          },
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