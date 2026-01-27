import type { Preview, Decorator } from "@@storybook/react";
import React from "react";

// Global styles (Tailwind via src/index.css)
import "../src/index.css";

// Providers used by components
import { ConfigProvider, NotificationProvider, ManagerProvider, AuthProvider } from "providers";
import { TranslationProvider } from "@sito/dashboard";
import { IManager } from "lib";
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

const manager = new IManager("http://localhost");

const translations: Record<string, string> = {
  "_accessibility:messages.empty": "No items to display",
  "_accessibility:buttons.closeDialog": "Close dialog",
  "_accessibility:ariaLabels.closeDialog": "Close dialog",
  "_accessibility:ariaLabels.ok": "Confirm",
  "_accessibility:buttons.ok": "OK",
  "_accessibility:buttons.cancel": "Cancel",
  "_accessibility:ariaLabels.cancel": "Cancel",
  "_accessibility:buttons.submit": "Submit",
  "_accessibility:ariaLabels.submit": "Submit",
  "_accessibility:buttons.openActions": "Open actions",
  "_accessibility:buttons.back": "Back",
  "_accessibility:buttons.toTop": "Back to top",
  "_accessibility:buttons.closeNotification": "Close notification",
  "_accessibility:ariaLabels.closeNotification": "Close notification",
  "_accessibility:buttons.deleteChip": "Delete chip {value}",
  "_accessibility:ariaLabels.deleteChip": "Delete chip {value}",
  "_accessibility:ariaLabels.closeMenu": "Close menu",
  "_pages:home.appName": "Demo App",
  "_pages:dashboard.title": "Dashboard",
  "_pages:settings.title": "Settings",
  "_pages:profile.title": "Profile",
  "_pages:onboarding.welcome.title": "Welcome to the App",
  "_pages:onboarding.welcome.body": "Get started by following a few steps.",
  "_pages:onboarding.finish.title": "You're all set!",
  "_pages:onboarding.finish.body": "Enjoy your experience.",
  "_accessibility:buttons.skip": "Skip",
  "_accessibility:ariaLabels.skip": "Skip",
  "_accessibility:buttons.next": "Next",
  "_accessibility:ariaLabels.next": "Next",
  "_accessibility:buttons.startAsGuest": "Start as guest",
  "_accessibility:buttons.signIn": "Sign in",
  "_accessibility:ariaLabels.start": "Start",
  "_pages:common.actions.import.form.inputs.file.label": "Select a file",
};

const t = (key: string) => translations[key] ?? key;

const withProviders: Decorator = (Story) => (
  <TranslationProvider t={t}>
    <ManagerProvider manager={manager}>
      <AuthProvider>
        <NotificationProvider>
          <ConfigProvider
            location={defaultLocation}
            navigate={() => {}}
            linkComponent={MockLink}
          >
            <Story />
          </ConfigProvider>
        </NotificationProvider>
      </AuthProvider>
    </ManagerProvider>
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
