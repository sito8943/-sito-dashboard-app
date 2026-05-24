import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";

import { AuthSignInView } from "./AuthSignInView";

const MockLink: ComponentType<BaseLinkPropsType> = ({
  children,
  to,
  className,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const meta = {
  title: "Views/Auth/AuthSignInView",
  component: AuthSignInView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/auth/sign-in" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    title: "Sign in",
    emailLabel: "Email",
    passwordLabel: "Password",
    rememberLabel: "Remember me",
    emailRequiredMessage: "Email is required",
    passwordRequiredMessage: "Password is required",
    submitLabel: "Sign in",
    submitAriaLabel: "Sign in",
    signUpQuestion: "Don't have an account?",
    signUpLabel: "Create one",
    signUpTo: "/auth/sign-up",
    recoveryQuestion: "Forgot your password?",
    recoveryLabel: "Recover account",
    recoveryTo: "/auth/recovery",
    onSubmit: async () => {},
  },
} satisfies Meta<typeof AuthSignInView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithBackButton: Story = {
  args: {
    showBackButton: true,
    backButtonLabel: "Back",
  },
};
