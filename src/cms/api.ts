/* קריאות לשרת של הפאנל. כולן באותו origin, עם עוגיית ההתחברות. */

export type Me = { name: string; username: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `שגיאה ${res.status}`);
  return data;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type CommitSummary = {
  sha: string;
  date: string;
  author: string;
  message: string;
  url: string;
};

/** התוכן כפי שהיה בגרסה מסוימת. null = הקובץ לא היה קיים אז */
export type HistoryVersion = { sha: string; site: unknown | null; services: unknown | null };

export const api = {
  me: () => request<Me>("/api/me"),
  history: (limit?: number) =>
    request<{ commits: CommitSummary[] }>(`/api/history${limit ? `?limit=${limit}` : ""}`),
  version: (sha: string) => request<HistoryVersion>(`/api/history?sha=${encodeURIComponent(sha)}`),
  login: (username: string, password: string, remember = false) =>
    request<Me>("/api/login", { method: "POST", body: JSON.stringify({ username, password, remember }) }),
  logout: () => request<{ ok: true }>("/api/logout", { method: "POST" }),
  /** מעלה תמונה לריפו ומחזיר את הנתיב הציבורי שנשמר בתוכן */
  uploadImage: (payload: { name: string; contentType: string; base64: string }) =>
    request<{ path: string }>("/api/asset", { method: "POST", body: JSON.stringify(payload) }),
  content: () =>
    request<{ site: unknown; services: unknown; shas: { site: string; services: string } }>("/api/content"),
  save: (payload: unknown) =>
    request<{ ok: true; saved: Partial<Record<"site" | "services", { sha: string; commitUrl: string }>>; by: string }>(
      "/api/content",
      { method: "PUT", body: JSON.stringify(payload) },
    ),
};
