/* ============================================================================
   השוואה בין שתי גרסאות תוכן
   ----------------------------------------------------------------------------
   מפרק שני עצי JSON לרשימת שינויים ברמת השדה הבודד, עם הנתיב (כדי
   שנוכל לתאר אותו בעברית ולשחזר אותו) ועם הערך לפני ואחרי.

   נועד למסך ההיסטוריה: "מה השתנה בגרסה הזאת" ו"שחזרי רק את השדה הזה".
   ========================================================================== */

export type ChangeKind = "changed" | "added" | "removed";

export type FieldChange = {
  /** "services.2.sections.1.paragraphs.0" */
  path: string;
  kind: ChangeKind;
  before: unknown;
  after: unknown;
};

const isLeaf = (v: unknown) => v === null || typeof v !== "object";

/** אוסף את כל השדות (העלים) של עץ, לפי נתיב */
function collectLeaves(node: unknown, prefix: string, out: Map<string, unknown>) {
  if (isLeaf(node)) {
    out.set(prefix, node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectLeaves(item, `${prefix}.${i}`, out));
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    collectLeaves(value, `${prefix}.${key}`, out);
  }
}

/**
 * משווה שני עצי תוכן ומחזיר את השינויים ברמת השדה.
 * הסדר: לפי הנתיב, כדי שהתצוגה תהיה יציבה בין רינדורים.
 */
export function diffContent(before: unknown, after: unknown, rootPath: string): FieldChange[] {
  const a = new Map<string, unknown>();
  const b = new Map<string, unknown>();
  if (before !== null && before !== undefined) collectLeaves(before, rootPath, a);
  if (after !== null && after !== undefined) collectLeaves(after, rootPath, b);

  const changes: FieldChange[] = [];
  for (const [path, beforeValue] of a) {
    if (!b.has(path)) {
      changes.push({ path, kind: "removed", before: beforeValue, after: undefined });
      continue;
    }
    const afterValue = b.get(path);
    if (beforeValue !== afterValue) {
      changes.push({ path, kind: "changed", before: beforeValue, after: afterValue });
    }
  }
  for (const [path, afterValue] of b) {
    if (!a.has(path)) changes.push({ path, kind: "added", before: undefined, after: afterValue });
  }
  return changes.sort((x, y) => x.path.localeCompare(y.path));
}

/** השינויים בין שתי גרסאות מלאות (שני הקבצים יחד) */
export function diffVersions(
  before: { site: unknown; services: unknown },
  after: { site: unknown; services: unknown },
): FieldChange[] {
  return [
    ...diffContent(before.site, after.site, "site"),
    ...diffContent(before.services, after.services, "services"),
  ];
}
