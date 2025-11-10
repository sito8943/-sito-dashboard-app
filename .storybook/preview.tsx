import type { Preview, Decorator } from "@storybook/react";
import React from "react";

// Global styles (Tailwind via src/index.css)
import "../src/index.css";

// Providers used by components
import { ConfigProvider } from "providers";
import { TranslationProvider } from "@sito/dashboard";
import type { Location } from "lib";
import type { BaseLinkPropsType } from "components";

const MockLink = (props: BaseLinkPropsType) => {
  const { to, children, ...rest } = props;
  return (
    <a href={typeof to === "string" ? to : String(to)} {...rest}>
      {children}
    </a>
  );
};

const defaultLocation: Location = {
  pathname: "/",
  search: "",
  hash: "",
  state: {},
  key: "storybook",
};

const translations: Record<string, string> = {
  "_accessibility:messages.empty": "No items to display",
  "_accessibility:buttons.closeDialog": "Close dialog",
  "_accessibility:ariaLabels.closeDialog": "Close dialog",
  "_accessibility:ariaLabels.ok": "Confirm",
  "_accessibility:buttons.cancel": "Cancel",
  "_accessibility:buttons.openActions": "Open actions",
  "_accessibility:buttons.back": "Back",
};

const t = (key: string) => translations[key] ?? key;

const withProviders: Decorator = (Story) => (
  <TranslationProvider t={t}>
    <ConfigProvider
      location={defaultLocation}
      navigate={() => {}}
      linkComponent={MockLink}
    >
      <Story />
    </ConfigProvider>
  </TranslationProvider>
);

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
  decorators: [withProviders],
};

export default preview;
