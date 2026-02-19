import { resolve } from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import dts from "vite-plugin-dts";

const srcPath = resolve(__dirname, "src");

export default defineConfig({
  resolve: {
    alias: {
      components: resolve(srcPath, "components"),
      providers: resolve(srcPath, "providers"),
      lib: resolve(srcPath, "lib"),
      hooks: resolve(srcPath, "hooks"),
      layouts: resolve(__dirname, "layouts"),
      views: resolve(__dirname, "views"),
    },
  },
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),
    libInjectCss(),
    tailwindcss(),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "@sito/dashboard-app",
      fileName: "dashboard-app",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@emotion/css",
        "@sito/dashboard",
        "@tanstack/react-query",
        "@fortawesome/fontawesome-svg-core",
        "@fortawesome/free-brands-svg-icons",
        "@fortawesome/free-regular-svg-icons",
        "@fortawesome/free-solid-svg-icons",
        "@fortawesome/react-fontawesome",
      ],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
  },
});
