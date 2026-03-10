import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Notification } from "./Notification";
import { useNotification } from "providers";
import { NotificationEnumType } from "lib";

const meta = {
  title: "Components/Notification/Notification",
  component: Notification,
  tags: ["autodocs"],
} satisfies Meta<typeof Notification>;

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
          showSuccessNotification({
            message: "Saved successfully",
            type: NotificationEnumType.success,
          })
        }
      >
        Success
      </button>
      <button
        className="button outlined"
        onClick={() => showErrorNotification({ message: "Something went wrong" })}
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
            { message: "First stacked message", type: NotificationEnumType.info },
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
  render: () => (
    <div className="p-4">
      <NotificationControls />
      <Notification />
    </div>
  ),
};

export const StackAndDismiss: Story = {
  render: () => (
    <div className="p-4">
      <p className="mb-3 text-sm opacity-70">
        Use Stack to render multiple notifications. You can close with ESC, click
        outside or use Clear all.
      </p>
      <NotificationControls />
      <Notification />
    </div>
  ),
};
