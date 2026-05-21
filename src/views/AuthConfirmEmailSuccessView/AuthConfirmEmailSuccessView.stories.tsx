import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";
import type { IAuthApiClient } from "lib";

import { AuthConfirmEmailSuccessView } from "./AuthConfirmEmailSuccessView";

const MockLink: ComponentType<BaseLinkPropsType> = ({
  children,
  to,
  className,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const authApi: IAuthApiClient = {
  async forgotPassword() {},
  async resetPassword() {},
  async resendConfirmEmail() {},
  async confirmEmail() {},
};

const meta = {
  title: "Views/Auth/AuthConfirmEmailSuccessView",
  component: AuthConfirmEmailSuccessView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={
          {
            pathname: "/auth/confirm-email",
            search: "?token_hash=token&type=email",
          } as Location
        }
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    authApi,
    title: "Email confirmed",
    description: "Your account is ready. You can now sign in.",
    verifyingLabel: "Verifying email...",
    toSignInLabel: "Go to sign in",
    toSignInAriaLabel: "Go to sign in",
    signInTo: "/auth/sign-in",
    errorTo: "/auth/confirm-email-error",
  },
} satisfies Meta<typeof AuthConfirmEmailSuccessView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
