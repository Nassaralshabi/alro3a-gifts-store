// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

function BrokenPage() {
  throw new Error("ordinary component error");
  return null;
}

describe("ErrorBoundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("offers reload and a safe return to the homepage without exposing production diagnostics", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<ErrorBoundary><BrokenPage /></ErrorBoundary>);

    expect(screen.getByRole("button", { name: "إعادة تحميل الصفحة" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /العودة إلى الصفحة الرئيسية/ }).getAttribute("href")).toBe("/");
    expect(screen.queryByText("ordinary component error")).toBeNull();
  });
});
