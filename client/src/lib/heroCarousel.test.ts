import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getHeroSlideIndex, HERO_AUTOPLAY_DELAY, shouldAutoAdvance } from "./heroCarousel";

describe("hero carousel controls", () => {
  it("cycles forward for automatic playback and wraps after the final slide", () => {
    expect(getHeroSlideIndex(0, 1, 5)).toBe(1);
    expect(getHeroSlideIndex(4, 1, 5)).toBe(0);
  });

  it("cycles backward for the previous control and handles an empty carousel", () => {
    expect(getHeroSlideIndex(0, -1, 5)).toBe(4);
    expect(getHeroSlideIndex(0, 1, 0)).toBe(0);
  });

  it("autoplays only when multiple slides are available and motion is permitted", () => {
    expect(HERO_AUTOPLAY_DELAY).toBe(2400);
    expect(shouldAutoAdvance(5, false, false)).toBe(true);
    expect(shouldAutoAdvance(1, false, false)).toBe(false);
    expect(shouldAutoAdvance(5, true, false)).toBe(false);
    expect(shouldAutoAdvance(5, false, true)).toBe(false);
  });

  it("keeps hero banners clear of the overlaid logo badge while preserving slider media and controls", () => {
    const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(homeSource).toContain("const HERO_BRAND_LOGO");
    expect(homeSource).toContain("object-contain will-change-transform");
    expect(homeSource).not.toContain("hero-brand-badge");
    expect(homeSource).not.toContain("src={HERO_BRAND_LOGO} alt={isArabic ? \"شعار مطبعة الروعة\"");
    expect(homeSource).not.toContain("raed-gradient-overlay");
  });
});
