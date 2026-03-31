import { AuthClient } from "./AuthClient";
import type { APIClientAuthConfig } from "./APIClient";

/** Root manager that exposes domain API clients for consumers. */
export class IManager {
  auth: AuthClient;

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
  get Auth(): AuthClient {
    return this.auth;
  }
}
