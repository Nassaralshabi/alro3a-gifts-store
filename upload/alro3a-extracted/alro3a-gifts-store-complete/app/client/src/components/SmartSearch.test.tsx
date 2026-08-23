// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SmartSearch from "./SmartSearch";

const mocks = vi.hoisted(() => ({ setLocation: vi.fn(), useQuery: vi.fn(), refetch: vi.fn() }));

vi.mock("@/contexts/LocaleContext", () => ({ useLocale: () => ({ isArabic: true }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { store: { catalog: { suggestions: { useQuery: mocks.useQuery } } } } }));
vi.mock("wouter", () => ({ useLocation: () => ["/", mocks.setLocation] }));

const matchingData = {
  products: [{ product: { slug: "sliding-gift-box", titleAr: "بوكس هدية فاخر", titleEn: "Premium Gift Box", imageUrl: null }, categoryTitleAr: "بوكسات وتغليف", categoryTitleEn: "Boxes & Packaging" }],
  categories: [{ slug: "boxes-packaging", titleAr: "بوكسات وتغليف", titleEn: "Boxes & Packaging", icon: "Boxes" }],
};

function queryState(input: { query: string }) {
  if (input.query === "بوكس") return { data: matchingData, isFetching: false, isError: false, refetch: mocks.refetch };
  return { data: undefined, isFetching: false, isError: false, refetch: mocks.refetch };
}

describe("SmartSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.setLocation.mockReset();
    mocks.refetch.mockReset();
    mocks.useQuery.mockImplementation(queryState);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows popular searches on focus before typing and navigates from a selected suggestion", () => {
    render(<SmartSearch />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByRole("region", { name: "عمليات بحث شائعة" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بوكسات هدايا" }));
    expect(mocks.setLocation).toHaveBeenCalledWith("/shop?search=%D8%A8%D9%88%D9%83%D8%B3");
  });

  it("debounces suggestions, exposes matching products and categories, then navigates the selected result", () => {
    render(<SmartSearch />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "بوكس" } });
    expect(screen.getByText("جارٍ البحث في الكتالوج...")).toBeTruthy();

    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByText("بوكس هدية فاخر")).toBeTruthy();
    expect(screen.getAllByText("بوكسات وتغليف")).toHaveLength(2);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const firstOption = screen.getAllByRole("option")[0];
    expect(firstOption.getAttribute("aria-selected")).toBe("true");
    fireEvent.submit(input.closest("form")!);
    expect(mocks.setLocation).toHaveBeenCalledWith("/products/sliding-gift-box");
  });

  it("closes with Escape or an outside pointer press", () => {
    render(<SmartSearch />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "بوكس" } });
    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("renders intentional empty and error states rather than treating an error as no results", () => {
    mocks.useQuery.mockImplementation(({ query }: { query: string }) => query === "نادر" ? { data: { products: [], categories: [] }, isFetching: false, isError: false, refetch: mocks.refetch } : { data: undefined, isFetching: false, isError: false, refetch: mocks.refetch });
    const { rerender } = render(<SmartSearch />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "نادر" } });
    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByText("لا توجد اقتراحات مطابقة الآن")).toBeTruthy();

    mocks.useQuery.mockImplementation(({ query }: { query: string }) => query === "تعذر" ? { data: undefined, isFetching: false, isError: true, refetch: mocks.refetch } : { data: undefined, isFetching: false, isError: false, refetch: mocks.refetch });
    rerender(<SmartSearch />);
    fireEvent.change(input, { target: { value: "تعذر" } });
    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByText("تعذر تحميل الاقتراحات حالياً")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "إعادة المحاولة" }));
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });
});
