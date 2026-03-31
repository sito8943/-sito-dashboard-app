import { useTranslation } from "@sito/dashboard";

// lib
import { ImportPreviewDto } from "lib";

// styles
import "./styles.css";

type PreviewProps<EntityDto extends ImportPreviewDto> = {
  items: EntityDto[];
  max?: number;
  className?: string;
};

/** Renders a compact JSON preview of parsed import items. */
export function Preview<EntityDto extends ImportPreviewDto>(
  props: PreviewProps<EntityDto>,
) {
  const { items, max = 5, className = "" } = props;
  const { t } = useTranslation();

  if (!items || items.length === 0) return null;

  const limited = items.slice(0, max);

  return (
    <div className={`import-preview ${className}`}>
      <p className="import-preview-count">
        {t("_pages:common.actions.import.previewCount", {
          count: items.length,
          defaultValue: `Preview: ${items.length} items`,
        })}
      </p>
      <pre className="import-preview-content">
        {JSON.stringify(limited, null, 2)}
      </pre>
    </div>
  );
}
