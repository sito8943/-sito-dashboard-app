import { AuthClient } from "./AuthClient";
import type { APIClientAuthConfig } from "./APIClient";
import type { IAuthClient } from "./IAuthClient";

/** Root manager that exposes domain API clients for consumers. */
export class IManager {
  /**
   * Session-focused auth client. Defaults to the REST {@link AuthClient};
   * subclasses (e.g. Supabase managers) may swap in any {@link IAuthClient}
   * implementation.
   */
  auth: IAuthClient;

  /**
   * @param baseUrl - API base URL.
   * @param userKey - Storage key for user session data.
   * @param authConfig - Custom auth storage key configuration.
   */
  constructor(
    baseUrl: string,
    userKey?: string,
    authConfig: APIClientAuthConfig = {},
  ) {
    this.auth = new AuthClient(baseUrl, userKey, authConfig);
  }

  /**
   * @returns auth
   */
  get Auth(): IAuthClient {
    return this.auth;
  }
}
