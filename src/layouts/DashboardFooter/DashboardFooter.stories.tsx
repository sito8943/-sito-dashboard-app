import type { Meta, StoryObj } from "@storybook/react";

import { DashboardFooter } from "./DashboardFooter";

const meta = {
  title: "Layouts/DashboardFooter",
  component: DashboardFooter,
  tags: ["autodocs"],
  args: {
    copyrightText: "© Acme Corp",
  },
} satisfies Meta<typeof DashboardFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const ExplicitYear: Story = {
  args: {
    year: 2030,
  },
};

export const WithoutToTop: Story = {
  args: {
    showToTop: false,
  },
};

export const WithBottomNavSpacing: Story = {
  args: {
    bottomNavSpacing: true,
  },
};

export const CustomChildren: Story = {
  args: {
    children: (
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span>Built with</span>
        <strong>@sito/dashboard-app</strong>
      </div>
    ),
  },
};
