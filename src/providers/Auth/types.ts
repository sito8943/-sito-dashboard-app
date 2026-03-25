import { SessionDto } from "lib";
import { BasicProviderPropTypes } from "providers";

export interface AuthProviderPropTypes extends BasicProviderPropTypes {
  guestMode?: string;
  user?: string;
  remember?: string;
  refreshTokenKey?: string;
  accessTokenExpiresAtKey?: string;
}

export type AuthProviderContextType = {
  account: SessionDto;
  logUser: (data: SessionDto, rememberMe?: boolean) => void;
  logoutUser: () => Promise<void>;
  logUserFromLocal: () => Promise<void>;
  isInGuestMode: () => boolean;
  setGuestMode: (value: boolean) => void;
};
