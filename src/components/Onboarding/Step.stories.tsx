import type { Meta, StoryObj } from "@storybook/react";
import { Step } from "./Step";

const imageSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#f0f9ff"/><rect x="48" y="60" width="544" height="240" rx="20" fill="#0ea5e9" opacity="0.15"/><circle cx="180" cy="180" r="40" fill="#0ea5e9"/><rect x="250" y="140" width="220" height="20" rx="10" fill="#0ea5e9"/><rect x="250" y="180" width="150" height="16" rx="8" fill="#38bdf8"/></svg>'
);

const previewImage = `data:image/svg+xml;charset=utf-8,${imageSvg}`;

const meta = {
  title: "Components/Onboarding/Step",
  component: Step,
  tags: ["autodocs"],
  args: {
    title: "Welcome",
    body: "This is the first onboarding step.",
    onClickNext: () => {},
    final: false,
  },
} satisfies Meta<typeof Step>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithImageAndContent: Story = {
  args: {
    image: previewImage,
    alt: "Onboarding illustration",
    content: (
      <ul className="text-left">
        <li>Review your workspace</li>
        <li>Invite your team</li>
      </ul>
    ),
  },
};

export const FinalStep: Story = {
  args: {
    final: true,
    title: "Ready",
    body: "You can start as guest or sign in.",
  },
};
