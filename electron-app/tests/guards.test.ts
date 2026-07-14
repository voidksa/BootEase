import { describe, expect, it } from "vitest";
import {
  isActionId,
  sanitizeSettingsPatch
} from "../src/shared/guards";

describe("IPC input guards", () => {
  it("accepts only the fixed power-action allowlist", () => {
    expect(isActionId("bios")).toBe(true);
    expect(isActionId("explorer")).toBe(true);
    expect(isActionId("shutdown /s /t 0")).toBe(false);
    expect(isActionId({ action: "bios" })).toBe(false);
  });

  it("drops unknown settings values and properties", () => {
    expect(
      sanitizeSettingsPatch({
        language: "ar",
        theme: "dark",
        injected: "value"
      })
    ).toEqual({ language: "ar", theme: "dark" });

    expect(
      sanitizeSettingsPatch({ language: "fr", theme: "custom" })
    ).toEqual({});
  });
});
