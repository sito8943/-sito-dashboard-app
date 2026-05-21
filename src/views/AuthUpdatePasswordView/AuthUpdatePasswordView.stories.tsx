import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";
import type { IAuthApiClient } from "lib";

import { AuthUpdatePasswordView } from "./AuthUpdatePasswordView";

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
  title: "Views/Auth/AuthUpdatePasswordView",
  component: AuthUpdatePasswordView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={
          {
            pathname: "/auth/update-password",
            search: "?token_hash=token&type=recovery",
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
    title: "Update password",
    passwordLabel: "New password",
    confirmPasswordLabel: "Confirm password",
    passwordRequiredMessage: "Password is required",
    confirmPasswordRequiredMessage: "Confirm your password",
    passwordMismatchMessage: "Passwords do not match",
    submitLabel: "Update password",
    submitAriaLabel: "Update password",
    signInQuestion: "Already updated it?",
    signInLabel: "Sign in",
    signInTo: "/auth/sign-in",
  },
} satisfies Meta<typeof AuthUpdatePasswordView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
