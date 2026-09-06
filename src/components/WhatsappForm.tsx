import { useState, type FormEvent } from "react";
import { WhatsappIcon } from "./Icons";
import { services } from "@/data/services";
import { whatsappLink } from "@/data/site";

const fieldClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/60 transition-colors focus:border-accent";

const labelClass = "mb-1.5 block font-display text-sm font-bold text-brand-dark";

/**
 * טופס פנייה בלי שרת: בלחיצה על "שליחה" נפתח וואטסאפ עם הודעה מוכנה
 * שמכילה את כל מה שמולא בטופס.
 */
export default function WhatsappForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const lines = [
      "היי רוזיטל, הגעתי דרך האתר :)",
      `שם: ${name.trim()}`,
      phone.trim() && `טלפון: ${phone.trim()}`,
      topic && `נושא: ${topic}`,
      `הודעה: ${message.trim()}`,
    ].filter(Boolean);
    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line/70 sm:p-8"
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className="text-2xl">
        השאירו פנייה
      </h2>
      <p className="mt-2 text-muted">
        מלאו את הפרטים, ובלחיצה על כפתור השליחה ההודעה תישלח אלי לוואטסאפ.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${fieldClass} text-right`}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-topic" className={labelClass}>
          במה אפשר לעזור?
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={fieldClass}
        >
          <option value="">בחרו נושא (לא חובה)</option>
          {services.map((service) => (
            <option key={service.id} value={service.cardTitle}>
              {service.cardTitle}
            </option>
          ))}
          <option value="אחר">אחר</option>
        </select>
      </div>

      <div className="mt-4">
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

      <button type="submit" className="btn-whatsapp mt-6 w-full">
        שלח פניה לוואטסאפ
        <WhatsappIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
