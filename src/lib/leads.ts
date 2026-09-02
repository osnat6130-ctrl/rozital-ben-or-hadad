/* ============================================================================
   שליחת פנייה מהטופס
   ----------------------------------------------------------------------------
   ‼️ TODO - חיבור לשירות שליחה בפועל.
   כרגע אין Backend, ולכן:
   • אם מוגדר משתנה הסביבה VITE_FORM_ENDPOINT (קובץ .env) - הפנייה נשלחת לשם
     כ-POST בפורמט JSON. זה עובד מיידית מול Formspree / Web3Forms / Make /
     Google Apps Script / פונקציית Supabase.
   • אם לא מוגדר - הטופס עובד במצב הדגמה: מדמה שליחה מוצלחת ומדפיס לקונסולה.

   דוגמה לקובץ .env:
   VITE_FORM_ENDPOINT=https://formspree.io/f/XXXXXXX
   ========================================================================== */

export type Lead = {
  name: string;
  phone: string;
  service: string;
  message: string;
  /** מאיזה עמוד נשלחה הפנייה - עוזר לרוזיטל לדעת מה עניין את הפונה */
  source: string;
};

const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;

export async function submitLead(lead: Lead): Promise<void> {
  if (!endpoint) {
    // מצב הדגמה - עד לחיבור שירות השליחה
    console.info("[טופס - מצב הדגמה] הפנייה שהתקבלה:", lead);
    await new Promise((resolve) => setTimeout(resolve, 900));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error(`שליחת הפנייה נכשלה (${response.status})`);
  }
}
