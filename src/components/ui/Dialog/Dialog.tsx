import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog as HeadlessDialog } from "@sito/ui";
import { classNames, useTranslation } from "@sito/dashboard";

// icons
import { faClose } from "@fortawesome/free-solid-svg-icons";

// types
import { DialogPropsType } from "./types";

// constants
import { DIALOG_EXIT_DURATION_MS } from "./constants";
import { useDialogBrowserBack } from "./useDialogBrowserBack";

// styles
import "./styles.css";

/**
 * Renders a portal-based modal dialog with backdrop and close behavior.
 * @param props - Dialog props.
 * @returns Modal dialog portal.
 */
export const Dialog = (props: DialogPropsType) => {
  const { t } = useTranslation();
  const {
    dialogId,
    title,
    children,
    handleClose,
    initialFocus,
    closeOnBackdropClick = false,
    onSubmit,
    open = false,
    mobileFullScreen = false,
    containerClassName = "",
    className = "",
    animationClass = "appear",
  } = props;

  const stateClassName = open ? "opened" : "closed";
  const openingAnimationClassName = open ? animationClass : "";

  useDialogBrowserBack(open, handleClose);

  return (
    <HeadlessDialog
      dialogId={dialogId}
      open={open}
      title={title}
      onClose={handleClose}
      initialFocus={initialFocus ?? "none"}
      closeOnBackdropClick={closeOnBackdropClick}
      onSubmit={
        onSubmit
          ? (event) => {
              return onSubmit(event);
            }
          : undefined
      }
      mobileFullScreen={mobileFullScreen}
      containerClassName={classNames(
        "dialog-backdrop animated",
        stateClassName,
        openingAnimationClassName,
        containerClassName,
      )}
      className={classNames(
        "dialog elevated animated",
        !mobileFullScreen && "dialog-framed",
        mobileFullScreen && "dialog-mobile-full-screen",
        stateClassName,
        openingAnimationClassName,
        className,
      )}
      headerClassName="dialog-header"
      titleClassName="dialog-title"
      closeButtonClassName="icon-button dialog-close-btn"
      closeLabel={t("_accessibility:ariaLabels.closeDialog")}
      closeIcon={<FontAwesomeIcon icon={faClose} size="sm" />}
      exitDurationMs={DIALOG_EXIT_DURATION_MS}
    >
      {children}
    </HeadlessDialog>
  );
};
