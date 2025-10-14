import AuthClient from "./AuthClient";

export class IManager {
  auth: AuthClient;

  constructor(baseUrl: string, userKey?: string) {
    this.auth = new AuthClient(baseUrl, userKey);
  }

  /**
   * @returns auth
   */
  get Auth(): AuthClient {
    return this.auth;
  }
}
