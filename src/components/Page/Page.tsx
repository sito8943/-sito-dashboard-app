import { useMemo } from "react";

// @sito/dashboard
import {
  ActionType,
  Badge,
  useTableOptions,
  Loading,
  useTranslation,
} from "@sito/dashboard";

// components
import { IconButton } from "components";

// types
import { PagePropsType } from "./types";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faFilter,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

// lib
import { BaseEntityDto } from "lib";

// hooks
import { GlobalActions } from "hooks";

// providers
import { queryClient } from "providers";

// components
import { PageHeader } from "./PageHeader";

// styles
import "./styles.css";

export const Page = <TEntity extends BaseEntityDto>(
  props: PagePropsType<TEntity>
) => {
  const {
    title,
    children,
    addOptions,
    filterOptions,
    actions,
    queryKey,
    isLoading = false,
    isAnimated = true,
    showBackButton = false,
  } = props;

  const { t } = useTranslation();

  const { countOfFilters } = useTableOptions();

  const parsedActions = useMemo(() => {
    const pActions = Array.isArray(actions) ? [...actions] : [];
    if (queryKey) {
      const refreshAction = {
        id: GlobalActions.Refresh,
        onClick: () => queryClient.invalidateQueries({ queryKey }),
        icon: <FontAwesomeIcon icon={faRotateLeft} />,
        tooltip: t("_pages:common.actions.refresh.text"),
      };
      pActions.unshift(refreshAction as ActionType<BaseEntityDto>);
    }
    if (addOptions) {
      const addAction = {
        ...(addOptions as ActionType<BaseEntityDto>),
        id: GlobalActions.Add,
        icon: <FontAwesomeIcon icon={faAdd} />,
      };
      pActions.unshift(addAction);
    }
    if (filterOptions) {
      const filterAction = {
        ...(filterOptions as ActionType<BaseEntityDto>),
        id: "filter",
        icon: <FontAwesomeIcon icon={faFilter} />,
        children: (
          <Badge
            className={`${countOfFilters > 0 ? "show" : "hide"} `}
            count={countOfFilters}
          />
        ),
      };
      pActions.push(filterAction);
    }
    return pActions;
  }, [actions, addOptions, countOfFilters, filterOptions, queryKey, t]);

  return (
    <main className="page-main">
      <PageHeader
        showBackButton={showBackButton}
        actions={parsedActions}
        title={title}
      />
      <div className={`page-main-content ${isAnimated ? "appear" : ""}`}>
        {isLoading ? <Loading className="page-loading" /> : children}
      </div>
      {addOptions && (
        <IconButton
          icon={addOptions.icon ?? faAdd}
          color={addOptions.color ?? "primary"}
          variant={addOptions.variant ?? "submit"}
          onClick={() => addOptions.onClick?.()}
          className={`button fab min-xs:!hidden ${addOptions.className ?? ""}`}
        />
      )}
    </main>
  );
};
