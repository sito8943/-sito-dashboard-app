/**
 * Default rich-text component map for `react-i18next` `<Trans>`. Covers the
 * common inline tags used in legal/info pages (`p`, `strong`, `em`, `ul`,
 * `ol`, `li`, `a`, `code`) with the library's design-token classes.
 *
 * Library is i18n-agnostic: this is just a styled ReactNode map. Consumers
 * spread or extend it when calling `<Trans components={richTextComponents} />`.
 */
export const richTextComponents = {
  p: <p />,
  strong: <strong />,
  em: <em />,
  ul: <ul className="list-disc ml-4 space-y-1" />,
  ol: <ol className="list-decimal ml-4 space-y-1" />,
  li: <li />,
  a: <a className="primary underline font-bold!" />,
  code: <code className="bg-default px-1 rounded" />,
};
