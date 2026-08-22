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
    expect(HERO_AUTOPLAY_DELAY).toBe(2000);
    expect(shouldAutoAdvance(5, false, false)).toBe(true);
    expect(shouldAutoAdvance(1, false, false)).toBe(false);
    expect(shouldAutoAdvance(5, true, false)).toBe(false);
    expect(shouldAutoAdvance(5, false, true)).toBe(false);
  });

  it("keeps the approved Al Rawaa badge above every active hero banner", () => {
    const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const activeSlideTransitionEnd = homeSource.indexOf("</AnimatePresence>");
    const brandBadgePosition = homeSource.indexOf("src={HERO_BRAND_LOGO}");

    expect(homeSource).toContain("const HERO_BRAND_LOGO");
    expect(homeSource).toContain("absolute right-4 top-4 z-20");
    expect(homeSource).toContain('alt={isArabic ? "شعار مطبعة الروعة" : "Al Rawaa Printing logo"}');
    expect(brandBadgePosition).toBeGreaterThan(activeSlideTransitionEnd);
  });
});
