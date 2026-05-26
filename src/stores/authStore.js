import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  session: null,
  role: null,
  profileId: null,
  accountId: null,
  coachId: null,
  
  setAuth: (data) => set(data),
  
  clearAuth: () => set({
    session: null,
    role: null,
    profileId: null,
    accountId: null,
    coachId: null,
  }),
}))
