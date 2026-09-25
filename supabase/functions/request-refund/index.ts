import { adminClient, authenticatedUser, corsHeaders, json } from "../_shared/auth.ts";

const guaranteeDuration = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await authenticatedUser(request);
    if (!user?.email) return json({ error: "Faça login novamente para continuar." }, 401);

    const payload = await request.json().catch(() => ({})) as { reason?: unknown };
    const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
    if (reason.length < 3 || reason.length > 1000) {
      return json({ error: "Informe o motivo do reembolso." }, 400);
    }

    const admin = adminClient();
    const { data: entitlement, error: entitlementError } = await admin
      .from("entitlements")
      .select("id, cakto_order_id, granted_at, status")
      .eq("customer_email", user.email.toLowerCase())
      .eq("status", "active")
      .order("granted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entitlementError) throw entitlementError;
    if (!entitlement) return json({ error: "Não encontramos uma assinatura ativa para este e-mail." }, 404);

    const deadline = new Date(entitlement.granted_at).getTime() + guaranteeDuration;
    if (Date.now() > deadline) {
      return json({ error: "O prazo de 7 dias para reembolso foi encerrado." }, 422);
    }

    const { data: existing } = await admin
      .from("refund_requests")
      .select("status, requested_at")
      .eq("entitlement_id", entitlement.id)
      .maybeSingle();
    if (existing) return json({ error: "O reembolso desta compra já foi solicitado.", request: existing }, 409);

    const { data, error } = await admin
      .from("refund_requests")
      .insert({
        user_id: user.id,
        entitlement_id: entitlement.id,
        cakto_order_id: entitlement.cakto_order_id,
        reason,
      })
      .select("status, requested_at")
      .single();
    if (error) throw error;

    return json({ message: "Pedido de reembolso registrado.", request: data }, 201);
  } catch (error) {
    console.error("request-refund", error);
    return json({ error: "Não foi possível registrar o pedido de reembolso." }, 500);
  }
});
