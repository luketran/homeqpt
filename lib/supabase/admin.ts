import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Client dùng service-role key — BỎ QUA RLS.
 * Chỉ import trong server action/route sau khi đã xác thực là admin.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
