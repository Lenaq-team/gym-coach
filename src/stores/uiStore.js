import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeClientId: null,
  setActiveClient: (clientId) => set({ activeClientId: clientId }),
}))
