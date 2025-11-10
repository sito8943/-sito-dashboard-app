import type { Preview } from "@storybook/react";
import type { Decorator } from "@storybook/react";

// Global styles (Tailwind via src/index.css)
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: "padded",
  },
};

export default preview;
