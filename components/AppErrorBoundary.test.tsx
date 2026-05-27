// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary";

function BrokenChild() {
  throw new Error("boom");
}

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders a fallback when a child component throws", () => {
    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("can reset back to rendering children", () => {
    let shouldThrow = true;

    function SometimesBrokenChild() {
      if (shouldThrow) {
        throw new Error("boom");
      }

      return <p>Recovered content</p>;
    }

    render(
      <AppErrorBoundary>
        <SometimesBrokenChild />
      </AppErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered content")).toBeTruthy();
  });
});
