import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  faBolt,
  faCircleQuestion,
  faPaperPlane,
  faStar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
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

export const RemountStepOnChange: Story = {
  args: {
    remountStepOnChange: true,
    steps: [
      {
        title: "Step one",
        body: "Animations replay every step because the panel remounts.",
      },
      {
        title: "Step two",
        body: "Click Next to see the entry animation restart on this step.",
      },
      {
        title: "Final step",
        body: "Each transition fully remounts the active panel.",
      },
    ],
  },
};

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

/**
 * Three steps. Steps 2/3 surface the auto-wired Back button (icon-only on
 * mobile, label on desktop).
 */
export const WithBackButton: Story = {
  args: {
    steps: [
      {
        title: "Step 1",
        body: "First step — no Back button yet.",
      },
      {
        title: "Step 2",
        body: "Back button appears from the second step on.",
      },
      {
        title: "Step 3",
        body: "Final step still gets a Back button.",
      },
    ],
  },
};

/**
 * Override every default icon via the `icons` prop on `Onboarding`.
 */
export const CustomIcons: Story = {
  args: {
    icons: {
      back: faXmark,
      next: faPaperPlane,
      skip: faCircleQuestion,
      startAsGuest: faBolt,
      signIn: faStar,
    },
    steps: [
      {
        title: "Step 1",
        body: "Custom icons across all actions.",
      },
      {
        title: "Step 2",
        body: "Back button uses the override too.",
      },
    ],
  },
};

/**
 * `alwaysShowIcon` forces the icon visible on desktop (defaults hide it).
 * Accepts boolean or per-action map.
 */
export const AlwaysShowIconDesktop: Story = {
  args: {
    alwaysShowIcon: true,
    steps: [
      {
        title: "Step 1",
        body: "On desktop the icon stays next to the label.",
      },
      {
        title: "Step 2",
        body: "Back/Skip/Next all show their icon at every breakpoint.",
      },
    ],
  },
};

/**
 * `alwaysHideLabel` collapses every button to icon-only. Button width auto.
 */
export const AlwaysHideLabel: Story = {
  args: {
    alwaysHideLabel: true,
    steps: [
      {
        title: "Step 1",
        body: "Icon-only buttons at every breakpoint.",
      },
      {
        title: "Step 2",
        body: "Same here.",
      },
    ],
  },
};

/**
 * `alwaysHideIcon` forces label-only buttons at every breakpoint.
 */
export const AlwaysHideIcon: Story = {
  args: {
    alwaysHideIcon: true,
    steps: [
      {
        title: "Step 1",
        body: "Label-only buttons at every breakpoint.",
      },
      {
        title: "Step 2",
        body: "Mobile labels stay visible because icons are hidden.",
      },
    ],
  },
};

/**
 * `showLabelOnMobile` reveals the label on mobile. Per-action map keeps
 * next/back icon-only while the central guest CTA shows its label.
 */
export const ShowGuestLabelOnMobile: Story = {
  args: {
    showLabelOnMobile: { startAsGuest: true },
    steps: [
      {
        title: "Step 1",
        body: "Mobile: next/back stay as icons.",
      },
      {
        title: "Ready",
        body: "Mobile: guest CTA shows its label, sign-in stays icon-only.",
      },
    ],
  },
};

/**
 * Per-step overrides — each step entry can carry its own `icons` / display
 * flags. Merged on top of onboarding-level values per-action.
 */
export const PerStepOverrides: Story = {
  args: {
    // Onboarding-level baseline
    alwaysShowIcon: { back: true, next: true },
    alwaysHideIcon: { skip: true },
    icons: { next: faPaperPlane },
    steps: [
      {
        title: "Step 1",
        body: "Inherits onboarding-level icon + flag settings.",
      },
      {
        // Step-level overrides
        title: "Step 2 — overridden",
        body: "This step uses showLabelOnMobile + a custom skip icon.",
        showLabelOnMobile: true,
        icons: { skip: faCircleQuestion },
      },
      {
        title: "Final step",
        body: "Last step collapses to icon-only for its CTAs.",
        alwaysHideLabel: { startAsGuest: true, signIn: true },
      },
    ],
  },
};
