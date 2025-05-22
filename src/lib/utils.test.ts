import { formatMinutes } from "./utils";
import { describe, it, expect } from "vitest";

describe("formatMinutes", () => {
  it("should format minutes into hours and minutes when appropriate", () => {
    // Basic cases
    expect(formatMinutes(70)).toBe("1h 10m");
    expect(formatMinutes(0)).toBe("0m");
    expect(formatMinutes(1)).toBe("1m");

    // Edge cases
    expect(formatMinutes(60)).toBe("1h 0m");
    expect(formatMinutes(59)).toBe("59m");
    expect(formatMinutes(61)).toBe("1h 1m");

    // Larger numbers
    expect(formatMinutes(60000)).toBe("1000h 0m");
    expect(formatMinutes(90)).toBe("1h 30m");
    expect(formatMinutes(120)).toBe("2h 0m");
    expect(formatMinutes(1439)).toBe("23h 59m");
  });

  it("should handle decimal values by rounding down", () => {
    expect(formatMinutes(70.8)).toBe("1h 10m");
    expect(formatMinutes(1.9)).toBe("1m");
    expect(formatMinutes(0.4)).toBe("0m");
  });

  it("should throw an error for negative values", () => {
    expect(() => formatMinutes(-70)).toThrow("Minutes cannot be negative");
    expect(() => formatMinutes(-1)).toThrow("Minutes cannot be negative");
    expect(() => formatMinutes(-60)).toThrow("Minutes cannot be negative");
  });
});
