import AuthClient from "./AuthClient";

export class IManager {
  auth: AuthClient;

  constructor(baseUrl: string) {
    this.auth = new AuthClient(baseUrl);
  }

  /**
   * @returns auth
   */
  get Auth(): AuthClient {
    return this.auth;
  }
}
