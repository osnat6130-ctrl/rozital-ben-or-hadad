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

export const api = {
  me: () => request<Me>("/api/me"),
  login: (username: string, password: string) =>
    request<Me>("/api/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: true }>("/api/logout", { method: "POST" }),
  content: () =>
    request<{ site: unknown; services: unknown; shas: { site: string; services: string } }>("/api/content"),
  save: (payload: unknown) =>
    request<{ ok: true; saved: Partial<Record<"site" | "services", { sha: string; commitUrl: string }>>; by: string }>(
      "/api/content",
      { method: "PUT", body: JSON.stringify(payload) },
    ),
};
