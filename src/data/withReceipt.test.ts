import { describe, expect, it } from "vitest";
import { withReceipt } from "./casesApi";

describe("donation submit body", () => {
  it("stays JSON without a receipt", () => {
    const body = { amount: 150, program_id: 3 };
    expect(withReceipt(null, body)).toBe(body);
  });

  it("becomes multipart with the receipt as payment_receipt", () => {
    const file = new File(["x"], "receipt.png", { type: "image/png" });
    const fd = withReceipt(file, { amount: 150, program_id: 3, name: undefined, notes: "Items: كفالة يتيم = 150" }) as FormData;
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get("amount")).toBe("150");
    expect(fd.get("program_id")).toBe("3");
    expect(fd.has("name")).toBe(false);
    expect(fd.get("notes")).toBe("Items: كفالة يتيم = 150");
    expect((fd.get("payment_receipt") as File).name).toBe("receipt.png");
  });
});
