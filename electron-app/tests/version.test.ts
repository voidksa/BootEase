import { describe, expect, it } from "vitest";
import { compareVersions } from "../src/shared/version";

describe("compareVersions", () => {
  it("compares GitHub tags numerically", () => {
    expect(compareVersions("v2.0.0", "1.11.9")).toBe(1);
    expect(compareVersions("1.10.0", "v1.9.9")).toBe(1);
    expect(compareVersions("v1.1.1", "1.1.1")).toBe(0);
  });

  it("handles missing and prerelease components safely", () => {
    expect(compareVersions("2.0", "2.0.0")).toBe(0);
    expect(compareVersions("v2.1.0-beta.1", "2.0.9")).toBe(1);
    expect(compareVersions("invalid", "1.0.0")).toBe(-1);
  });
});
