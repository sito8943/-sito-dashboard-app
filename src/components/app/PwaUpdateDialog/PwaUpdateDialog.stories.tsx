import type { Meta, StoryObj } from "@storybook/react";

import { PwaUpdateDialog } from "./PwaUpdateDialog";

const meta = {
  title: "Components/PwaUpdateDialog/PwaUpdateDialog",
  component: PwaUpdateDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    title: "Update available",
    description: "A new version of the app is ready. Reload to apply it.",
    dismissLabel: "Later",
    updateLabel: "Update now",
    onDismiss: () => {},
    onUpdate: () => {},
  },
} satisfies Meta<typeof PwaUpdateDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const MobileFullScreen: Story = {
  args: {
    mobileFullScreen: true,
  },
};

export const LongDescription: Story = {
  args: {
    description:
      "We rolled out improvements to the offline cache, fixed two regressions in the import flow, and updated translations for the new export options. Reload to apply.",
  },
};
