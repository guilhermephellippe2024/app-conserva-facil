import { adminClient, authenticatedUser, corsHeaders, json } from "../_shared/auth.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await authenticatedUser(request);
    if (!user?.email) return json({ error: "Faça login novamente para continuar." }, 401);

    const admin = adminClient();
    const { data: entitlement, error: entitlementError } = await admin
      .from("entitlements")
      .select("id, cakto_order_id, status")
      .eq("customer_email", user.email.toLowerCase())
      .eq("status", "active")
      .order("granted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entitlementError) throw entitlementError;
    if (!entitlement) return json({ error: "Não encontramos uma assinatura ativa para este e-mail." }, 404);

    const { data: existing } = await admin
      .from("subscription_cancellation_requests")
      .select("status, requested_at")
      .eq("entitlement_id", entitlement.id)
      .maybeSingle();
    if (existing) return json({ error: "O cancelamento desta assinatura já foi solicitado.", request: existing }, 409);

    const { data, error } = await admin
      .from("subscription_cancellation_requests")
      .insert({
        user_id: user.id,
        entitlement_id: entitlement.id,
        cakto_order_id: entitlement.cakto_order_id,
      })
      .select("status, requested_at")
      .single();
    if (error) throw error;

    return json({ message: "Cancelamento registrado.", request: data }, 201);
  } catch (error) {
    console.error("request-subscription-cancellation", error);
    return json({ error: "Não foi possível registrar o cancelamento." }, 500);
  }
});
