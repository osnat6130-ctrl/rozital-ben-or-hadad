import { useId, useState, type FormEvent } from "react";
import { CheckIcon } from "./Icons";
import { services } from "@/data/services";
import { site, telLink } from "@/data/site";
import { submitLead } from "@/lib/leads";
import { cn } from "@/lib/utils";

type Props = {
  /** התחום שייבחר מראש ברשימה (בדפי השירות) */
  defaultService?: string;
  /** מזהה העמוד שממנו נשלחה הפנייה */
  source: string;
  className?: string;
  /** פנייה בלשון רבים במקום נקבה-יחיד (כרגע רק בדף צור קשר) */
  plural?: boolean;
};

type Errors = Partial<Record<"name" | "phone" | "service", string>>;
type Status = "idle" | "loading" | "success" | "error";

const serviceOptions = [
  ...services.map((s) => s.cardTitle),
  "עדיין לא בטוחה / משהו אחר",
];

function validate(values: { name: string; phone: string; service: string }, plural: boolean): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 2) {
    errors.name = plural ? "אשמח לדעת איך לפנות אליכם" : "אשמח לדעת איך לפנות אלייך";
  }

  const digits = values.phone.replace(/\D/g, "");
  if (!digits) {
    errors.phone = plural ? "צריך מספר טלפון כדי לחזור אליכם" : "צריך מספר טלפון כדי לחזור אלייך";
  } else if (!/^0\d{8,9}$/.test(digits)) {
    errors.phone = "מספר הטלפון לא נראה תקין (לדוגמה: 050-1234567)";
  }

  if (!values.service) {
    errors.service = plural ? "מה מעניין אתכם לשמוע?" : "מה מעניין אותך לשמוע?";
  }

  return errors;
}

export default function ContactForm({ defaultService = "", source, className, plural = false }: Props) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({
    name: "",
    phone: "",
    service: defaultService,
    message: "",
  });

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // מלכודת ספאם - שדה מוסתר שרק בוטים ממלאים
    const honeypot = (event.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value;
    if (honeypot) return;

    const nextErrors = validate(values, plural);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstField = document.getElementById(`${id}-${Object.keys(nextErrors)[0]}`);
      firstField?.focus();
      return;
    }

    setStatus("loading");
    try {
      await submitLead({ ...values, source });
      setStatus("success");
      setValues({ name: "", phone: "", service: defaultService, message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex animate-fade-up flex-col items-center rounded-3xl bg-accent-soft p-10 text-center",
          className,
        )}
      >
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h3 className="text-2xl text-accent-dark">
          {plural ? "תודה, רוזיטל תחזור אליכם בהקדם :)" : "תודה, רוזיטל תחזור אלייך בהקדם :)"}
        </h3>
        <p className="mt-3 text-muted">
          אם זה דחוף אפשר גם להתקשר{" "}
          <a
            href={telLink}
            dir="ltr"
            className="font-bold text-accent underline underline-offset-4"
          >
            {site.phone.display}
          </a>{" "}
          ואענה מהר ככל שאפשר :)
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-display font-bold text-accent underline underline-offset-4"
        >
          לשליחת פנייה נוספת
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-2xl border-2 bg-surface px-4 py-3 text-base transition-colors duration-200 placeholder:text-muted/60 focus:border-accent focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("space-y-5", className)}
      aria-label="טופס יצירת קשר"
    >
      {/* שם */}
      <div>
        <label htmlFor={`${id}-name`} className="mb-1.5 block font-display font-bold text-ink">
          שם מלא <span className="text-accent">*</span>
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={cn(fieldClass, errors.name ? "border-red-400" : "border-line")}
          placeholder={plural ? "איך קוראים לכם?" : "איך קוראים לך?"}
        />
        {errors.name && (
          <p id={`${id}-name-error`} className="mt-1.5 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* טלפון */}
      <div>
        <label htmlFor={`${id}-phone`} className="mb-1.5 block font-display font-bold text-ink">
          פלאפון <span className="text-accent">*</span>
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          value={values.phone}
          onChange={(e) => set("phone")(e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
          className={cn(
            fieldClass,
            "text-right",
            errors.phone ? "border-red-400" : "border-line",
          )}
          placeholder="050-1234567"
        />
        {errors.phone && (
          <p id={`${id}-phone-error`} className="mt-1.5 text-sm text-red-600">
            {errors.phone}
          </p>
        )}
      </div>

      {/* סוג השירות */}
      <div>
        <label htmlFor={`${id}-service`} className="mb-1.5 block font-display font-bold text-ink">
          {plural ? "מה מעניין אתכם?" : "מה מעניין אותך?"} <span className="text-accent">*</span>
        </label>
        <select
          id={`${id}-service`}
          name="service"
          value={values.service}
          onChange={(e) => set("service")(e.target.value)}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? `${id}-service-error` : undefined}
          className={cn(fieldClass, errors.service ? "border-red-400" : "border-line")}
        >
          <option value="">{plural ? "בחרו מהרשימה" : "בחרי מהרשימה"}</option>
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.service && (
          <p id={`${id}-service-error`} className="mt-1.5 text-sm text-red-600">
            {errors.service}
          </p>
        )}
      </div>

      {/* הודעה */}
      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block font-display font-bold text-ink">
          הודעה קצרה
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          className={cn(fieldClass, "resize-y border-line")}
          placeholder="כמה מילים על האירוע או על הקבוצה (לא חובה)"
        />
      </div>

      {/* מלכודת ספאם - מוסתרת ממשתמשים ומקוראי מסך */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
            {plural ? "שולחים..." : "שולחת..."}
          </>
        ) : (
          "שליחה"
        )}
      </button>

      {status === "error" && (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center text-red-700">
          משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לשלוח הודעה בוואטסאפ.
        </p>
      )}

      <p className="text-center text-sm text-muted">
        הפרטים נשמרים אצל רוזיטל בלבד ומשמשים ליצירת קשר חוזר.
      </p>
    </form>
  );
}
