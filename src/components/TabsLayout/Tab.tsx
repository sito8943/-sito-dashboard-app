// types
import { TabPropsType } from "./types";

export const Tab = (props: TabPropsType) => {
  const { id, active, onClick, children, to, linkComponent } = props;

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
