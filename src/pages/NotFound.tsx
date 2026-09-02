import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { LogoMark } from "@/components/Logo";
import { ArrowIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <>
      <Seo
        title="הדף לא נמצא | רוזיטל בן אור חדד"
        description="הדף שחיפשת לא נמצא. אפשר לחזור לדף הבית ולבחור את התחום שמעניין אותך."
        path="/404"
      />

      <section className="section">
        <div className="container flex flex-col items-center text-center">
          <LogoMark className="h-24 animate-float" />
          <h1 className="mt-8 text-4xl sm:text-5xl">אופס, הדף הזה לא נמצא</h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            כנראה שהקישור השתנה. אפשר לחזור לדף הבית ולבחור את מה שמעניין אותך.
          </p>
          <Link to="/" className="btn-primary mt-8">
            חזרה לדף הבית
            <ArrowIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
