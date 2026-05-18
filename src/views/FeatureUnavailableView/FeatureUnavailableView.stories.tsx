import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { faLock, faBan } from "@fortawesome/free-solid-svg-icons";

import { ConfigProvider } from "providers";
import type { BaseLinkPropsType } from "components";

import { FeatureUnavailableView } from "./FeatureUnavailableView";

const MockLink: ComponentType<BaseLinkPropsType> = ({
  children,
  to,
  className,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const meta = {
  title: "Views/FeatureUnavailableView",
  component: FeatureUnavailableView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/reports" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <div style={{ minHeight: 400 }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  args: {
    title: "Feature unavailable",
    body: "Reports are turned off for this workspace.",
    ctaLabel: "Back to home",
    ctaTo: "/",
  },
} satisfies Meta<typeof FeatureUnavailableView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithLockIcon: Story = {
  args: {
    icon: faLock,
    title: "Locked",
    body: "Upgrade your plan to unlock this module.",
    ctaLabel: "View plans",
    ctaTo: "/billing",
  },
};

export const WithBanIcon: Story = {
  args: {
    icon: faBan,
    title: "Restricted",
    body: "Your role does not have access to this module.",
    ctaLabel: "Request access",
    ctaTo: "/contact",
  },
};
