import { describe, test, expect } from "vitest";
import { parseIocSamples } from "../tools/ioc.js";

describe("parseIocSamples", () => {
  test("drops QC-nulled NA rows and parses stime as UTC", () => {
    const samples = parseIocSamples([
      { slevel: 1.25, stime: "2025-07-14 00:10:00" },
      { slevel: "NA", stime: "2025-07-14 00:20:00" },
      { slevel: -0.5, stime: "2025-07-14 00:30:00" },
    ]);
    expect(samples).toHaveLength(2);
    expect(samples[0]!.time.toISOString()).toBe("2025-07-14T00:10:00.000Z");
    expect(samples[0]!.level).toBe(1.25);
    expect(samples[1]!.level).toBe(-0.5);
  });
});
