import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY !, // This is the secret key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};