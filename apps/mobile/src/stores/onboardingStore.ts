import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  OnboardingState,
  OnboardingDraft,
  OnboardingStep,
  SubmissionState,
} from "@mal-assessment/shared";

interface OnboardingStore extends OnboardingState {
  setStep: (step: OnboardingStep) => void;
  updateDraft: (draft: Partial<OnboardingDraft>) => void;
  updateProfile: (profile: Partial<OnboardingDraft["profile"]>) => void;
  updateDocument: (document: Partial<OnboardingDraft["document"]>) => void;
  updateAddress: (address: Partial<OnboardingDraft["address"]>) => void;
  updateConsents: (consents: Partial<OnboardingDraft["consents"]>) => void;
  setSubmissionState: (state: SubmissionState) => void;
  setSubmissionError: (error: string | null) => void;
  setSubmissionId: (id: string | null) => void;
  resetDraft: () => void;
}

const defaultDraft: OnboardingDraft = {
  profile: {
    fullName: "",
    dateOfBirth: "",
    nationality: "",
  },
  document: {
    documentType: "PASSPORT",
    documentNumber: "",
  },
  address: {
    addressLine1: "",
    city: "",
    country: "",
  },
  consents: {
    termsAccepted: false,
  },
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      draft: defaultDraft,
      currentStep: 1,
      submissionState: "idle",
      submissionError: null,
      submissionId: null,

      setStep: (step) => set({ currentStep: step }),

      updateDraft: (draft) =>
        set((state) => ({
          draft: { ...state.draft, ...draft },
        })),

      updateProfile: (profile) =>
        set((state) => ({
          draft: {
            ...state.draft,
            profile: { ...state.draft.profile, ...profile },
          },
        })),

      updateDocument: (document) =>
        set((state) => ({
          draft: {
            ...state.draft,
            document: { ...state.draft.document, ...document },
          },
        })),

      updateAddress: (address) =>
        set((state) => ({
          draft: {
            ...state.draft,
            address: { ...state.draft.address, ...address },
          },
        })),

      updateConsents: (consents) =>
        set((state) => ({
          draft: {
            ...state.draft,
            consents: { ...state.draft.consents, ...consents },
          },
        })),

      setSubmissionState: (state) => set({ submissionState: state }),

      setSubmissionError: (error) => set({ submissionError: error }),

      setSubmissionId: (id) => set({ submissionId: id }),

      resetDraft: () =>
        set({
          draft: defaultDraft,
          currentStep: 1,
          submissionState: "idle",
          submissionError: null,
          submissionId: null,
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
