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

export const Basic: Story = {
  render: () => {
    const Buttons = () => {
      const { showSuccessNotification, showErrorNotification } = useNotification();
      return (
        <div className="flex gap-2">
          <button
            className="button submit primary"
            onClick={() => showSuccessNotification({ message: "Saved successfully", type: NotificationEnumType.success })}
          >
            Success
          </button>
          <button
            className="button outlined"
            onClick={() => showErrorNotification({ message: "Something went wrong" })}
          >
            Error
          </button>
        </div>
      );
    };
    return (
      <div className="p-4">
        <Buttons />
        <Notification />
      </div>
    );
  },
};

