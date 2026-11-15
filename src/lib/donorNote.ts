/**
 * The donor's own note («ملاحظات») travels inside the donation's `notes` field, after the
 * breakdown the form writes there ("Programs: … | Bank: …"). It is always the LAST part, behind a
 * fixed marker, so the dashboard can show it apart from the system text even when the donor
 * typed " | " in it.
 */
export const DONOR_NOTE_MAX = 300;
export const DONOR_NOTE_MARK = "ملاحظة المتبرع:";

/** Collapse whitespace / new lines and cap the length. */
export function cleanDonorNote(note: string | null | undefined): string {
  return (note ?? "").replace(/\s+/g, " ").trim().slice(0, DONOR_NOTE_MAX);
}

/** The notes text sent with a donation: system parts first, the donor's note last. */
export function composeDonationNotes(parts: Array<string | null | undefined | false>, donorNote?: string | null): string {
  const note = cleanDonorNote(donorNote);
  return [...parts.filter((p): p is string => !!p && !!p.trim()), note ? `${DONOR_NOTE_MARK} ${note}` : ""]
    .filter(Boolean)
    .join(" | ");
}

/** Split stored notes into the donor's note and the rest (system text). */
export function splitDonationNotes(notes: string | null | undefined): { donorNote: string; details: string } {
  const text = (notes ?? "").trim();
  const at = text.indexOf(DONOR_NOTE_MARK);
  if (at < 0) return { donorNote: "", details: text };
  return {
    donorNote: text.slice(at + DONOR_NOTE_MARK.length).trim(),
    details: text.slice(0, at).replace(/\s*\|\s*$/, "").trim(),
  };
}
