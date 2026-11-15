import { describe, expect, it } from "vitest";
import { composeDonationNotes, splitDonationNotes, DONOR_NOTE_MAX } from "./donorNote";

describe("donor note", () => {
  it("puts the note last, after the system parts", () => {
    const s = composeDonationNotes(["Programs: كفالة يتيم (500 ج.م)", "", "Bank: بنك مصر"], "  عن روح  والدي \n رحمه الله ");
    expect(s).toBe("Programs: كفالة يتيم (500 ج.م) | Bank: بنك مصر | ملاحظة المتبرع: عن روح والدي رحمه الله");
  });

  it("omits an empty note", () => {
    expect(composeDonationNotes(["Programs: x"], "   ")).toBe("Programs: x");
  });

  it("caps the length", () => {
    const s = composeDonationNotes([], "a".repeat(DONOR_NOTE_MAX + 50));
    expect(splitDonationNotes(s).donorNote).toHaveLength(DONOR_NOTE_MAX);
  });

  it("splits it back even when the donor typed a separator", () => {
    const s = composeDonationNotes(["Programs: x"], "اتصلوا بعد العصر | شكرًا");
    expect(splitDonationNotes(s)).toEqual({ donorNote: "اتصلوا بعد العصر | شكرًا", details: "Programs: x" });
  });

  it("keeps old notes as details", () => {
    expect(splitDonationNotes("تبرع عام — تبرع سريع")).toEqual({ donorNote: "", details: "تبرع عام — تبرع سريع" });
    expect(splitDonationNotes(null)).toEqual({ donorNote: "", details: "" });
  });
});
