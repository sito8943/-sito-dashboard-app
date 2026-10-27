import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import dts from "vite-plugin-dts";

const srcPath = resolve(__dirname, "src");

// Every dependency and peer stays external (subpaths included), so the bundle
// never inlines a package that consumers also install.
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const externalPackages = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.peerDependencies,
});
const isExternal = (id: string) =>
  externalPackages.some((name) => id === name || id.startsWith(`${name}/`));

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
              skipDiagnostics: true,
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
        entry: {
          "dashboard-app": resolve(__dirname, "src/main.ts"),
          i18n: resolve(__dirname, "src/i18n.ts"),
        },
        name: "@sito/dashboard-app",
        fileName: (format, entryName) =>
          entryName === "i18n"
            ? `i18n.${format === "es" ? "js" : "cjs"}`
            : `dashboard-app.${format === "es" ? "js" : "cjs"}`,
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: isExternal,
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
