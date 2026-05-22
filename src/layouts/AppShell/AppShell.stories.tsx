import type { Meta, StoryObj } from "@storybook/react";

import { NotificationProvider } from "providers";

import { AppShell } from "./AppShell";

const meta = {
  title: "Layouts/AppShell",
  component: AppShell,
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
      <main className="p-6 min-h-[200px]">
        <h1 className="text-2xl font-semibold">Route content</h1>
        <p className="text-sm text-text-muted">
          The current route renders here, between the header and footer slots.
        </p>
      </main>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithHeaderAndFooter: Story = {
  args: {
    header: (
      <header className="bg-base p-3 border-b">
        <strong>Header slot</strong>
      </header>
    ),
    footer: (
      <footer className="bg-base p-3 border-t text-sm text-text-muted">
        Footer slot
      </footer>
    ),
  },
};

export const WithBottomNavigationAndExtras: Story = {
  args: {
    header: (
      <header className="bg-base p-3 border-b">
        <strong>Header slot</strong>
      </header>
    ),
    footer: (
      <footer className="bg-base p-3 border-t text-sm text-text-muted">
        Footer slot
      </footer>
    ),
    bottomNavigation: (
      <nav className="bg-primary text-white p-3 text-center">
        BottomNavigation slot
      </nav>
    ),
    extras: (
      <div className="text-xs text-text-muted">
        Extras slot (Tooltip / PWA dialog)
      </div>
    ),
  },
};

export const WithoutNotification: Story = {
  args: {
    withNotification: false,
  },
};
