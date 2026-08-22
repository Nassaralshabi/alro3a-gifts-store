export const HERO_AUTOPLAY_DELAY = 2400;

export function getHeroSlideIndex(activeIndex: number, offset: number, slideCount: number) {
  if (slideCount <= 0) return 0;
  return ((activeIndex + offset) % slideCount + slideCount) % slideCount;
}

export function shouldAutoAdvance(slideCount: number, isPaused: boolean, prefersReducedMotion: boolean) {
  return slideCount > 1 && !isPaused && !prefersReducedMotion;
}
