import { resolve } from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import dts from "vite-plugin-dts";

const srcPath = resolve(__dirname, "src");

export default defineConfig(() => {
  const isVitest = process.env.VITEST === "true";

  return {
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        components: resolve(srcPath, "components"),
        providers: resolve(srcPath, "providers"),
        lib: resolve(srcPath, "lib"),
        hooks: resolve(srcPath, "hooks"),
        layouts: resolve(srcPath, "layouts"),
        views: resolve(srcPath, "views"),
      },
    },
    plugins: [
      react(),
      ...(!isVitest
        ? [
            dts({
              insertTypesEntry: true,
              exclude: [
                "src/**/*.stories.ts",
                "src/**/*.test.ts",
                "src/**/*.test.tsx",
                "src/**/*.stories.tsx",
                "src/test/**",
              ],
              beforeWriteFile: (filePath, content) => {
                const normalizedPath = filePath.replaceAll("\\", "/");
                if (
                  normalizedPath.endsWith(".test.d.ts") ||
                  normalizedPath.endsWith(".stories.d.ts") ||
                  normalizedPath.includes("/test/")
                )
                  return false;
                return { filePath, content };
              },
            }),
            libInjectCss(),
            tailwindcss(),
          ]
        : []),
    ],
    build: {
      copyPublicDir: false,
      target: "es2020",
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
          "react/jsx-dev-runtime",
          "react-dom",
          "@sito/dashboard",
          "@sito/ui",
          "@tanstack/react-query",
          "@supabase/supabase-js",
          "react-hook-form",
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
      minWorkers: 1,
      maxWorkers: 2,
    },
  };
});
