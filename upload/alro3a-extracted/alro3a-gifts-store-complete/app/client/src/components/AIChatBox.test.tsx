// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { AIChatBox } from "./AIChatBox";

describe("AIChatBox", () => {
  it("renders assistant content as literal text rather than parsed HTML", () => {
    const content = '<img src=x onerror="alert(1)">';
    const { container } = render(<AIChatBox messages={[{ role: "assistant", content }]} onSendMessage={() => undefined} />);

    expect(screen.getByText(content)).toBeTruthy();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });
});
