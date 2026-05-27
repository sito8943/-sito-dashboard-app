import type {
  AcceptedResponseDto,
  ConfirmEmailDto,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
} from "../../entities";
import { APIClient } from "../APIClient";
import type { APIClientAuthConfig } from "../types";
import type { IAuthApiClient } from "../IAuthApiClient";
import { Methods } from "../utils/services";
import type {
  ResolvedRestAuthRecoveryClientEndpoints,
  RestAuthRecoveryClientOptions,
} from "./types";
import { hasHttpStatus, resolveRestAuthApiClientEndpoints } from "./utils";

/**
 * REST adapter for {@link IAuthApiClient}. Wraps an {@link APIClient} and
 * hits the conventional `auth/password/*` and `auth/email/confirm*` endpoints.
 *
 * Pass an existing `APIClient` instance to share base URL, storage keys and
 * the centralized refresh/retry. Override endpoint paths via `options.endpoints`.
 */
export class RestAuthRecoveryClient implements IAuthApiClient {
  private readonly api: APIClient;
  private readonly endpoints: ResolvedRestAuthRecoveryClientEndpoints;

  constructor(api: APIClient, options?: RestAuthRecoveryClientOptions);
  constructor(
    baseUrl: string,
    userKey?: string,
    authConfig?: APIClientAuthConfig,
    options?: RestAuthRecoveryClientOptions,
  );
  constructor(
    apiOrBaseUrl: APIClient | string,
    userKeyOrOptions?: string | RestAuthRecoveryClientOptions,
    authConfig: APIClientAuthConfig = {},
    options?: RestAuthRecoveryClientOptions,
  ) {
    if (apiOrBaseUrl instanceof APIClient) {
      this.api = apiOrBaseUrl;
      this.endpoints = resolveRestAuthApiClientEndpoints(
        userKeyOrOptions as RestAuthRecoveryClientOptions | undefined,
      );
      return;
    }

    const userKey = (userKeyOrOptions as string | undefined) ?? "user";
    this.api = new APIClient(
      apiOrBaseUrl,
      userKey,
      false,
      undefined,
      authConfig,
    );
    this.endpoints = resolveRestAuthApiClientEndpoints(options);
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<AcceptedResponseDto> {
    return await this.api.doQuery<AcceptedResponseDto>(
      this.endpoints.forgotPassword,
      Methods.POST,
      data,
    );
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    await this.api.doQuery<null>(
      this.endpoints.resetPassword,
      Methods.POST,
      data,
    );
  }

  async resendConfirmEmail(
    data: ResendConfirmEmailDto,
  ): Promise<AcceptedResponseDto> {
    return await this.api.doQuery<AcceptedResponseDto>(
      this.endpoints.resendConfirmEmail,
      Methods.POST,
      data,
    );
  }

  async confirmEmail(data: ConfirmEmailDto): Promise<void> {
    try {
      await this.api.doQuery<null>(
        this.endpoints.confirmEmail,
        Methods.POST,
        data,
      );
    } catch (error) {
      const fallback = this.endpoints.confirmEmailFallback;
      if (!fallback || !hasHttpStatus(error, 404)) throw error;
      await this.api.doQuery<null>(fallback, Methods.POST, data);
    }
  }
}

export { RestAuthRecoveryClient as RestAuthApiClient };
