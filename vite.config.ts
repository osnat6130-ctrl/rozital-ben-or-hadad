import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // ‼️ נתיב הבסיס ל-GitHub Pages: https://<user>.github.io/rozital-ben-or-hadad/
  //    אם יעברו לדומיין עצמאי - להחזיר ל-"/".
  base: "/rozital-ben-or-hadad/",
  plugins: [react()],
  resolve: {
    // "@" מצביע על תיקיית src (נפתר יחסית לשורש הפרויקט)
    alias: { "@": "/src" },
  },
  build: {
    target: "es2020",
  },
});
