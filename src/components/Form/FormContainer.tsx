import { useTranslation, Loading } from "@sito/dashboard";
import { FieldValues } from "react-hook-form";

// components
import { Button } from "components";

// types
import { FormContainerPropsType } from "./types";

// styles
import "./styles.css";

export const FormContainer = <TInput extends FieldValues>(
  props: FormContainerPropsType<TInput>,
) => {
  const { t } = useTranslation();
  const {
    children,
    handleSubmit,
    onSubmit,
    isLoading = false,
    buttonEnd = true,
    reset,
  } = props;

  return (
    <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
      {children}
      <div className={`form-actions ${buttonEnd ? "end" : ""}`}>
        <Button
          type="submit"
          color="primary"
          variant="submit"
          disabled={isLoading}
          name={t("_accessibility:buttons.submit")}
          aria-label={t("_accessibility:ariaLabels.submit")}
        >
          {isLoading ? (
            <Loading
              color="stroke-base"
              loaderClass="!w-6 mt-1"
              strokeWidth="6"
            />
          ) : null}
          {t("_accessibility:buttons.submit")}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => reset?.()}
          name={t("_accessibility:buttons.cancel")}
          aria-label={t("_accessibility:ariaLabels.cancel")}
        >
          {t("_accessibility:buttons.cancel")}
        </Button>
      </div>
    </form>
  );
};
