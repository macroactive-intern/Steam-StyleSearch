import { describe, expect, it } from "vitest";
import { orderRange } from "./range";

describe("orderRange", () => {
  it("orders reversed numeric ranges", () => {
    expect(orderRange(9, 5)).toEqual({ from: 5, to: 9 });
  });

  it("preserves ordered and one-sided ranges", () => {
    expect(orderRange(5, 9)).toEqual({ from: 5, to: 9 });
    expect(orderRange(5, undefined)).toEqual({ from: 5, to: undefined });
    expect(orderRange(undefined, 9)).toEqual({ from: undefined, to: 9 });
  });
});
