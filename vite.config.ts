import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // האתר מוגש משורש הדומיין ב-Cloudflare Pages
  base: "/",
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
