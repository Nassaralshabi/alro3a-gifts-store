export const BRAND_MARK = "/uploads/alrawaa-brand-mark.png";
export const BRAND_WORDMARK = "/uploads/alrawaa-wordmark.png";

export function brandedImage(src: string | null | undefined): string | null | undefined {
  if (!src || src.startsWith("data:") || src.includes("/branded/")) return src;
  const [pathname, query = ""] = src.split("?", 2);
  if (!pathname.startsWith("/uploads/")) return src;
  const filename = pathname.slice("/uploads/".length);
  const stem = filename.replace(/\.[^/.]+$/, "");
  return `/uploads/branded/${stem}.webp${query ? `?${query}` : ""}`;
}

type BrandWatermarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 rounded-lg p-1",
  md: "h-12 w-12 rounded-xl p-1.5",
  lg: "h-16 w-16 rounded-2xl p-2",
} as const;

/** Brand mark overlay used on product imagery without altering the source photo. */
export function BrandWatermark({ size = "sm", className = "" }: BrandWatermarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute end-3 bottom-3 z-[5] inline-flex items-center justify-center bg-white/90 shadow-[0_8px_18px_-10px_rgba(23,50,59,.9)] ring-1 ring-white/80 backdrop-blur-sm ${sizeClasses[size]} ${className}`}
    >
      <img src={BRAND_MARK} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
