/**
 * The lines of one donation (what the donor gave to, like the products of an order), kept inside the
 * donation's notes because the backend stores a single target per donation (no donation_items yet).
 *
 * Written by the donate form as one part of the notes:
 *   Items: كفالة يتيم — كفالة شهرية ×2 = 1200 ؛ حملة ستر — سقف منزل = 3000 ؛ زكاة المال — تبرع عام = 500
 * and read back by the dashboard. Older donations wrote «Programs: name [choice] (500 ج.م) + …», which is
 * read too.
 */

export type DonationLine = {
  /** Program / project / campaign / case the line goes to. */
  target: string;
  /** What was chosen inside it: a package, «تبرع عام», a case… */
  choice?: string;
  qty?: number;
  amount: number;
};

export const ITEMS_MARK = "Items:";
const ITEM_SEP = " ؛ ";

/** Names can't carry the characters the format splits on. */
const clean = (s: string) =>
  s.replace(/[|؛=×]/g, "/").replace(/\s+—\s+/g, " - ").replace(/\s+/g, " ").trim();

export function encodeDonationLines(lines: DonationLine[]): string {
  const parts = lines
    .filter((l) => l.target.trim())
    .map((l) => {
      const choice = l.choice?.trim() ? ` — ${clean(l.choice)}` : "";
      const qty = l.qty && l.qty > 1 ? ` ×${Math.round(l.qty)}` : "";
      return `${clean(l.target)}${choice}${qty} = ${Math.round(Number(l.amount) || 0)}`;
    });
  return parts.length ? `${ITEMS_MARK} ${parts.join(ITEM_SEP)}` : "";
}

const toNum = (s: string) =>
  Number(s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,٬\s]/g, "")) || 0;

/** The lines found in a donation's notes (empty when it has none). */
export function parseDonationLines(notes: string | null | undefined): DonationLine[] {
  const parts = String(notes ?? "").split(" | ").map((p) => p.trim());

  const items = parts.find((p) => p.startsWith(ITEMS_MARK));
  if (items) {
    return items
      .slice(ITEMS_MARK.length)
      .split("؛")
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((raw) => {
        const m = raw.match(/^(.*?)(?: — (.*?))?(?: ×(\d+))? = ([\d٠-٩.,٬]+)$/);
        if (!m) return { target: raw, amount: 0 };
        return { target: m[1].trim(), choice: m[2]?.trim() || undefined, qty: m[3] ? Number(m[3]) : undefined, amount: toNum(m[4]) };
      });
  }

  // Older format: «Programs: كفالة يتيم [كفالة شهرية × 2] (1,200 ج.م) + زكاة المال (500 ج.م)»
  const old = parts.find((p) => /^(Programs|Entities):/.test(p));
  if (!old) return [];
  return old
    .replace(/^(Programs|Entities):\s*/, "")
    .split(" + ")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^(.*?)(?: \[(.*)\])? \(([\d٠-٩.,٬]+) ج\.م\)$/);
      if (!m) return { target: raw, amount: 0 };
      return { target: m[1].trim(), choice: m[2]?.trim() || undefined, amount: toNum(m[3]) };
    });
}

/** The notes without the lines part (what is left to show as text). */
export function withoutDonationLines(details: string): string {
  return details
    .split(" | ")
    .filter((p) => !p.trim().startsWith(ITEMS_MARK) && !/^(Programs|Entities):/.test(p.trim()))
    .join(" | ");
}
