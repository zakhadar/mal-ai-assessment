import { create } from "zustand";
import { AuthState, User, Session } from "@mal-assessment/shared";

interface AuthStore extends AuthState {
  setLoggingIn: () => void;
  setLoggedIn: (user: User, session: Session) => void;
  setLoggedOut: () => void;
  setError: (error: string | null) => void;
  setRefreshing: () => void;
  setExpired: () => void;
  setSession: (session: Session) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: "logged_out",
  user: null,
  session: null,
  error: null,

  setLoggingIn: () => set({ status: "logging_in", error: null }),
  
  setLoggedIn: (user, session) => 
    set({ status: "logged_in", user, session, error: null }),
  
  setLoggedOut: () => 
    set({ status: "logged_out", user: null, session: null, error: null }),
  
  setError: (error) => 
    set({ error, status: "logged_out" }),
  
  setRefreshing: () => 
    set({ status: "refreshing" }),
  
  setExpired: () => 
    set({ status: "expired", error: "Session expired. Please log in again." }),
  
  setSession: (session) => 
    set({ session }),
}));
