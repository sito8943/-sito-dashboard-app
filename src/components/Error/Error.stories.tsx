import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useTranslation } from "@sito/dashboard";
import { Error as ErrorComponent } from "./Error";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const meta = {
  title: "Components/Error/Error",
  component: ErrorComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    error: new Error("Something went wrong"),
  },
};

export const WithRetry: Story = {
  args: {
    onRetry: () => {},
  },
  render: ({ onRetry }) => {
    const { t } = useTranslation();

    return (
      <ErrorComponent
        onRetry={onRetry}
        message={t("_accessibility:errors.unknownError")}
        retryLabel={t("_accessibility:actions.retry", { defaultValue: "Retry" })}
      />
    );
  },
};

export const WithCustomIcon: Story = {
  args: {
    message: "There was a problem syncing your data.",
    iconProps: {
      icon: faTriangleExclamation,
    },
  },
};

export const CustomContent: Story = {
  args: {
    children: (
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold">Connection lost</h3>
        <p className="text-text-muted">Check your network and try again.</p>
        <button className="button outlined">Open diagnostics</button>
      </div>
    ),
  },
};
