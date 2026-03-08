import { BaseAuthDto } from "./BaseAuthDto";

export type AuthDto<TExtra extends object = object> = BaseAuthDto<
  TExtra & {
    rememberMe?: boolean;
  }
>;
