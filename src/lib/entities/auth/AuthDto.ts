import { BaseAuthDto } from "./BaseAuthDto";

export type AuthDto<TExtra = Record<string, never>> = BaseAuthDto<TExtra>;
