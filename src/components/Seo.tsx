import { useEffect } from "react";
import { site } from "@/data/site";

type SeoProps = {
  title: string;
  description: string;
  /** נתיב יחסי, למשל "/laughter-yoga" */
  path: string;
  image?: string;
  /** JSON-LD אופציונלי לעמוד */
  jsonLd?: Record<string, unknown>;
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
 * מנהל את תגיות ה-head לכל עמוד (title / description / canonical / OG / JSON-LD).
 * במעבר ל-Lovable או ל-SSR אפשר להחליף ב-react-helmet-async בלי לשנות את הקריאות.
 */
export default function Seo({ title, description, path, image, jsonLd }: SeoProps) {
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

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      script.dataset.page = "true";
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, path, image, jsonLd]);

  return null;
}
