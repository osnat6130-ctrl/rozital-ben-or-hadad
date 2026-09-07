/* גישה לריפו דרך GitHub Contents API. הטוקן חי רק כאן, בשרת.
 *
 * כל שמירה מהפאנל היא commit רגיל בענף - כך שההיסטוריה, השחזור
 * והפרסום האוטומטי ב-Vercel עובדים בלי שום מנגנון נוסף. */
import { env } from "./env";

const API = "https://api.github.com";

type FileResponse = { content: string; sha: string; encoding: string; path: string };

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}/repos/${env.githubRepo()}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.githubToken()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "rozital-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  return res;
}

export class GitHubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** קורא קובץ טקסט מהענף. מחזיר את התוכן ואת ה-sha (נדרש לכתיבה) */
export async function readFile(path: string): Promise<{ text: string; sha: string }> {
  const res = await gh(`/contents/${path}?ref=${encodeURIComponent(env.githubBranch())}`);
  if (!res.ok) throw new GitHubError(res.status, `קריאת ${path} נכשלה (${res.status})`);
  const data = (await res.json()) as FileResponse;
  return { text: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

export type CommitAuthor = { name: string; email: string };

/** כותב קובץ ויוצר commit. sha חייב להתאים לגרסה שנקראה - אחרת 409
 *  (מישהי אחרת שמרה בינתיים) והלקוח צריך לטעון מחדש. */
export async function writeFile(
  path: string,
  text: string,
  sha: string | undefined,
  message: string,
  author: CommitAuthor,
): Promise<{ sha: string; commitSha: string; commitUrl: string }> {
  const res = await gh(`/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(text, "utf8").toString("base64"),
      sha,
      branch: env.githubBranch(),
      committer: author,
      author,
    }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new GitHubError(409, "הקובץ השתנה בינתיים - טענו מחדש ונסו שוב");
  }
  if (!res.ok) throw new GitHubError(res.status, `שמירת ${path} נכשלה (${res.status})`);
  const data = (await res.json()) as { content: { sha: string }; commit: { sha: string; html_url: string } };
  return { sha: data.content.sha, commitSha: data.commit.sha, commitUrl: data.commit.html_url };
}
