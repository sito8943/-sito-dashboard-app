import { useEffect, useMemo, useState } from "react";

// lib
import { classNames } from "@sito/dashboard";

// types
import { TabId, TabsLayoutPropsType } from "./types";

// components
import { Tab } from "./Tab";

// styles
import "./styles.css";

/**
 * Renders tab navigation and active tab content in controlled/uncontrolled mode.
 * @param props - Tabs layout props.
 * @returns Tabs layout element.
 */
export const TabsLayout = <TId extends TabId = TabId>(
  props: TabsLayoutPropsType<TId>,
) => {
  const {
    tabs = [],
    defaultTab,
    currentTab,
    onTabChange,
    className = "",
    tabsContainerClassName = "",
    useLinks = true,
    tabButtonProps,
  } = props;

  const [internalTab, setInternalTab] = useState<TId | undefined>(
    defaultTab ?? tabs[0]?.id,
  );

  const activeTab = currentTab ?? internalTab;

  const current = useMemo(() => {
    return tabs.find((item) => item.id === activeTab);
  }, [tabs, activeTab]);

  // `currentTab` is an id, not an index. When it matches no tab nothing is
  // rendered, so warn in development instead of failing silently.
  useEffect(() => {
    if (!import.meta.env.DEV || activeTab === undefined || tabs.length === 0)
      return;
    if (!current) {
      console.warn(
        `[TabsLayout] No tab has id "${String(activeTab)}". currentTab/defaultTab must match a tab id, not its position.`,
      );
    }
  }, [activeTab, current, tabs.length]);

  return (
    <div className={classNames("tabs-layout-main", className)}>
      <ul
        className={classNames(
          "horizontal tabs tabs-container",
          tabsContainerClassName,
        )}
      >
        {tabs.map(({ id, to, label }) => (
          <li key={id}>
            <Tab
              onClick={() => {
                if (currentTab === undefined) {
                  setInternalTab(id);
                }
                onTabChange?.(id);
              }}
              id={id}
              to={to}
              siblings={tabs.length > 1}
              active={activeTab === id}
              useLinks={useLinks}
              tabButtonProps={tabButtonProps}
            >
              {label}
            </Tab>
          </li>
        ))}
      </ul>
      {current?.content}
    </div>
  );
};
