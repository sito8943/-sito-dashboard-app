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
  } = props;

  if (loading) {
    <Loading />;
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
        </ul>
      ) : (
        <>
          {emptyComponent ? emptyComponent : <Empty message={emptyMessage} />}
        </>
      )}
    </>
  );
};
