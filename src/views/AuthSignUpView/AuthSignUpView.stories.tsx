import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import type { BaseLinkPropsType } from "components";
import { ConfigProvider } from "providers";

import { AuthSignUpView } from "./AuthSignUpView";

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
  title: "Views/Auth/AuthSignUpView",
  component: AuthSignUpView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/auth/sign-up" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <Story />
      </ConfigProvider>
    ),
  ],
  args: {
    title: "Create account",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    nameRequiredMessage: "Name is required",
    emailRequiredMessage: "Email is required",
    passwordRequiredMessage: "Password is required",
    confirmPasswordRequiredMessage: "Confirm your password",
    passwordMismatchMessage: "Passwords do not match",
    submitLabel: "Create account",
    submitAriaLabel: "Create account",
    signInQuestion: "Already have an account?",
    signInLabel: "Sign in",
    signInTo: "/auth/sign-in",
    onSubmit: async () => {},
  },
} satisfies Meta<typeof AuthSignUpView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithoutName: Story = {
  args: {
    nameLabel: undefined,
    nameRequiredMessage: undefined,
  },
};
