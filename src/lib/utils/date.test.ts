import {
  formatForDatetimeLocal,
  getShortFormattedDateTime,
} from "./date";
import { describe, expect, it } from "vitest";

describe("date utils", () => {
  it("formats short date-time as dd/mm/yy hh:mm", () => {
    expect(getShortFormattedDateTime("2025-07-29T15:42:00")).toBe(
      "29/07/25 15:42"
    );
  });

  it("formats datetime-local value as yyyy-mm-ddThh:mm", () => {
    expect(formatForDatetimeLocal("2025-07-29T15:42:00")).toBe(
      "2025-07-29T15:42"
    );
  });
});
