import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

// @sito/dashboard
import {
  ActionType,
  Badge,
  useTableOptions,
  Loading,
  useTranslation,
  classNames,
} from "@sito/dashboard";

// components
import { AppIconButton } from "components";

// types
import { PagePropsType } from "./types";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faArrowsRotate,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// lib
import { BaseEntityDto } from "lib";

// hooks
import { GlobalActions } from "hooks";

// components
import { PageHeader } from "./PageHeader";

// styles
import "./styles.css";

/**
 * Composes standard page layout with actions, header and loading states.
 * @param props - Page props.
 * @returns Page layout element.
 */
export const Page = <TEntity extends BaseEntityDto>(
  props: PagePropsType<TEntity>,
) => {
  const {
    title,
    children,
    addOptions,
    filterOptions,
    actions,
    showActionTooltips = true,
    queryKey,
    isLoading = false,
    isAnimated = true,
    showBackButton = false,
    className,
    contentClassName,
    headerClassName,
  } = props;

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { countOfFilters } = useTableOptions();

  const parsedActions = useMemo(() => {
    const pActions: ActionType<TEntity>[] = Array.isArray(actions)
      ? [...actions]
      : [];
    if (queryKey) {
      const refreshAction: ActionType<TEntity> = {
        id: GlobalActions.Refresh,
        onClick: () => queryClient.invalidateQueries({ queryKey }),
        icon: <FontAwesomeIcon icon={faArrowsRotate} />,
        tooltip: t("_pages:common.actions.refresh.text"),
      };
      pActions.unshift(refreshAction);
    }
    if (addOptions) {
      const addAction = {
        ...(addOptions as Partial<ActionType<TEntity>>),
        id: GlobalActions.Add,
        icon: <FontAwesomeIcon icon={faAdd} />,
      };
      pActions.unshift(addAction as ActionType<TEntity>);
    }
    if (filterOptions) {
      const filterAction = {
        ...filterOptions,
        id: "filter",
        icon: <FontAwesomeIcon icon={faFilter} />,
        children: (
          <Badge
            className={classNames(countOfFilters > 0 ? "show" : "hide")}
            count={countOfFilters}
          />
        ),
      };
      pActions.push(filterAction as ActionType<TEntity>);
    }
    return pActions;
  }, [
    actions,
    addOptions,
    countOfFilters,
    filterOptions,
    queryClient,
    queryKey,
    t,
  ]);

  return (
    <main className={classNames("page-main", className)}>
      <PageHeader
        showBackButton={showBackButton}
        actions={parsedActions}
        showActionTooltips={showActionTooltips}
        title={title}
        className={headerClassName}
      />
      <div
        className={classNames(
          "page-main-content",
          isAnimated && "appear",
          contentClassName,
        )}
      >
        {isLoading ? <Loading className="page-loading" /> : children}
      </div>
      {addOptions && (
        <AppIconButton
          icon={addOptions.icon ?? faAdd}
          color={addOptions.color ?? "primary"}
          variant={addOptions.variant ?? "submit"}
          onClick={() => addOptions.onClick?.()}
          className={classNames("button page-fab", addOptions.className)}
        />
      )}
    </main>
  );
};
