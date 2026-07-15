import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AuthDto,
  RefreshDto,
  RegisterDto,
  SessionDto,
} from "../../entities";
import type { IAuthClient } from "../IAuthClient";
import {
  mapSupabaseSessionToSessionDto,
  type SupabaseSessionMapper,
} from "../supabaseAuth";
import {
  AUTHENTICATED_SESSION_NOT_FOUND_ERROR,
  EMAIL_CONFIRMATION_REQUIRED_ERROR,
  NO_ACTIVE_SESSION_ERROR,
} from "./constants";
import type {
  SupabaseAuthClientOptions,
  SupabaseRegisterDto,
  SupabaseSignUpResult,
} from "./types";
import { resolveSupabaseSignUpMetadata, trimOrUndefined } from "./utils";

/**
 * Supabase Auth adapter mirroring the {@link RestSessionAuthClient} REST
 * contract (`login` / `refresh` / `register` / `getSession` / `logout`) plus
 * a richer `signUp` that exposes the confirmation-required path.
 *
 * Maps Supabase `Session` payloads into {@link SessionDto} via
 * {@link mapSupabaseSessionToSessionDto} (override with `options.sessionMapper`).
 *
 * `register` throws when Supabase returns no session (email confirmation
 * required). Call `signUp` directly when the caller needs to handle that case.
 */
export class SupabaseAuthClient implements IAuthClient {
  private readonly supabase: SupabaseClient;
  private readonly sessionMapper: SupabaseSessionMapper;
  private readonly defaultSignUpRedirectTo?: string;

  constructor(
    supabase: SupabaseClient,
    options: SupabaseAuthClientOptions = {},
  ) {
    this.supabase = supabase;
    this.defaultSignUpRedirectTo = options.defaultSignUpRedirectTo;
    if (options.sessionMapper) {
      this.sessionMapper = options.sessionMapper;
      return;
    }

    const mapperOptions = options.mapperOptions;
    this.sessionMapper = (session) =>
      mapSupabaseSessionToSessionDto(session, mapperOptions);
  }

  async login(data: AuthDto): Promise<SessionDto> {
    const { data: authData, error } =
      await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
    if (error) throw error;
    if (!authData.session)
      throw new Error(AUTHENTICATED_SESSION_NOT_FOUND_ERROR);
    return this.sessionMapper(authData.session);
  }

  async refresh(data: RefreshDto): Promise<SessionDto> {
    const { data: authData, error } = await this.supabase.auth.refreshSession({
      refresh_token: data.refreshToken,
    });
    if (error) throw error;
    if (!authData.session)
      throw new Error(AUTHENTICATED_SESSION_NOT_FOUND_ERROR);
    return this.sessionMapper(authData.session);
  }

  async getSession(): Promise<SessionDto> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw new Error(NO_ACTIVE_SESSION_ERROR);
    return this.sessionMapper(data.session);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * REST-symmetric `register`. Throws when the Supabase project requires email
   * confirmation (no session in the response). Use {@link signUp} to handle
   * that branch explicitly.
   */
  async register(data: RegisterDto): Promise<SessionDto> {
    const result = await this.signUp(data);
    if (result.status !== "authenticated") {
      throw new Error(EMAIL_CONFIRMATION_REQUIRED_ERROR);
    }
    return result.session;
  }

  /**
   * Supabase-specific sign-up. Returns a discriminated union so callers can
   * branch on `confirmation_required` (Supabase project enforces email
   * confirmation, no immediate session) vs `authenticated` (session ready).
   *
   * `user_metadata` defaults to `{ name, username: name }` where `name` is
   * resolved from `data.name -> data.username -> data.email` (trimmed).
   * Provide `data.metadata` to override the whole payload.
   */
  async signUp(data: SupabaseRegisterDto): Promise<SupabaseSignUpResult> {
    const redirectTo =
      trimOrUndefined(data.redirectTo) ?? this.defaultSignUpRedirectTo;
    const metadata = resolveSupabaseSignUpMetadata(data);

    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
        data: metadata,
      },
    });
    if (error) throw error;

    if (!authData.session) {
      return { status: "confirmation_required", email: data.email };
    }

    return {
      status: "authenticated",
      session: this.sessionMapper(authData.session),
    };
  }
}
