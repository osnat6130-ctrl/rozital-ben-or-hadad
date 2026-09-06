import { useState, type FormEvent } from "react";
import { WhatsappIcon } from "./Icons";
import { services } from "@/data/services";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-2xl bg-bg px-4 py-3.5 text-ink ring-1 ring-line/80 placeholder:text-muted/55 transition-shadow duration-200 hover:ring-brand/40 focus:bg-surface focus:ring-2 focus:ring-brand";

const labelClass = "mb-2 block font-display text-sm font-bold text-brand-dark";

const topics = [...services.map((service) => service.navLabel), "אחר"];

/**
 * טופס פנייה בלי שרת: בלחיצה על "שליחה" נפתח וואטסאפ עם הודעה מוכנה
 * שמכילה את כל מה שמולא בטופס.
 */
export default function WhatsappForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const lines = [
      "היי רוזיטל, הגעתי דרך האתר :)",
      `שם: ${name.trim()}`,
      phone.trim() && `טלפון: ${phone.trim()}`,
      topic && `נושא: ${topic}`,
      `הודעה: ${message.trim()}`,
    ].filter(Boolean);
    const url = whatsappLink(lines.join("\n"));
    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-[2rem] bg-surface p-6 shadow-lift ring-1 ring-line/60 sm:p-9"
      aria-labelledby="contact-form-title"
    >
      <span
        aria-hidden
        className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative">
        <h2 id="contact-form-title" className="text-2xl sm:text-3xl">
          השאירו פנייה
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              שם מלא
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="איך קוראים לכם?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className={labelClass}>
              טלפון
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="050-0000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${fieldClass} text-right placeholder:text-right`}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={labelClass}>במה אפשר לעזור?</legend>
          <div className="flex flex-wrap gap-2">
            {topics.map((item) => {
              const selected = topic === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTopic(selected ? "" : item)}
                  className={cn(
                    "rounded-full px-4 py-2 font-display text-sm font-bold ring-1 transition-all duration-200",
                    selected
                      ? "bg-brand text-white ring-brand shadow-soft"
                      : "bg-brand-soft/70 text-brand-dark ring-transparent hover:bg-brand-soft hover:ring-brand/30",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="contact-message" className={labelClass}>
            הודעה
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            placeholder="ספרו לי בקצרה על הקבוצה, האירוע או השאלה שלכם"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} resize-y`}
          />
        </div>

        <button type="submit" className="btn-whatsapp mt-7 w-full !py-4 !text-lg">
          שלח פניה לוואטסאפ
          <WhatsappIcon className="h-6 w-6" />
        </button>

        <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
          {sentUrl ? (
            <>
              ההודעה נפתחה בוואטסאפ. לא נפתח לכם חלון?{" "}
              <a
                href={sentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand underline underline-offset-2"
              >
                לחצו כאן
              </a>
            </>
          ) : (
            "ההודעה נפתחת בוואטסאפ עם כל הפרטים - נשאר רק ללחוץ שליחה."
          )}
        </p>
      </div>
    </form>
  );
}
