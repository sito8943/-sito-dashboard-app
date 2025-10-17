// types
import { TabPropsType } from "./types";

// providers
import { useConfig } from "providers/ConfigProvider";

export const Tab = (props: TabPropsType) => {
  const { id, active, onClick, children, to } = props;

  const { linkComponent } = useConfig();

  return (
    <linkComponent.type
      to={to ?? `#${id}`}
      onClick={() => onClick()}
      className={`button submit tab ${active ? "primary" : "outlined"}`}
    >
      {children}
    </linkComponent.type>
  );
};
