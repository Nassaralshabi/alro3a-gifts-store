import { describe, expect, it } from "vitest";
import { getCatalogueSearchHref, getNextSearchOptionIndex, SEARCH_DEBOUNCE_MS, SEARCH_MINIMUM_LENGTH } from "./smartSearchBehavior";

describe("smart search behavior", () => {
  it("uses a short, explicit debounce and requires at least two characters", () => {
    expect(SEARCH_DEBOUNCE_MS).toBe(280);
    expect(SEARCH_MINIMUM_LENGTH).toBe(2);
  });

  it("cycles through results in both keyboard directions", () => {
    expect(getNextSearchOptionIndex(-1, 3, "ArrowDown")).toBe(0);
    expect(getNextSearchOptionIndex(2, 3, "ArrowDown")).toBe(0);
    expect(getNextSearchOptionIndex(0, 3, "ArrowUp")).toBe(2);
    expect(getNextSearchOptionIndex(1, 3, "ArrowUp")).toBe(0);
    expect(getNextSearchOptionIndex(0, 0, "ArrowDown")).toBe(-1);
  });

  it("creates an encoded catalogue-search destination", () => {
    expect(getCatalogueSearchHref(" بوكس هدية ")).toBe("/shop?search=%D8%A8%D9%88%D9%83%D8%B3%20%D9%87%D8%AF%D9%8A%D8%A9");
  });
});
