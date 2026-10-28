import type {
  ComponentPropsWithoutRef,
  FormEventHandler,
  ReactElement,
  ReactNode,
} from "react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";

export type AuthScreenMotionType = "none" | "blur" | "stagger";

export type AuthScreenBackButtonPropsType = {
  showBackButton?: boolean;
  backTo?: string | number;
  backButtonLabel?: string;
  backButtonClassName?: string;
  onBack?: () => void;
};

export type AuthScreenShellPropsType = {
  title?: ReactNode;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  motion?: AuthScreenMotionType;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  actionsClassName?: string;
  footerClassName?: string;
  formProps?: ComponentPropsWithoutRef<"form">;
} & AuthScreenBackButtonPropsType;

export type AuthFormFieldRenderContextType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> = {
  field: ControllerRenderProps<TFormType, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
};

type AuthFormFieldBaseType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> = {
  name: TName;
  id?: string;
  label?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  rules?: RegisterOptions<TFormType, TName>;
  render?: (
    context: AuthFormFieldRenderContextType<TFormType, TName>,
  ) => ReactElement;
};

export type AuthTextFormFieldDefinitionType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> = AuthFormFieldBaseType<TFormType, TName> & {
  kind: "text";
  type?: ComponentPropsWithoutRef<"input">["type"];
};

export type AuthPasswordFormFieldDefinitionType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> = AuthFormFieldBaseType<TFormType, TName> & {
  kind: "password";
};

export type AuthCheckboxFormFieldDefinitionType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> = AuthFormFieldBaseType<TFormType, TName> & {
  kind: "checkbox";
};

export type AuthFormFieldDefinitionType<
  TFormType extends FieldValues,
  TName extends FieldPath<TFormType> = FieldPath<TFormType>,
> =
  | AuthTextFormFieldDefinitionType<TFormType, TName>
  | AuthPasswordFormFieldDefinitionType<TFormType, TName>
  | AuthCheckboxFormFieldDefinitionType<TFormType, TName>;

export type AuthFormShellPropsType<TFormType extends FieldValues> = Omit<
  AuthScreenShellPropsType,
  "children" | "actions" | "footer" | "formProps"
> & {
  control: Control<TFormType>;
  fields: AuthFormFieldDefinitionType<TFormType>[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
  noValidate?: boolean;
  formClassName?: string;
  helperLinks?: ReactNode;
  actions?: ReactNode;
};

export type AuthResultActionType = {
  children: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export type AuthResultViewPropsType = Omit<
  AuthScreenShellPropsType,
  "children" | "actions"
> & {
  description?: ReactNode;
  descriptionClassName?: string;
  loading?: boolean;
  loadingLabel?: ReactNode;
  actions?: ReactNode;
  primaryAction?: AuthResultActionType;
  secondaryAction?: AuthResultActionType;
};
