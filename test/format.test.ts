import { describe, expect, it } from "vitest";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";

describe("format", () => {
  it("formats prices from minor units", () => {
    expect(formatPrice(null)).toBe("Free");
    expect(formatPrice({ amount: 1000, currency: "GBP" })).toBe("£10.00");
    expect(formatPrice({ amount: 500, currency: "JPY" })).toBe("JP¥500");
  });
  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("1 hr 30 min");
    expect(formatDuration(120)).toBe("2 hr");
  });
  it("shows the time in the lecture's time zone", () => {
    expect(formatTime("2030-01-10T18:00:00Z", "Asia/Karachi")).toMatch(/11:00\s?pm/i);
  });
});
