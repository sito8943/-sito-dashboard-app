export type ForgotPasswordDto<TExtra extends object = object> = {
  email: string;
  redirectTo?: string;
} & TExtra;
