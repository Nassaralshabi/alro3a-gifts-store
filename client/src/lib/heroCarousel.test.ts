import { describe, expect, it } from "vitest";
import { getHeroSlideIndex, shouldAutoAdvance } from "./heroCarousel";

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
    expect(shouldAutoAdvance(5, false, false)).toBe(true);
    expect(shouldAutoAdvance(1, false, false)).toBe(false);
    expect(shouldAutoAdvance(5, true, false)).toBe(false);
    expect(shouldAutoAdvance(5, false, true)).toBe(false);
  });
});
