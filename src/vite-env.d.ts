/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** נקודת קצה לשליחת טפסים - ראו src/lib/leads.ts */
  readonly VITE_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
