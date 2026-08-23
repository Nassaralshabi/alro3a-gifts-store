/**
 * Magic-bytes signature validation — never trust client MIME type.
 * Shared between the upload API and unit tests.
 */
export function sniffImage(buf: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return ".png";
  // GIF: GIF87a / GIF89a
  if (buf.length > 6 && buf.toString("ascii", 0, 3) === "GIF") return ".gif";
  // WEBP: RIFF....WEBP
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  // SVG intentionally rejected — scriptable content (stored-XSS vector)
  return null;
}
