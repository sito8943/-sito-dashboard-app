import type { SupabaseSessionMapperOptions } from "./types";

export const DEFAULT_SUPABASE_SESSION_MAPPER_OPTIONS: Required<SupabaseSessionMapperOptions> =
  {
    defaultId: 0,
    defaultUsername: "",
    defaultEmail: "",
    usernameMetadataKeys: ["username", "name", "full_name"],
  };
