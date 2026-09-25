import { createClient, type User } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function findUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((candidate: User) => candidate.email?.toLowerCase() === email);
    if (user || data.users.length < 1000) return user ?? null;
  }
  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await request.json().catch(() => ({})) as {
      email?: unknown;
      phone_suffix?: unknown;
      password?: unknown;
    };

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const phoneSuffix = typeof payload.phone_suffix === "string"
      ? payload.phone_suffix.replace(/\D/g, "")
      : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, 400);
    if (!/^\d{4}$/.test(phoneSuffix)) {
      return json({ error: "Informe os 4 últimos números do telefone." }, 400);
    }
    if (password.length < 8 || password.length > 72) {
      return json({ error: "A senha deve ter entre 8 e 72 caracteres." }, 400);
    }

    const admin = createClient(requiredEnv("SUPABASE_URL"), secretKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const pepper = requiredEnv("ACTIVATION_PEPPER");
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const [emailHash, ipHash] = await Promise.all([
      sha256(`${pepper}:email:${email}`),
      sha256(`${pepper}:ip:${forwardedFor}`),
    ]);
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count, error: countError } = await admin
      .from("access_activation_attempts")
      .select("id", { count: "exact", head: true })
      .or(`email_hash.eq.${emailHash},ip_hash.eq.${ipHash}`)
      .gte("created_at", windowStart);
    if (countError) throw countError;
    if ((count ?? 0) >= 5) {
      return json({ error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." }, 429);
    }

    const registerAttempt = async (succeeded: boolean) => {
      const { error } = await admin.from("access_activation_attempts").insert({
        email_hash: emailHash,
        ip_hash: ipHash,
        succeeded,
      });
      if (error) console.error("activation-attempt", error.message);
    };

    const { data: entitlement, error: entitlementError } = await admin
      .from("entitlements")
      .select("id, auth_user_id, activated_at, status, customer_phone_last4")
      .eq("customer_email", email)
      .eq("product_key", "conserva-facil")
      .eq("status", "active")
      .order("granted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entitlementError) throw entitlementError;
    if (!entitlement || entitlement.customer_phone_last4 !== phoneSuffix) {
      await registerAttempt(false);
      return json({ error: "Não encontramos uma compra ativa com esses dados." }, 404);
    }
    if (entitlement.activated_at) {
      await registerAttempt(false);
      return json({ error: "Esta conta já foi ativada. Entre com seu e-mail e senha." }, 409);
    }

    let user: User | null = null;
    if (entitlement.auth_user_id) {
      const { data, error } = await admin.auth.admin.getUserById(entitlement.auth_user_id);
      if (error) throw error;
      user = data.user;
    } else {
      user = await findUserByEmail(admin, email);
    }

    if (user) {
      const { data, error } = await admin.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
      });
      if (error) throw error;
      user = data.user;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      user = data.user;
    }

    const { data: activated, error: activationError } = await admin
      .from("entitlements")
      .update({
        auth_user_id: user.id,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", entitlement.id)
      .is("activated_at", null)
      .select("id")
      .maybeSingle();

    if (activationError) throw activationError;
    if (!activated) {
      return json({ error: "Esta conta já foi ativada. Entre com seu e-mail e senha." }, 409);
    }

    const publicClient = createClient(requiredEnv("SUPABASE_URL"), publishableKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signIn, error: signInError } = await publicClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signIn.session) throw signInError ?? new Error("Session was not created");

    await registerAttempt(true);
    return json({
      message: "Acesso ativado.",
      session: {
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("activate-access", error);
    return json({ error: "Não foi possível ativar seu acesso agora." }, 500);
  }
});
