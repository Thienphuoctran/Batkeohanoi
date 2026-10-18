import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lkvrdfqyyigdsxtipfcy.supabase.co";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdnJkZnF5eWlnZHN4dGlwZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDMwMDIsImV4cCI6MjEwNzgxOTAwMn0.6ybeLwIDJeVjgivZ1_znxtAmDRE_sswyv_4XR6fPZEE";

// Client công khai cho Frontend (tuân thủ Row Level Security)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Client đặc quyền phía Server Actions (vượt qua RLS khi gọi Stored Procedures)
export const getAdminClient = (): SupabaseClient => {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdnJkZnF5eWlnZHN4dGlwZmN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjI0MzAwMiwiZXhwIjoyMTA3ODE5MDAyfQ.rJSVcYRH76WmVeYGgpU2QbyU7OXX1pjiQn1RmOC07a0";
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};
