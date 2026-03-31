import { APIClient } from "./APIClient";

// entities
import {
  AuthDto,
  RefreshDto,
  RegisterDto,
  SessionDto,
  SignOutDto,
} from "../entities";
import { Methods } from "./utils/services";
import type { APIClientAuthConfig } from "./APIClient";

type AuthClientLogoutOptions = {
  accessToken?: string;
  refreshToken?: string;
};

/** Auth-focused API client for login, refresh, logout and session endpoints. */
export class AuthClient {
  api: APIClient;

  constructor(
    baseUrl: string,
    userKey: string = "user",
    authConfig: APIClientAuthConfig = {},
  ) {
    this.api = new APIClient(baseUrl, userKey, false, undefined, authConfig);
  }

  async login(data: AuthDto) {
    const endpoint = "auth/sign-in";
    const body = data;
    return await this.api.doQuery<SessionDto, AuthDto>(
      endpoint,
      Methods.POST,
      body,
    );
  }

  async refresh(data: RefreshDto) {
    const endpoint = "auth/refresh";
    return await this.api.doQuery<SessionDto, RefreshDto>(
      endpoint,
      Methods.POST,
      data,
    );
  }

  async logout(options?: AuthClientLogoutOptions) {
    const endpoint = "auth/sign-out";
    const header = options?.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined;
    const body: SignOutDto | undefined = options?.refreshToken
      ? { refreshToken: options.refreshToken }
      : undefined;

    return await this.api.doQuery<void, SignOutDto | undefined>(
      endpoint,
      Methods.POST,
      body,
      header,
    );
  }

  async register(userData: RegisterDto) {
    const endpoint = "auth/sign-up";
    return await this.api.doQuery<SessionDto, RegisterDto>(
      endpoint,
      Methods.POST,
      userData,
    );
  }

  async getSession() {
    const endpoint = "auth/session";

    return await this.api.doQuery<SessionDto>(
      endpoint,
      Methods.GET,
      undefined,
      this.api.defaultTokenAcquirer(),
    );
  }
}
