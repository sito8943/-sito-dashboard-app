import { AuthClient } from "./AuthClient";
import type { APIClientAuthConfig } from "./APIClient";

export class IManager {
  auth: AuthClient;

  constructor(
    baseUrl: string,
    userKey?: string,
    authConfig: APIClientAuthConfig = {}
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
