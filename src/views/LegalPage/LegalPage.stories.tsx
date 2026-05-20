import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import { ConfigProvider } from "providers";
import type { BaseLinkPropsType } from "components";

import { LegalPage } from "./LegalPage";
import { LegalSection } from "./LegalSection";
import { LegalLinksList } from "./LegalLinksList";

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
  title: "Views/LegalPage",
  component: LegalPage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/legal" } as Location}
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
    title: "Terms and Conditions",
    intro:
      "By using this application you agree to the following terms and conditions.",
  },
} satisfies Meta<typeof LegalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleAndIntroOnly: Story = {};

export const WithSections: Story = {
  args: {
    children: (
      <>
        <LegalSection title="1. Acceptance">
          <p>You accept these terms by using the application.</p>
        </LegalSection>
        <LegalSection title="2. Privacy">
          <p>
            Your data is handled according to our privacy policy. See the{" "}
            <a href="/privacy" className="primary underline font-bold!">
              privacy policy
            </a>{" "}
            for details.
          </p>
        </LegalSection>
      </>
    ),
  },
};

export const WithLegalLinksList: Story = {
  args: {
    title: "About",
    intro: "Quick links to our legal pages.",
    children: (
      <LegalSection title="Legal">
        <p>The following documents describe the rules of using the app.</p>
        <LegalLinksList
          links={[
            { to: "/terms", label: "Terms and Conditions" },
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/cookies", label: "Cookies Policy" },
          ]}
        />
        <p className="text-sm text-text-muted">Last updated 2026-01-01.</p>
      </LegalSection>
    ),
  },
};
