import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";

import { AuthConfirmEmailErrorView } from "./AuthConfirmEmailErrorView";

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
  title: "Views/Auth/AuthConfirmEmailErrorView",
  component: AuthConfirmEmailErrorView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/auth/confirm-email-error" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    title: "We couldn't confirm your email",
    description: "The link may have expired. Request a new one or sign in.",
    resendLabel: "Resend email",
    resendAriaLabel: "Resend email",
    resendTo: "/auth/recovery",
    toSignInLabel: "Go to sign in",
    toSignInAriaLabel: "Go to sign in",
    signInTo: "/auth/sign-in",
  },
} satisfies Meta<typeof AuthConfirmEmailErrorView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
