import { useMemo } from "react";
import { useTranslation, classNames } from "@sito/dashboard";

// lib
import { ImportPreviewDto } from "lib";

// types
import type { PreviewProps } from "./types";

// utils
import { computeImportPreviewCounts } from "./utils";

// styles
import "./styles.css";

/**
 * Renders a compact JSON preview of parsed import items with status chips.
 * @param props - Preview props.
 * @returns Preview element or null when there are no items.
 */
export function Preview<EntityDto extends ImportPreviewDto>(
  props: PreviewProps<EntityDto>,
) {
  const { items, max = 5, className = "" } = props;
  const { t } = useTranslation();

  const counts = useMemo(
    () => computeImportPreviewCounts(items ?? []),
    [items],
  );

  if (!items || items.length === 0) return null;

  const limited = items.slice(0, max);

  return (
    <div className={classNames("import-preview", className)}>
      <p className="import-preview-count">
        {t("_pages:common.actions.import.previewCount", {
          count: items.length,
          defaultValue: `Preview: ${items.length} items`,
        })}
      </p>
      <div className="import-preview-chips">
        {counts.existing > 0 && (
          <span className="import-preview-chip import-preview-chip-existing">
            {t("_pages:common.actions.import.statusExisting", {
              count: counts.existing,
              defaultValue: `Existing: ${counts.existing}`,
            })}
          </span>
        )}
        {counts.willCreate > 0 && (
          <span className="import-preview-chip import-preview-chip-will-create">
            {t("_pages:common.actions.import.statusWillCreate", {
              count: counts.willCreate,
              defaultValue: `Will create: ${counts.willCreate}`,
            })}
          </span>
        )}
        {counts.conflict > 0 && (
          <span className="import-preview-chip import-preview-chip-conflict">
            {t("_pages:common.actions.import.statusConflict", {
              count: counts.conflict,
              defaultValue: `Conflict: ${counts.conflict}`,
            })}
          </span>
        )}
      </div>
      <pre className="import-preview-content">
        {JSON.stringify(limited, null, 2)}
      </pre>
    </div>
  );
}
