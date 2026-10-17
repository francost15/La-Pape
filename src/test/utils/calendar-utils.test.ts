import { describe, expect, it } from "vitest";
import { sameDay, toDateOnly } from "@/components/search/custom-range/calendar-utils";

describe("sameDay", () => {
  it("ignora la hora al comparar el mismo día", () => {
    const morning = new Date(2026, 9, 17, 8, 15);
    const night = new Date(2026, 9, 17, 23, 59);
    expect(sameDay(morning, night)).toBe(true);
  });

  it("distingue días distintos y una fecha nula", () => {
    expect(sameDay(new Date(2026, 9, 17), new Date(2026, 9, 18))).toBe(false);
    expect(sameDay(null, new Date(2026, 9, 17))).toBe(false);
  });
});

describe("toDateOnly", () => {
  it("deja la fecha a medianoche local", () => {
    const date = toDateOnly(new Date(2026, 9, 17, 15, 45, 30));
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(17);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});
