import { useEffect } from "react";
import { site } from "@/data/site";

type SeoProps = {
  title: string;
  description: string;
  /** נתיב יחסי, למשל "/laughter-yoga" */
  path: string;
  image?: string;
};

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * מנהל את תגיות ה-head לכל עמוד (title / description / canonical / OG).
 * הנתונים המובנים (JSON-LD) נכתבים בבנייה ב-scripts/prerender.mjs ולא כאן,
 * כדי שגם סורק שלא מריץ JavaScript יקבל אותם.
 * במעבר ל-Lovable או ל-SSR אפשר להחליף ב-react-helmet-async בלי לשנות את הקריאות.
 */
export default function Seo({ title, description, path, image }: SeoProps) {
  useEffect(() => {
    const url = `${site.url}${path}`;
    const ogImage = image ? `${site.url}${image}` : `${site.url}/logo-original.jpg`;

    document.title = title;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, image]);

  return null;
}
