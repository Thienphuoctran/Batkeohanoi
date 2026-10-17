import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

// Client công khai cho Frontend (tuân thủ Row Level Security)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Client đặc quyền phía Server Actions (vượt qua RLS khi gọi Stored Procedures)
export const getAdminClient = (): SupabaseClient => {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "mock-service-role-key";
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};
