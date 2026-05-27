import type { Session } from "@supabase/supabase-js";

import type { SessionDto } from "lib";

export type SupabaseSessionMapper = (session: Session) => SessionDto;

export type SupabaseSessionMapperOptions = {
  defaultId?: number;
  defaultUsername?: string;
  defaultEmail?: string;
  usernameMetadataKeys?: string[];
};
