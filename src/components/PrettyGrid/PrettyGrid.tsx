import { useCallback, useEffect, useRef } from "react";

// @sito/dashboard
import { useTranslation, Loading } from "@sito/dashboard";

// lib
import { BaseEntityDto } from "lib";

// types
import { PrettyGridPropsType } from "./types";

// component
import { Empty } from "components";

// styles
import "./styles.css";

export const PrettyGrid = <TDto extends BaseEntityDto>(
  props: PrettyGridPropsType<TDto>
) => {
  const { t } = useTranslation();

  const {
    className = "",
    itemClassName = "",
    loading = false,
    emptyComponent = null,
    emptyMessage = t("_accessibility:messages.empty"),
    renderComponent,
    data = [],
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    loadMoreComponent = null,
    observerRootMargin = "0px 0px 200px 0px",
    observerThreshold = 0,
  } = props;
  const loadMoreInFlightRef = useRef(false);
  const loadMoreSentinelRef = useRef<HTMLLIElement | null>(null);

  const triggerLoadMore = useCallback(async () => {
    if (!hasMore || !onLoadMore) return;
    if (loadingMore || loadMoreInFlightRef.current) return;

    loadMoreInFlightRef.current = true;
    try {
      await onLoadMore();
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [hasMore, loadingMore, onLoadMore]);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    if (!loadMoreSentinelRef.current) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void triggerLoadMore();
        }
      },
      {
        rootMargin: observerRootMargin,
        threshold: observerThreshold,
      },
    );

    observer.observe(loadMoreSentinelRef.current);
    return () => observer.disconnect();
  }, [
    hasMore,
    onLoadMore,
    observerRootMargin,
    observerThreshold,
    triggerLoadMore,
  ]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {data?.length ? (
        <ul className={`pretty-grid-main ${className}`}>
          {data?.map((item) => (
            <li className={`pretty-grid-item ${itemClassName}`} key={item.id}>
              {renderComponent(item)}
            </li>
          ))}
          {hasMore && onLoadMore && (
            <li className="pretty-grid-load-more" ref={loadMoreSentinelRef}>
              {loadMoreComponent}
            </li>
          )}
        </ul>
      ) : (
        <>
          {emptyComponent ? emptyComponent : <Empty message={emptyMessage} />}
        </>
      )}
    </>
  );
};
