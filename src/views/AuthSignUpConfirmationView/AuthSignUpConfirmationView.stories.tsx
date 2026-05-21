import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";

import { AuthSignUpConfirmationView } from "./AuthSignUpConfirmationView";

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
  title: "Views/Auth/AuthSignUpConfirmationView",
  component: AuthSignUpConfirmationView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/auth/sign-up-confirmation" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    title: "Check your email",
    description: "We sent a confirmation link to user@example.com.",
    toSignInLabel: "Go to sign in",
    toSignInAriaLabel: "Go to sign in",
    onSignIn: () => {},
  },
} satisfies Meta<typeof AuthSignUpConfirmationView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithResendConfirmation: Story = {
  args: {
    resendLabel: "Resend email",
    resendAriaLabel: "Resend email",
    onResendConfirmEmail: async () => {},
  },
};

export const Resending: Story = {
  args: {
    resendLabel: "Resend email",
    resendAriaLabel: "Resend email",
    isResending: true,
    onResendConfirmEmail: async () => {},
  },
};
