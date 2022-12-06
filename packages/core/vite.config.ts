import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "esnext",
    minify: "terser",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ftc",
      formats: ["es", "umd", "iife"],
    },
    rollupOptions: {
      plugins: [],
    },
  },
});
