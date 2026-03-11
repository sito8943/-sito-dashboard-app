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

const imageSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#ecfeff"/><rect x="60" y="60" width="520" height="200" rx="16" fill="#06b6d4" opacity="0.2"/><circle cx="160" cy="160" r="34" fill="#06b6d4"/><rect x="230" y="138" width="260" height="20" rx="10" fill="#06b6d4"/><rect x="230" y="170" width="180" height="14" rx="7" fill="#22d3ee"/></svg>',
);

const stepImage = `data:image/svg+xml;charset=utf-8,${imageSvg}`;

export const WithStepImages: Story = {
  args: {
    steps: [
      {
        title: "Welcome to Sito",
        body: "Review the main flows before you start using the dashboard.",
        image: stepImage,
        alt: "Welcome onboarding illustration",
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
        image: stepImage,
        alt: "Second onboarding step illustration",
      },
    ],
  },
};
