export type BaseAuthDto<TExtra extends object = object> = {
  email: string;
  password: string;
} & TExtra;
