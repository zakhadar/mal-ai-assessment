import { create } from "zustand";
import { VerificationState, VerificationStatus } from "@mal-assessment/shared";

interface VerificationStore extends VerificationState {
  setStatus: (status: VerificationStatus, updatedAt: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  status: "NOT_STARTED",
  updatedAt: null,
  isLoading: false,
  error: null,

  setStatus: (status, updatedAt) =>
    set({ status, updatedAt, isLoading: false, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set({
    status: "NOT_STARTED",
    updatedAt: null,
    isLoading: false,
    error: null,
  }),
}));
