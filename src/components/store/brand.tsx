export const BRAND_MARK = "/uploads/alrawaa-brand-mark.png";
export const BRAND_WORDMARK = "/uploads/alrawaa-wordmark.png";

const REPLACED_PRODUCT_IMAGES: Record<string, string> = {
  "/uploads/bulk-weej-import-028-c8967c8b-d663-47fa-bc9c-4b3146594c2c_8269b3de.png": "/uploads/processed/bulk-weej-import-028-alrawhaa.png",
};

/** Returns the original product image unless a source contains a verified brand replacement. */
export function brandedImage(src: string | null | undefined): string | null | undefined {
  if (!src || src.startsWith("data:")) return src;
  const [pathname, query = ""] = src.split("?", 2);
  const replacement = REPLACED_PRODUCT_IMAGES[pathname] ?? pathname;
  return `${replacement}${query ? `?${query}` : ""}`;
}
