import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Onboarding } from "./Onboarding";

const meta = {
  title: "Components/Onboarding/Onboarding",
  component: Onboarding,
  tags: ["autodocs"],
  args: {
    steps: [
      {
        title: "Welcome to Sito",
        body: "Review the main flows before you start using the dashboard.",
      },
      {
        title: "Ready to begin",
        body: "Each step can now render extra content when needed.",
        content: (
          <div>
            <strong>Custom content</strong>
            <p>You can add custom children-like UI below the body.</p>
          </div>
        ),
      },
    ],
  },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
