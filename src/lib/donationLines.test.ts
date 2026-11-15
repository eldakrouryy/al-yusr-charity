import { describe, expect, it } from "vitest";
import { encodeDonationLines, parseDonationLines, withoutDonationLines } from "./donationLines";
import { composeDonationNotes, splitDonationNotes } from "./donorNote";

describe("donation lines", () => {
  const lines = [
    { target: "كفالة يتيم", choice: "كفالة شهرية", qty: 2, amount: 1200 },
    { target: "حملة ستر", choice: "سقف منزل", amount: 3000 },
    { target: "زكاة المال", choice: "تبرع عام", amount: 500 },
  ];

  it("round-trips through the notes, next to the bank and the donor's note", () => {
    const notes = composeDonationNotes([encodeDonationLines(lines), "Bank: CIB (100)"], "عن روح والدي");
    const { donorNote, details } = splitDonationNotes(notes);
    expect(donorNote).toBe("عن روح والدي");
    expect(parseDonationLines(details)).toEqual([
      { target: "كفالة يتيم", choice: "كفالة شهرية", qty: 2, amount: 1200 },
      { target: "حملة ستر", choice: "سقف منزل", qty: undefined, amount: 3000 },
      { target: "زكاة المال", choice: "تبرع عام", qty: undefined, amount: 500 },
    ]);
    expect(withoutDonationLines(details)).toBe("Bank: CIB (100)");
  });

  it("keeps names with separator characters readable", () => {
    const s = encodeDonationLines([{ target: "حملة | ستر = 2026", choice: "سقف — منزل", amount: 10 }]);
    expect(parseDonationLines(s)).toEqual([{ target: "حملة / ستر / 2026", choice: "سقف - منزل", qty: undefined, amount: 10 }]);
  });

  it("reads the older «Programs:» notes", () => {
    const old = "Programs: كفالة يتيم [كفالة شهرية × 2] (1,200 ج.م) + زكاة المال (500 ج.م)";
    expect(parseDonationLines(old)).toEqual([
      { target: "كفالة يتيم", choice: "كفالة شهرية × 2", amount: 1200 },
      { target: "زكاة المال", choice: undefined, amount: 500 },
    ]);
  });

  it("returns nothing for notes without lines", () => {
    expect(parseDonationLines("تبرع عام — تبرع سريع")).toEqual([]);
    expect(parseDonationLines(null)).toEqual([]);
    expect(encodeDonationLines([])).toBe("");
  });
});
