/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // ‼️ כל הצבעים מוגדרים כמשתני CSS ב-src/index.css (:root).
        // להחלפת צבעי המותג - לשנות שם בלבד, לא כאן ולא בקומפוננטות.
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          dark: "hsl(var(--brand-dark) / <alpha-value>)",
          light: "hsl(var(--brand-light) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "hsl(var(--gold) / <alpha-value>)",
          dark: "hsl(var(--gold-dark) / <alpha-value>)",
          soft: "hsl(var(--gold-soft) / <alpha-value>)",
        },
        hero: {
          DEFAULT: "hsl(var(--hero) / <alpha-value>)",
          2: "hsl(var(--hero-2) / <alpha-value>)",
          ink: "hsl(var(--hero-ink) / <alpha-value>)",
          muted: "hsl(var(--hero-muted) / <alpha-value>)",
        },
        bg: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        ink: "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted-text) / <alpha-value>)",
        line: "hsl(var(--border) / <alpha-value>)",
        // צבע דינמי לפי התחום (נקבע ב-ServiceThemeProvider)
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          dark: "hsl(var(--accent-dark) / <alpha-value>)",
          soft: "hsl(var(--accent-soft) / <alpha-value>)",
        },
        whatsapp: "#25D366",
      },
      // כל האתר בפונט אחד - Google Sans. שלושת המפתחות מצביעים לאותו
      // פונט כדי ש-font-display / font-serif בקומפוננטות ימשיכו לעבוד.
      fontFamily: {
        sans: ["Google Sans", "Assistant", "system-ui", "sans-serif"],
        display: ["Google Sans", "Assistant", "system-ui", "sans-serif"],
        serif: ["Google Sans", "Assistant", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px hsl(var(--text) / 0.12)",
        card: "0 10px 40px -16px hsl(var(--text) / 0.22)",
        lift: "0 22px 55px -22px hsl(var(--text) / 0.32)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.94)" },
          "60%": { opacity: "1", transform: "translateY(-4px) scale(1.02)" },
          "100%": { opacity: "1", transform: "none" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        morph: {
          "0%, 100%": { borderRadius: "62% 38% 55% 45% / 48% 42% 58% 52%" },
          "50%": { borderRadius: "40% 60% 42% 58% / 58% 55% 45% 42%" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease both",
        "pop-in": "pop-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        float: "float 6s ease-in-out infinite",
        morph: "morph 18s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
