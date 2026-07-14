import { describe, expect, it } from "vitest";
import { normalizeSystemInfo } from "../src/main/services/system-info";

describe("system information normalization", () => {
  it("normalizes a complete UEFI response", () => {
    expect(
      normalizeSystemInfo(
        {
          Manufacturer: "Micro-Star International",
          Model: "MS-7E02",
          MotherboardManufacturer: "MSI",
          MotherboardModel: "PRO B650-P",
          BiosVersion: "C.01",
          BiosMode: "UEFI",
          SecureBoot: "enabled",
          OsName: "Microsoft Windows 11 Pro",
          OsVersion: "10.0.26100",
          Architecture: "64-bit"
        },
        "2026-07-14T00:00:00.000Z"
      )
    ).toMatchObject({
      biosMode: "UEFI",
      secureBoot: "enabled",
      biosVersion: "C.01",
      capturedAt: "2026-07-14T00:00:00.000Z"
    });
  });

  it("does not trust unexpected firmware states", () => {
    const result = normalizeSystemInfo({
      BiosMode: "Other",
      SecureBoot: "yes"
    });
    expect(result.biosMode).toBe("Unknown");
    expect(result.secureBoot).toBe("unknown");
  });
});
