export const APP_ROUTES = {
  ROOT: "/",
  AUTH_SIGN_IN: "/auth/sign-in",
  NOTES: "/notes",
  CATEGORIES: "/categories",
  PROFILE: "/profile",
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
