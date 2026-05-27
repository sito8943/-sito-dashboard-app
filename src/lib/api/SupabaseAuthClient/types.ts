import type { RegisterDto, SessionDto } from "../../entities";
import type {
  SupabaseSessionMapper,
  SupabaseSessionMapperOptions,
} from "../supabaseAuth";

export type SupabaseRegisterExtra = {
  name?: string;
  username?: string;
  redirectTo?: string;
  metadata?: Record<string, unknown>;
};

export type SupabaseRegisterDto<TExtra extends object = object> = RegisterDto<
  SupabaseRegisterExtra & TExtra
>;

export type SupabaseSignUpResult =
  | { status: "authenticated"; session: SessionDto }
  | { status: "confirmation_required"; email: string };

export type SupabaseAuthClientOptions = {
  /** Custom `Session -> SessionDto` mapper. Defaults to {@link mapSupabaseSessionToSessionDto}. */
  sessionMapper?: SupabaseSessionMapper;
  /** Defaults forwarded to the default mapper. Ignored when `sessionMapper` is provided. */
  mapperOptions?: SupabaseSessionMapperOptions;
  /**
   * Default `emailRedirectTo` used by `signUp` when the call does not provide one.
   * Useful when the consumer always sends users to the same confirm-email screen.
   */
  defaultSignUpRedirectTo?: string;
};
