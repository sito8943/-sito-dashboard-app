import { useMemo, useState } from "react";

// types
import { TabsLayoutPropsType } from "./types";

// components
import { Tab } from "./Tab";

// styles
import "./styles.css";

export const TabsLayout = (props: TabsLayoutPropsType) => {
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

  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id);

  const activeTab = currentTab ?? internalTab;

  const current = useMemo(() => {
    return tabs.find((item) => item.id === activeTab);
  }, [tabs, activeTab]);

  return (
    <div className={`tabs-layout-main ${className}`}>
      <ul
        className={`horizontal tabs tabs-container ${tabsContainerClassName}`}
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
