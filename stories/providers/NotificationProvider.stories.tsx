import type { Meta, StoryObj } from "@storybook/react";
import { NotificationProvider, useNotification } from "@/providers";
import { NotificationEnumType } from "@/lib";

const meta = {
  title: "Providers/NotificationProvider",
  component: NotificationProvider,
  tags: ["autodocs"],
  args: {
    children: null,
    placement: "bottom-left",
    variant: "filled",
    duration: 5000,
    max: 3,
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    variant: { control: "inline-radio", options: ["filled", "accent"] },
  },
} satisfies Meta<typeof NotificationProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const NotificationControls = () => {
  const {
    showSuccessNotification,
    showErrorNotification,
    showNotification,
    showStackNotifications,
    removeNotification,
  } = useNotification();

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        className="button submit primary"
        onClick={() =>
          showSuccessNotification({ message: "Saved successfully" })
        }
      >
        Success
      </button>
      <button
        className="button outlined"
        onClick={() =>
          showErrorNotification({ message: "Something went wrong" })
        }
      >
        Error
      </button>
      <button
        className="button outlined"
        onClick={() =>
          showNotification({
            message: "Watch out for this warning",
            type: NotificationEnumType.warning,
          })
        }
      >
        Warning
      </button>
      <button
        className="button outlined"
        onClick={() =>
          showNotification({
            message: "Heads up, this is informational",
            type: NotificationEnumType.info,
          })
        }
      >
        Info
      </button>
      <button
        className="button outlined"
        onClick={() =>
          showStackNotifications([
            {
              message: "First stacked message",
              type: NotificationEnumType.info,
            },
            {
              message: "Second stacked message",
              type: NotificationEnumType.warning,
            },
            {
              message: "Third stacked message",
              type: NotificationEnumType.error,
            },
          ])
        }
      >
        Stack
      </button>
      <button className="button outlined" onClick={() => removeNotification()}>
        Clear all
      </button>
    </div>
  );
};

export const Basic: Story = {
  render: (args) => (
    <NotificationProvider {...args}>
      <div className="p-4">
        <NotificationControls />
      </div>
    </NotificationProvider>
  ),
};

export const StackAndDismiss: Story = {
  render: (args) => (
    <NotificationProvider {...args}>
      <div className="p-4">
        <p className="mb-3 text-sm opacity-70">
          Toasts stack (up to `max`, the oldest leaves first). Non-error toasts
          leave after `duration`; errors stay until closed. Clear all calls
          `removeNotification()`.
        </p>
        <NotificationControls />
      </div>
    </NotificationProvider>
  ),
};

export const Accent: Story = {
  ...Basic,
  args: { variant: "accent", placement: "top-right" },
};
