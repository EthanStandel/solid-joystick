import path from "path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
    lib: {
      entry: path.resolve(__dirname, "src/lib.ts"),
      name: "solid-joystick",
      fileName: format => `lib.${format}.js`,
    },
    rollupOptions: {
      external: ["solid-js"],
    },
  },
});
