import type { ActionId } from "./contracts";

export function actionFromArguments(
  arguments_: readonly string[]
): ActionId | undefined {
  for (const rawArgument of arguments_) {
    const argument = rawArgument.toLowerCase();
    if (["/bios", "-bios", "--bios"].includes(argument)) {
      return "bios";
    }
    if (
      [
        "/recovery",
        "-recovery",
        "--recovery",
        "/safe",
        "-safe",
        "--safe"
      ].includes(argument)
    ) {
      return "recovery";
    }
    if (["/restart", "-restart", "--restart"].includes(argument)) {
      return "restart";
    }
  }
  return undefined;
}
