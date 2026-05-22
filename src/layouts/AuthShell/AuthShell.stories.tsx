import type { Meta, StoryObj } from "@storybook/react";

import { NotificationProvider } from "providers";

import { AuthShell } from "./AuthShell";

const meta = {
  title: "Layouts/AuthShell",
  component: AuthShell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
      </NotificationProvider>
    ),
  ],
  args: {
    children: (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <div className="w-full max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-text-muted">
            Demo content rendered inside <code>AuthShell</code>.
          </p>
        </div>
      </div>
    ),
  },
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithoutNotification: Story = {
  args: {
    withNotification: false,
  },
};
