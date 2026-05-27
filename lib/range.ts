export interface OrderedRange {
  from?: number;
  to?: number;
}

export function orderRange(
  from: number | undefined,
  to: number | undefined,
): OrderedRange {
  if (typeof from === "number" && typeof to === "number" && from > to) {
    return { from: to, to: from };
  }

  return { from, to };
}
