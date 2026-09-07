import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // נתיב הבסיס: "/" ב-Vercel (ברירת מחדל). GitHub Pages מגדיר
  // VITE_BASE_PATH=/rozital-ben-or-hadad/ ב-workflow שלו, עד שיוצא משימוש.
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  resolve: {
    // "@" מצביע על תיקיית src (נפתר יחסית לשורש הפרויקט)
    alias: { "@": "/src" },
  },
  build: {
    target: "es2020",
  },
  server: {
    // בפיתוח, /api מוגש על ידי scripts/dev-api.mjs (npm run dev:api)
    proxy: { "/api": "http://localhost:5184" },
  },
});
