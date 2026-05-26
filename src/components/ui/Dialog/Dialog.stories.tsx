import type { Meta, StoryObj } from "@storybook/react";
import React, { ReactNode, useState } from "react";

import { ConfigProvider } from "providers";
import type { MotionPreference } from "providers";
import type { BaseLinkPropsType } from "components";
import type { Location } from "lib";

import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

type DialogStoryDemoProps = {
  args: React.ComponentProps<typeof Dialog>;
  motion?: MotionPreference;
};

const storyLocation: Location = {
  pathname: "/",
  search: "",
  hash: "",
  state: {},
  key: "dialog-story",
};

const StoryLink = (props: BaseLinkPropsType) => {
  const { to, children, ...rest } = props;
  return (
    <a href={typeof to === "string" ? to : String(to)} {...rest}>
      {children}
    </a>
  );
};

const MotionWrapper = ({
  children,
  motion,
}: {
  children: ReactNode;
  motion: MotionPreference;
}) => (
  <ConfigProvider
    location={storyLocation}
    navigate={() => {}}
    linkComponent={StoryLink}
    motion={motion}
  >
    {children}
  </ConfigProvider>
);

const DialogStoryDemo = ({ args, motion }: DialogStoryDemoProps) => {
  const [open, setOpen] = useState(!!args.open);

  const content = (
    <div>
      <button
        className="button submit primary mb-4"
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </button>
      <Dialog {...args} open={open} handleClose={() => setOpen(false)}>
        <div className="p-4">
          <p className="mb-4">This is a basic dialog content.</p>
          <DialogActions
            primaryText="OK"
            cancelText="Cancel"
            onPrimaryClick={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            alignEnd
          />
        </div>
      </Dialog>
    </div>
  );

  if (!motion) return content;

  return <MotionWrapper motion={motion}>{content}</MotionWrapper>;
};

const meta = {
  title: "Components/Dialog/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    title: "Example Dialog",
    open: true,
    closeOnBackdropClick: false,
    mobileFullScreen: false,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: false,
    handleClose: () => {},
  },
  render: (args) => <DialogStoryDemo args={args} />,
};

export const MobileFullScreen: Story = {
  args: {
    open: false,
    handleClose: () => {},
    mobileFullScreen: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: Basic.render,
};

export const CloseOnBackdropClick: Story = {
  args: {
    open: false,
    handleClose: () => {},
    closeOnBackdropClick: true,
    title: "Dialog with closeOnBackdropClick",
  },
  render: Basic.render,
};

export const CustomPosition: Story = {
  args: {
    open: false,
    handleClose: () => {},
    title: "Dialog with custom position",
    containerClassName: "!items-start !justify-end p-6",
    className: "!w-[28rem] !max-w-[calc(100vw-3rem)]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses `containerClassName` to move the dialog container to the top-right corner.",
      },
    },
  },
  render: Basic.render,
};

export const MotionAuto: Story = {
  args: {
    open: false,
    handleClose: () => {},
    title: "Dialog with motion=auto",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses `ConfigProvider motion="auto"`. It animates normally, but if the browser or OS exposes `prefers-reduced-motion`, transitions are disabled automatically.',
      },
    },
  },
  render: (args) => <DialogStoryDemo args={args} motion="auto" />,
};

export const MotionNone: Story = {
  args: {
    open: false,
    handleClose: () => {},
    title: "Dialog with motion=none",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses `ConfigProvider motion="none"` to disable library transitions and animations entirely.',
      },
    },
  },
  render: (args) => <DialogStoryDemo args={args} motion="none" />,
};

export const MotionAlways: Story = {
  args: {
    open: false,
    handleClose: () => {},
    title: "Dialog with motion=always",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses `ConfigProvider motion="always"` to keep library transitions enabled even when the system requests reduced motion.',
      },
    },
  },
  render: (args) => <DialogStoryDemo args={args} motion="always" />,
};
