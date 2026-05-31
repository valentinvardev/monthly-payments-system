import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Privileged Supabase client for server-side admin operations (creating
// users, sending invites by email, etc.). Uses the secret key so RLS is
// bypassed — never import from a client component.
let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;
  cached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
