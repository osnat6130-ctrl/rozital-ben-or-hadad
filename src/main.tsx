import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* ‼️ מסירים את התוכן הסטטי שנכתב בבנייה (scripts/prerender.mjs).
   הוא קיים ב-HTML הגולמי בשביל סורקים שלא מריצים JavaScript, והוא
   מוסתר ב-CSS - אבל גוגל דווקא כן מריץ JavaScript, ולכן הוא היה רואה
   את העמוד עם שתי כותרות H1 ועם כל התוכן פעמיים. מי שהגיע לכאן ממילא
   מקבל את האתר האמיתי, ולכן אין מה להשאיר. */
document.getElementById("prerendered")?.remove();
