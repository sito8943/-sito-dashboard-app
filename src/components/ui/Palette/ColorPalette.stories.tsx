import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";

type PaletteToken = {
  label: string;
  variable: string;
};

type PaletteSection = {
  title: string;
  tokens: PaletteToken[];
};

type ResolvedPaletteToken = PaletteToken & {
  source: string;
  rgb: string;
  hex: string;
};

const paletteSections: PaletteSection[] = [
  {
    title: "Brand",
    tokens: [
      { label: "Primary", variable: "--color-primary" },
      { label: "Bg Primary", variable: "--color-bg-primary" },
      { label: "Hover Primary", variable: "--color-hover-primary" },
      { label: "Secondary", variable: "--color-secondary" },
      { label: "Bg Secondary", variable: "--color-bg-secondary" },
      { label: "Hover Secondary", variable: "--color-hover-secondary" },
      { label: "Tertiary", variable: "--color-tertiary" },
      { label: "Bg Tertiary", variable: "--color-bg-tertiary" },
      { label: "Hover Tertiary", variable: "--color-hover-tertiary" },
      { label: "Quaternary", variable: "--color-quaternary" },
      { label: "Bg Quaternary", variable: "--color-bg-quaternary" },
      { label: "Hover Quaternary", variable: "--color-hover-quaternary" },
    ],
  },
  {
    title: "Base",
    tokens: [
      { label: "Base Dark", variable: "--color-base-dark" },
      { label: "Base", variable: "--color-base" },
      { label: "Base Light", variable: "--color-base-light" },
      { label: "Text", variable: "--color-text" },
      { label: "Border", variable: "--color-border" },
      { label: "Text Muted", variable: "--color-text-muted" },
    ],
  },
  {
    title: "Notifications",
    tokens: [
      { label: "Bg Info", variable: "--color-bg-info" },
      { label: "Info", variable: "--color-info" },
      { label: "Bg Success", variable: "--color-bg-success" },
      { label: "Success", variable: "--color-success" },
      { label: "Bg Warning", variable: "--color-bg-warning" },
      { label: "Warning", variable: "--color-warning" },
      { label: "Bg Error", variable: "--color-bg-error" },
      { label: "Error", variable: "--color-error" },
    ],
  },
];

const resolveVariableValue = (variable: string): string => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

const normalizeToRgb = (value: string): string => {
  if (!value || typeof window === "undefined") return "";

  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  return resolved || "";
};

const rgbToHex = (rgb: string): string => {
  const match = rgb.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );
  if (!match) return "-";

  const toHex = (value: string) => Number(value).toString(16).padStart(2, "0");
  const [, r, g, b] = match;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const getTextColor = (rgb: string): string => {
  const match = rgb.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );
  if (!match) return "#111111";

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 165 ? "#111111" : "#FFFFFF";
};

const resolvePalette = (sections: PaletteSection[]) => {
  return sections.map((section) => ({
    ...section,
    tokens: section.tokens.map<ResolvedPaletteToken>((token) => {
      const source = resolveVariableValue(token.variable);
      const rgb = normalizeToRgb(source);
      const hex = rgbToHex(rgb);

      return {
        ...token,
        source: source || "-",
        rgb: rgb || "-",
        hex,
      };
    }),
  }));
};

function ColorPalettePreview() {
  const sections = useMemo(() => resolvePalette(paletteSections), []);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-base text-text">
      <div>
        <h2 className="text-2xl font-bold">Sito Palette</h2>
        <p className="text-sm text-text-muted mt-1">
          Colors from <code>src/index.css</code> with source, RGB and HEX.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {section.tokens.map((token) => {
              const previewTextColor = getTextColor(token.rgb);
              return (
                <article
                  key={token.variable}
                  className="rounded-lg overflow-hidden border border-border bg-base-light shadow-sm"
                >
                  <div
                    className="h-20 px-3 flex items-end pb-2 text-xs font-semibold tracking-wide"
                    style={{
                      backgroundColor: `var(${token.variable})`,
                      color: previewTextColor,
                    }}
                  >
                    {token.label}
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <div className="font-mono">{token.variable}</div>
                    <div>
                      <span className="text-text-muted">source:</span>{" "}
                      <span className="font-mono">{token.source}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">rgb:</span>{" "}
                      <span className="font-mono">{token.rgb}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">hex:</span>{" "}
                      <span className="font-mono">{token.hex}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Colors/Palette",
  component: ColorPalettePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ColorPalettePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
