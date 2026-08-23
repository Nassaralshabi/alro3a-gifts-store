import { describe, it, expect } from "vitest";
import { sniffImage } from "../imageSniff";

/** Unit tests for magic-bytes image validation (src/lib/imageSniff.ts). */

describe("sniffImage", () => {
  const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const GIF = Buffer.from("GIF89a" + "\x00\x00\x00", "ascii");
  const WEBP = Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    Buffer.from([0x24, 0x00, 0x00, 0x00]),
    Buffer.from("WEBP", "ascii"),
    Buffer.from("VP8 ", "ascii"),
  ]);

  it("recognizes real JPEG signature", () => {
    expect(sniffImage(JPEG)).toBe(".jpg");
  });

  it("recognizes real PNG signature", () => {
    expect(sniffImage(PNG)).toBe(".png");
  });

  it("recognizes real GIF signature", () => {
    expect(sniffImage(GIF)).toBe(".gif");
  });

  it("recognizes real WEBP signature", () => {
    expect(sniffImage(WEBP)).toBe(".webp");
  });

  it("rejects text disguised as .jpg (stored-XSS vector)", () => {
    const fake = Buffer.from("this is definitely not an image", "utf-8");
    expect(sniffImage(fake)).toBeNull();
  });

  it("rejects SVG (scriptable content)", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', "utf-8");
    expect(sniffImage(svg)).toBeNull();
  });

  it("rejects HTML with script tag", () => {
    const html = Buffer.from("<html><script>alert(document.cookie)</script></html>", "utf-8");
    expect(sniffImage(html)).toBeNull();
  });

  it("rejects empty buffers", () => {
    expect(sniffImage(Buffer.alloc(0))).toBeNull();
  });

  it("rejects truncated PNG header", () => {
    const truncated = PNG.subarray(0, 4);
    expect(sniffImage(truncated)).toBeNull();
  });
});
