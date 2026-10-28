import { readFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";
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

// libInjectCss emits `import "./x.css";` in every format. In a .cjs file that is
// a syntax error, so CommonJS output gets `require("./x.css");` instead.
const cjsCssRequire = (): Plugin => ({
  name: "cjs-css-require",
  enforce: "post",
  renderChunk(code, _chunk, options) {
    if (options.format !== "cjs") return null;
    return code.replace(
      /import\s*(["'])(\.\/[^"']+\.css)\1;?/g,
      (_match, quote: string, path: string) =>
        `require(${quote}${path}${quote});`,
    );
  },
});

export default defineConfig(() => {
  const isVitest = process.env.VITEST === "true";

  return {
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": srcPath,
      },
    },
    plugins: [
      react(),
      ...(!isVitest
        ? [
            dts({
              insertTypesEntry: true,
              skipDiagnostics: true,
              entryRoot: "src",
              exclude: [
                "tests/**",
                "stories/**",
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.stories.ts",
                "**/*.stories.tsx",
              ],
            }),
            libInjectCss(),
            cjsCssRequire(),
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
      setupFiles: "./tests/setup.ts",
      include: ["tests/**/*.test.{ts,tsx}"],
      exclude: ["node_modules", "dist"],
      minWorkers: 1,
      maxWorkers: 2,
    },
  };
});
