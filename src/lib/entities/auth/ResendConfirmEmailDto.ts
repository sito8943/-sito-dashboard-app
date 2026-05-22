export type ResendConfirmEmailDto<TExtra extends object = object> = {
  email: string;
  redirectTo?: string;
} & TExtra;
