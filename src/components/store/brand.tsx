export const BRAND_MARK = "/uploads/alrawaa-brand-mark.png";
export const BRAND_WORDMARK = "/uploads/alrawaa-wordmark.png";

const REPLACED_PRODUCT_IMAGES: Record<string, string> = {
  "/uploads/bulk-weej-import-028-c8967c8b-d663-47fa-bc9c-4b3146594c2c_8269b3de.png": "/uploads/processed/bulk-weej-import-028-alrawhaa.png",
  "/uploads/bulk-weej-import-114-8f7c33d9-d61b-4013-b081-eb139249611e_d7b07bf8.jpg": "/uploads/processed/bulk-weej-import-114-alrawhaa.png",
  "/uploads/bulk-weej-import-201-0e525fad-c4e5-4aed-b7c0-1a203887d553_943ae98b.jpg": "/uploads/processed/bulk-weej-import-201-alrawhaa.png",
  "/uploads/bulk-weej-import-218-cf4f9b54-84f4-4f54-b662-df071e9044d6_d6b5164e.jpg": "/uploads/processed/bulk-weej-import-218-alrawhaa.png",
  "/uploads/bulk-weej-import-219-67011767-0cfd-4061-948d-bb8ffff2bc80_0571fdff.jpg": "/uploads/processed/bulk-weej-import-219-alrawhaa.png",
  "/uploads/bulk-weej-import-220-05507c9f-78e3-46d8-b9b1-d3a80a414119_2e2b4cda.jpg": "/uploads/processed/bulk-weej-import-220-alrawhaa.png",
};

/** Returns the original product image unless a source contains a verified brand replacement. */
export function brandedImage(src: string | null | undefined): string | null | undefined {
  if (!src || src.startsWith("data:")) return src;
  const [pathname, query = ""] = src.split("?", 2);
  const replacement = REPLACED_PRODUCT_IMAGES[pathname] ?? pathname;
  return `${replacement}${query ? `?${query}` : ""}`;
}
