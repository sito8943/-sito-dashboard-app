import type { AuthDto, RefreshDto, RegisterDto, SessionDto } from "../entities";

/**
 * Session-focused auth contract shared by {@link RestSessionAuthClient}
 * (REST) and {@link SupabaseAuthClient} (Supabase). Backed by `IManager.auth`
 * so the same call sites work with either backend.
 *
 * `logout` accepts no required argument — adapters that need extra context
 * (e.g. REST `accessToken` / `refreshToken` header) widen via an optional
 * parameter at the implementation level.
 */
export interface IAuthClient {
  login(data: AuthDto): Promise<SessionDto>;
  refresh(data: RefreshDto): Promise<SessionDto>;
  register(data: RegisterDto): Promise<SessionDto>;
  getSession(): Promise<SessionDto>;
  logout(options?: unknown): Promise<void>;
}
