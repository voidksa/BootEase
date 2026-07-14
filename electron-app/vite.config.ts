import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "src/renderer"),
  publicDir: "public",
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/renderer"),
    emptyOutDir: false,
    sourcemap: true,
    target: "chrome142"
  }
});
