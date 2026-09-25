import { createClient, type User } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function keyFromDictionary(name: string) {
  const raw = Deno.env.get(name);
  if (!raw) return null;
  const keys = JSON.parse(raw) as Record<string, string>;
  return keys.default ?? Object.values(keys)[0] ?? null;
}

function publishableKey() {
  return keyFromDictionary("SUPABASE_PUBLISHABLE_KEYS") ?? requiredEnv("SUPABASE_ANON_KEY");
}

function secretKey() {
  return keyFromDictionary("SUPABASE_SECRET_KEYS") ?? requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function adminClient() {
  return createClient(requiredEnv("SUPABASE_URL"), secretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticatedUser(request: Request): Promise<User | null> {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;

  const client = createClient(requiredEnv("SUPABASE_URL"), publishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}
