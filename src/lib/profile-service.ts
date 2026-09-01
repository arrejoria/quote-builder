import type { CompanyProfile } from "../app/lib/storage";
import { loadProfile, saveProfile } from "../app/lib/storage";

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getProfile(isAuthenticated: boolean): Promise<CompanyProfile | null> {
  if (!isAuthenticated) return loadProfile();
  try {
    return await apiFetch<CompanyProfile | null>("/profile");
  } catch {
    return null;
  }
}

export async function upsertProfile(profile: CompanyProfile, isAuthenticated: boolean): Promise<void> {
  if (!isAuthenticated) { saveProfile(profile); return; }
  await apiFetch("/profile", { method: "PUT", body: JSON.stringify(profile) });
}
