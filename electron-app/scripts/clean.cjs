const { rmSync } = require("node:fs");
const { resolve } = require("node:path");

for (const directory of ["dist", "coverage"]) {
  rmSync(resolve(__dirname, "..", directory), {
    recursive: true,
    force: true
  });
}
