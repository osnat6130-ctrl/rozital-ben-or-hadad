/* שרת פיתוח מקומי לפונקציות שב-api/ - כדי לבדוק את הפאנל בלי Vercel CLI.
 *
 * מריץ כל api/<name>.ts תחת http://localhost:5184/api/<name>, עם אותה
 * חתימה (req, res) של Vercel. Vite מפנה לכאן את /api בזמן פיתוח
 * (ראו vite.config.ts). משתני סביבה נקראים מ-.env.local.
 *
 * שימוש: npm run dev:api  (במקביל ל-npm run dev) */
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { build } from "esbuild";

const PORT = 5184;
const ROOT = process.cwd();

// .env.local -> process.env (רק מה שלא מוגדר כבר)
const envFile = join(ROOT, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

// כל הפונקציות מקומפלות פעם אחת לקובץ זמני (esbuild מהיר מאוד)
const outDir = join(ROOT, "node_modules", ".cache", "dev-api");
const entries = readdirSync(join(ROOT, "api")).filter((f) => f.endsWith(".ts"));
await build({
  entryPoints: entries.map((f) => join(ROOT, "api", f)),
  outdir: outDir,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: "inline",
  logLevel: "warning",
  packages: "external",
});
const handlers = new Map();
for (const f of entries) {
  const name = f.replace(/\.ts$/, "");
  const mod = await import(pathToFileURL(join(outDir, name + ".js")).href + `?t=${Date.now()}`);
  handlers.set(name, mod.default);
}

// עטיפה מינימלית של res כדי לתמוך ב-res.status().send() כמו ב-Vercel
function vercelify(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (body) => { res.end(typeof body === "string" ? body : JSON.stringify(body)); return res; };
  res.json = (body) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); return res; };
  return res;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const name = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  const handler = handlers.get(name);
  if (!handler) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: `אין פונקציה בשם ${name}` }));
  }
  req.query = Object.fromEntries(url.searchParams);
  try {
    await handler(req, vercelify(res));
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e?.message ?? e) }));
  }
}).listen(PORT, () => {
  console.log(`dev-api: http://localhost:${PORT}/api/{${[...handlers.keys()].join(",")}}`);
});
