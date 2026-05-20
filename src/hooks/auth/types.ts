import type { IAuthApiClient, Location } from "lib";

export type AuthFlowStatus =
  | "idle"
  | "submitting"
  | "verifying"
  | "success"
  | "invalid_token"
  | "error";

export type AuthLocationInput = Pick<Location, "hash" | "search">;

export type UseUpdatePasswordFlowOptions = {
  authApi: IAuthApiClient;
  location: AuthLocationInput;
  successRedirectDelayMs?: number;
  onSuccess?: () => void;
  onSuccessDelayElapsed?: () => void;
  onInvalidToken?: () => void;
  onError?: (error: unknown) => void;
};

export type UseUpdatePasswordFlowResult = {
  status: AuthFlowStatus;
  error: unknown;
  isSubmitting: boolean;
  submit: (newPassword: string) => Promise<void>;
  reset: () => void;
};

export type UseConfirmEmailFlowOptions = {
  authApi: IAuthApiClient;
  location: AuthLocationInput;
  onCleanUrl?: () => void;
  onInvalidToken?: () => void;
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
};

export type UseConfirmEmailFlowResult = {
  status: AuthFlowStatus;
  error: unknown;
  isVerifying: boolean;
  verify: () => Promise<void>;
  reset: () => void;
};
