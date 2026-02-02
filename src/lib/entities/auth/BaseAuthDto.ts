export type BaseAuthDto<TExtra = Record<string, never>> = {
  email: string;
  password: string;
} & TExtra;

