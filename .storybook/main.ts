import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { mergeAlias } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

type NamedPlugin = {
  name?: unknown;
  api?: { name?: unknown };
};

const getPluginName = (plugin: unknown): string => {
  if (!plugin || typeof plugin !== "object") return "";
  const { name, api } = plugin as NamedPlugin;
  if (typeof name === "string") return name;
  return typeof api?.name === "string" ? api.name : "";
};

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)", "../src/**/*.mdx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = mergeAlias(viteConfig.resolve.alias, {
      components: resolve(__dirname, "../src/components"),
      providers: resolve(__dirname, "../src/providers"),
      lib: resolve(__dirname, "../src/lib"),
      hooks: resolve(__dirname, "../src/hooks"),
      layouts: resolve(__dirname, "../src/layouts"),
      views: resolve(__dirname, "../src/views"),
    });

    if (Array.isArray(viteConfig.plugins)) {
      viteConfig.plugins = viteConfig.plugins.filter((plugin) => {
        const name = getPluginName(plugin);
        return !name.includes("dts") && !name.includes("lib-inject-css");
      });
    }

    return viteConfig;
  },
};

export default config;
