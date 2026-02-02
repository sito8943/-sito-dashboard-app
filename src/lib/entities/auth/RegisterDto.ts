import { BaseRegisterDto } from "./BaseRegisterDto";

export type RegisterDto<
  TExtra = Record<string, never>,
  TAuthExtra = Record<string, never>
> = BaseRegisterDto<TExtra, TAuthExtra>;
