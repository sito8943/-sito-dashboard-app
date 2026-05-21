import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";

import { AuthRecoveryView } from "./AuthRecoveryView";

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
  title: "Views/Auth/AuthRecoveryView",
  component: AuthRecoveryView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/auth/recovery" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    title: "Recover account",
    description: "Enter your email and we will send reset instructions.",
    emailLabel: "Email",
    emailRequiredMessage: "Email is required",
    submitLabel: "Send reset email",
    submitAriaLabel: "Send reset email",
    signInQuestion: "Remembered your password?",
    signInLabel: "Sign in",
    signInTo: "/auth/sign-in",
    onSubmit: async () => {},
  },
} satisfies Meta<typeof AuthRecoveryView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ForgotPasswordOnly: Story = {};

export const WithResendConfirmation: Story = {
  args: {
    secondaryActionLabel: "Resend confirmation email",
    secondaryActionAriaLabel: "Resend confirmation email",
    onSecondaryAction: async () => {},
  },
};

export const WithStatusMessage: Story = {
  args: {
    statusMessage: "We sent an email to user@example.com.",
    statusMessageVariant: "success",
  },
};

export const WithErrorStatusMessage: Story = {
  args: {
    statusMessage: "We could not send the recovery email.",
    statusMessageVariant: "error",
  },
};
