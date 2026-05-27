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
  ResolvedRestAuthApiClientEndpoints,
  RestAuthApiClientOptions,
} from "./types";
import { hasHttpStatus, resolveRestAuthApiClientEndpoints } from "./utils";

/**
 * REST adapter for {@link IAuthApiClient}. Wraps an {@link APIClient} and
 * hits the conventional `auth/password/*` and `auth/email/confirm*` endpoints.
 *
 * Pass an existing `APIClient` instance to share base URL, storage keys and
 * the centralized refresh/retry. Override endpoint paths via `options.endpoints`.
 */
export class RestAuthApiClient implements IAuthApiClient {
  private readonly api: APIClient;
  private readonly endpoints: ResolvedRestAuthApiClientEndpoints;

  constructor(api: APIClient, options?: RestAuthApiClientOptions);
  constructor(
    baseUrl: string,
    userKey?: string,
    authConfig?: APIClientAuthConfig,
    options?: RestAuthApiClientOptions,
  );
  constructor(
    apiOrBaseUrl: APIClient | string,
    userKeyOrOptions?: string | RestAuthApiClientOptions,
    authConfig: APIClientAuthConfig = {},
    options?: RestAuthApiClientOptions,
  ) {
    if (apiOrBaseUrl instanceof APIClient) {
      this.api = apiOrBaseUrl;
      this.endpoints = resolveRestAuthApiClientEndpoints(
        userKeyOrOptions as RestAuthApiClientOptions | undefined,
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
