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

export type UpdatePasswordFormType = {
  password: string;
  rPassword: string;
};

export type RecoveryFormType = {
  email: string;
};
