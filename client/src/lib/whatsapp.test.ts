import { describe, expect, it } from "vitest";
import { buildWhatsAppLink } from "./whatsapp";

describe("buildWhatsAppLink", () => {
  it("keeps the admin-managed WhatsApp endpoint and encodes a preset message", () => {
    expect(buildWhatsAppLink("https://api.whatsapp.com/send?phone=971500000000", "مرحباً من المتجر")).toBe("https://api.whatsapp.com/send?phone=971500000000&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B+%D9%85%D9%86+%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1");
  });

  it("falls back to the configured default endpoint when a malformed link is supplied", () => {
    expect(buildWhatsAppLink("not a link")).toBe("https://wa.me/971521401021");
  });
});
