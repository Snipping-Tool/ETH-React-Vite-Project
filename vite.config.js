import { defineConfig } from "vite";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
const production = process.env.NODE_ENV === "production";

export default defineConfig({
  base: "",
  root: "./",
  plugins: [
    react(),
    !production &&
      nodePolyfills({
        include: [
          "node_modules/**/*.js",
          new RegExp("node_modules/.vite/.*js"),
        ],
      }),
  ],
  resolve: {
    alias: {
      "@img": resolve(__dirname, "./assets/images/"),
      "@context": resolve(__dirname, "./src/context/"),
      "@utils": resolve(__dirname, "./src/utils/"),
      util$: resolve(__dirname, "node_modules/util"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: false,
  },
  optimizeDeps: {},
});
