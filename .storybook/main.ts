import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)", "../src/**/*.mdx"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  core: {},
  // Mirror Vite aliases used in vite.config.ts so stories can import from aliases
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      components: resolve(__dirname, "../src/components"),
      providers: resolve(__dirname, "../src/providers"),
      lib: resolve(__dirname, "../src/lib"),
      hooks: resolve(__dirname, "../src/hooks"),
      layouts: resolve(__dirname, "../layouts"),
      views: resolve(__dirname, "../views"),
    };
    try {
      const mod: any = await import("@tailwindcss/vite");
      const tailwindcss = mod.default ?? mod;
      config.plugins = [...(config.plugins ?? []), tailwindcss()];
    } catch (e) {
      // If the Tailwind plugin cannot be imported, continue without it
    }
    return config;
  },
};

export default config;
