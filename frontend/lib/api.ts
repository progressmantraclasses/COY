export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  college?: string;
  interests: string[];
}

export interface Match extends Profile {
  matchedAt: string;
}

export type SwipeAction = "like" | "pass";

export interface SwipeResult {
  matched: boolean;
  match?: Match;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Can't reach the Discover API.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  feed: () => request<{ profiles: Profile[] }>("/feed").then((r) => r.profiles),
  matches: () => request<{ matches: Match[] }>("/matches").then((r) => r.matches),
  swipe: (profileId: string, action: SwipeAction) =>
    request<SwipeResult>("/swipe", { method: "POST", body: JSON.stringify({ profileId, action }) }),
  reset: () => request<{ ok: true }>("/reset", { method: "POST" }),
};

/** Stable colour slot for avatars and pills, derived from a string. */
export function colorSlot(seed: string, slots = 5): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % slots;
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
