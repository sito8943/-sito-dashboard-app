import { APIClient } from "../APIClient";

import {
  AuthDto,
  RefreshDto,
  RegisterDto,
  SessionDto,
  SignOutDto,
} from "../../entities";
import type { APIClientAuthConfig } from "../types";
import type { IAuthClient } from "../IAuthClient";
import { Methods } from "../utils/services";
import { AUTH_CLIENT_ENDPOINTS } from "./constants";
import type { RestSessionAuthClientLogoutOptions } from "./types";

/** REST session auth client for login, refresh, logout and session endpoints. */
export class RestSessionAuthClient implements IAuthClient {
  api: APIClient;

  /**
   * @param baseUrl - API base URL.
   * @param userKey - Storage key for user session data.
   * @param authConfig - Custom auth storage key configuration.
   */
  constructor(
    baseUrl: string,
    userKey: string = "user",
    authConfig: APIClientAuthConfig = {},
  ) {
    this.api = new APIClient(baseUrl, userKey, false, undefined, authConfig);
  }

  async login(data: AuthDto) {
    return await this.api.doQuery<SessionDto, AuthDto>(
      AUTH_CLIENT_ENDPOINTS.login,
      Methods.POST,
      data,
    );
  }

  async refresh(data: RefreshDto) {
    return await this.api.doQuery<SessionDto, RefreshDto>(
      AUTH_CLIENT_ENDPOINTS.refresh,
      Methods.POST,
      data,
    );
  }

  async logout(options?: RestSessionAuthClientLogoutOptions) {
    const header = options?.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined;
    const body: SignOutDto | undefined = options?.refreshToken
      ? { refreshToken: options.refreshToken }
      : undefined;

    return await this.api.doQuery<void, SignOutDto | undefined>(
      AUTH_CLIENT_ENDPOINTS.logout,
      Methods.POST,
      body,
      header,
    );
  }

  async register(userData: RegisterDto) {
    return await this.api.doQuery<SessionDto, RegisterDto>(
      AUTH_CLIENT_ENDPOINTS.register,
      Methods.POST,
      userData,
    );
  }

  async getSession() {
    return await this.api.doQuery<SessionDto>(
      AUTH_CLIENT_ENDPOINTS.session,
      Methods.GET,
      undefined,
      this.api.defaultTokenAcquirer(),
    );
  }
}

export { RestSessionAuthClient as AuthClient };
