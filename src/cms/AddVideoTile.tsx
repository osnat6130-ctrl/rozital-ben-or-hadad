/* כרטיס "הוספת סרטון", כפריט בתוך רשת הסרטונים.
 *
 * פריט ברשת ולא שורה מתחתיה: כך הוא יושב *ליד* הסרטון כשיש עמודה
 * פנויה, ויורד לשורה הבאה רק כשהשורה מלאה - וזו ההתנהגות שהתבקשה.
 * הגובה מתון ולא כגובה סרטון פורטרט, כדי שכשהוא כן נופל לשורה משלו
 * הוא ייראה כשורת הוספה ולא כבלוק ריק ענק. */
import { useRef, useState } from "react";
import AddCard from "./AddCard";
import { api } from "./api";
import { useEditing } from "./editing";
import { prepareVideo } from "./image";
import { insertItem } from "./store";

type Props = {
  /** נתיב מערך הסרטונים, למשל "services.3.videos" */
  cmsPath: string;
  count: number;
};

export default function AddVideoTile({ cmsPath, count }: Props) {
  const editing = useEditing();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!editing) return null;

  async function add(file: File) {
    setError(null);
    setBusy(true);
    try {
      const video = await prepareVideo(file);
      const { path } = await api.uploadImage({
        name: video.name,
        contentType: video.contentType,
        base64: video.base64,
      });
      insertItem(cmsPath, { src: path, width: video.width, height: video.height }, count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ההעלאה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  /* טור אחד, פשוט. מספר הטורים של הרשת נגזר בדף מכמות הפריטים כולל
     הכרטיס הזה (ראו videoColumns ב-ServicePage), ולכן הוא כבר יושב ליד
     הסרטונים ולא מתחתיהם - בלי צורך בהתחכמות כאן. */
  return (
    <div className="self-stretch">
      <AddCard
        compact
        className="h-full min-h-32"
        label={busy ? "מעלה סרטון..." : "הוספת סרטון"}
        hint="MP4 או WebM, עד 20MB"
        onClick={() => !busy && inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void add(file);
        }}
      />
      {error && (
        <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
