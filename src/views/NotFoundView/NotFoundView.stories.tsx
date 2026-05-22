import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import { ConfigProvider } from "providers";
import type { BaseLinkPropsType } from "components";

import { NotFoundView } from "./NotFoundView";

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
  title: "Views/NotFoundView",
  component: NotFoundView,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/missing" } as Location}
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
    title: "Page not found",
    body: "We couldn't find the page you were looking for.",
    ctaLabel: "Back to home",
    ctaTo: "/",
  },
} satisfies Meta<typeof NotFoundView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const CustomCopy: Story = {
  args: {
    title: "404",
    body: "This route was removed in the last release.",
    ctaLabel: "Take me somewhere safer",
    ctaTo: "/dashboard",
  },
};
