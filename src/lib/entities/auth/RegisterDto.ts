import { BaseRegisterDto } from "./BaseRegisterDto";

export type RegisterDto<
  TExtra extends object = object,
  TAuthExtra extends object = object,
> = BaseRegisterDto<TExtra, TAuthExtra>;
