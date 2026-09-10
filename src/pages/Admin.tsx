/* /admin - כניסה לפאנל הניהול.
 * אחרי כניסה מוצלחת: סימון מקומי + חזרה לדף הבית עם סרגל העריכה. */
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { api } from "@/cms/api";
import { hasAdminFlag, setAdminFlag } from "@/cms/gate";

/* שם המשתמש נשמר מקומית כדי לא להקליד אותו בכל כניסה. הסיסמה לא
   נשמרת כאן בכוונה - היא נשמרת במנהל הסיסמאות של הדפדפן, שמוצפן ומוגן
   בנעילת המחשב, ולא ב-localStorage שכל סקריפט בדף יכול לקרוא. */
const REMEMBER_KEY = "rz-admin-user";

const readRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
};

export default function Admin() {
  const navigate = useNavigate();
  const remembered = readRemembered();
  const [username, setUsername] = useState(remembered);
  const [password, setPassword] = useState("");
  /* דולק כברירת מחדל: זה מחשב פרטי של בעלת האתר, והחלופה היא התחברות
     מחדש בכל עריכה קטנה. מי שעובדת ממחשב משותף פשוט מכבה. */
  const [remember, setRemember] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  // הדף לא לאינדוקס
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!hasAdminFlag()) return;
    api.me().then((m) => setMe(m.name)).catch(() => setAdminFlag(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const m = await api.login(username, password, remember);
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, username);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* אחסון חסום - פשוט לא נזכור את שם המשתמש */
      }
      setAdminFlag(true);
      sessionStorage.setItem("rz-editing", "1");
      navigate("/", { replace: true });
      setMe(m.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "הכניסה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="פאנל ניהול | רוזיטל בן אור חדד" description="כניסה לניהול האתר" path="/admin" />
      <section className="section">
        <div className="container">
          <div className="card mx-auto max-w-md p-8 sm:p-10">
            <h1 className="text-3xl">פאנל ניהול</h1>

            {me ? (
              <div className="mt-6 space-y-4">
                <p className="text-muted">את מחוברת בתור <b className="text-ink">{me}</b>.</p>
                <p className="text-muted">
                  כדי לערוך: עוברים לכל דף באתר, לוחצים על "מצב עריכה" בסרגל התחתון,
                  ואז על כל טקסט שרוצים לשנות. בסיום - "שמירה ופרסום".
                </p>
                <Link to="/" className="btn-primary w-full">
                  לאתר
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block" htmlFor="admin-username">
                  <span className="mb-1.5 block text-sm font-bold">שם משתמש</span>
                  <input
                    id="admin-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
                  />
                </label>
                <label className="block" htmlFor="admin-password">
                  <span className="mb-1.5 block text-sm font-bold">סיסמה</span>
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-brand"
                  />
                  <span>זכור אותי במחשב הזה</span>
                </label>
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                  {busy ? "רגע..." : "כניסה"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
