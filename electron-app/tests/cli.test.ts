import { describe, expect, it } from "vitest";
import { actionFromArguments } from "../src/shared/cli";

describe("command-line compatibility", () => {
  it("preserves BIOS aliases", () => {
    expect(actionFromArguments(["BootEase.exe", "/bios"])).toBe("bios");
    expect(actionFromArguments(["--bios"])).toBe("bios");
  });

  it("maps safe mode to Windows Recovery like the original app", () => {
    expect(actionFromArguments(["/safe"])).toBe("recovery");
    expect(actionFromArguments(["-recovery"])).toBe("recovery");
  });

  it("ignores unrelated Chromium and file arguments", () => {
    expect(
      actionFromArguments(["electron.exe", ".", "--disable-gpu"])
    ).toBeUndefined();
  });
});
