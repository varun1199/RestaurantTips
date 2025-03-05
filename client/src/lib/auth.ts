import { create } from "zustand";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export async function login(username: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const { user } = await res.json();
  useAuth.getState().setUser(user);
  return user;
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  useAuth.getState().setUser(null);
}
