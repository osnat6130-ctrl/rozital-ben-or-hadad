/* גישה לריפו דרך GitHub Contents API. הטוקן חי רק כאן, בשרת.
 *
 * כל שמירה מהפאנל היא commit רגיל בענף - כך שההיסטוריה, השחזור
 * והפרסום האוטומטי ב-Cloudflare Pages עובדים בלי שום מנגנון נוסף. */
import { branch, requireEnv, type Env } from "./env";

const API = "https://api.github.com";

type FileResponse = { content: string; sha: string; encoding: string; path: string };

export class GitHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function gh(env: Env, path: string, init: RequestInit = {}) {
  return fetch(`${API}/repos/${requireEnv(env, "GITHUB_REPO")}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${requireEnv(env, "GITHUB_TOKEN")}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "rozital-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
}

/* base64 רגיל (לא url-safe) - זה מה ש-GitHub מצפה לו */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** קורא קובץ טקסט מהענף. מחזיר את התוכן ואת ה-sha (נדרש לכתיבה) */
export async function readFile(env: Env, path: string): Promise<{ text: string; sha: string }> {
  const res = await gh(env, `/contents/${path}?ref=${encodeURIComponent(branch(env))}`);
  if (!res.ok) throw new GitHubError(res.status, `קריאת ${path} נכשלה (${res.status})`);
  const data = (await res.json()) as FileResponse;
  return { text: fromBase64(data.content), sha: data.sha };
}

export type CommitAuthor = { name: string; email: string };

/** כותב קובץ ויוצר commit. sha חייב להתאים לגרסה שנקראה - אחרת 409
 *  (מישהי אחרת שמרה בינתיים) והלקוח צריך לטעון מחדש. */
export async function writeFile(
  env: Env,
  path: string,
  text: string,
  sha: string | undefined,
  message: string,
  author: CommitAuthor,
): Promise<{ sha: string; commitSha: string; commitUrl: string }> {
  const res = await gh(env, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: toBase64(text), sha, branch: branch(env), committer: author, author }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new GitHubError(409, "הקובץ השתנה בינתיים - טענו מחדש ונסו שוב");
  }
  if (!res.ok) throw new GitHubError(res.status, `שמירת ${path} נכשלה (${res.status})`);
  const data = (await res.json()) as { content: { sha: string }; commit: { sha: string; html_url: string } };
  return { sha: data.content.sha, commitSha: data.commit.sha, commitUrl: data.commit.html_url };
}
