/**
 * Shared form payload shapes for the auth views. Generic over `TExtra` so
 * consumers can add fields (e.g. `name`, `username`) without forking the type.
 */

export type SignInFormType<TExtra extends object = object> = {
  email: string;
  password: string;
  rememberMe: boolean;
} & TExtra;

export type SignUpFormType<TExtra extends object = object> = {
  email: string;
  password: string;
  rPassword: string;
} & TExtra;

export type PasswordConfirmationFormType = {
  password: string;
  confirmPassword: string;
};

export type UpdatePasswordFormType = PasswordConfirmationFormType;

export type RecoveryFormType = {
  email: string;
};
