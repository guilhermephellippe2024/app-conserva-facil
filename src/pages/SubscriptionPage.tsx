import { useEffect, useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

const refundSchema = z.object({
  reason: z.string().trim().min(3, "Conte brevemente por que você quer o reembolso.").max(1000),
});

type Entitlement = {
  id: string;
  cakto_order_id: string;
  granted_at: string;
  status: "active" | "refunded" | "chargeback" | "canceled";
};

type RequestStatus = { status: string; requested_at: string };

export default function SubscriptionPage() {
  const user = useAuthStore((state) => state.user);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [refundRequest, setRefundRequest] = useState<RequestStatus | null>(null);
  const [cancellationRequest, setCancellationRequest] = useState<RequestStatus | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(supabaseConfigured);
  const [busy, setBusy] = useState<"refund" | "cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabaseConfigured || !user) {
        const demoDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        if (active) {
          setEntitlement({ id: "demo", cakto_order_id: "demo", granted_at: demoDate.toISOString(), status: "active" });
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("entitlements")
        .select("id, cakto_order_id, granted_at, status")
        .order("granted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setMessage("Não foi possível carregar os dados do plano.");
        setLoading(false);
        return;
      }

      const plan = data as Entitlement | null;
      setEntitlement(plan);
      if (plan) {
        const [refund, cancellation] = await Promise.all([
          supabase.from("refund_requests").select("status, requested_at").eq("entitlement_id", plan.id).maybeSingle(),
          supabase.from("subscription_cancellation_requests").select("status, requested_at").eq("entitlement_id", plan.id).maybeSingle(),
        ]);
        if (active) {
          setRefundRequest(refund.data as RequestStatus | null);
          setCancellationRequest(cancellation.data as RequestStatus | null);
        }
      }
      if (active) setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [user]);

  const guarantee = useMemo(() => {
    if (!entitlement) return null;
    const total = 7 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(entitlement.granted_at).getTime();
    const remaining = total - elapsed;
    return {
      available: entitlement.status === "active" && remaining >= 0,
      days: Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000))),
      progress: Math.max(0, Math.min(100, (remaining / total) * 100)),
    };
  }, [entitlement]);

  const activePlan = entitlement?.status === "active";

  async function requestRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parsed = refundSchema.safeParse({ reason });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Informe o motivo do reembolso.");
      return;
    }
    if (!entitlement || !guarantee?.available || refundRequest) return;

    setBusy("refund");
    if (!supabaseConfigured || !user) {
      setRefundRequest({ status: "requested", requested_at: new Date().toISOString() });
      setReason("");
      setMessage("Solicitação demonstrativa registrada.");
      setBusy(null);
      return;
    }

    const { data, error } = await supabase.functions.invoke("request-refund", {
      body: { reason: parsed.data.reason },
    });

    setBusy(null);
    if (error) {
      setMessage(error.code === "23505" ? "Já existe uma solicitação para esta compra." : "Não foi possível enviar. Tente novamente.");
      return;
    }
    setRefundRequest((data as { request: RequestStatus }).request);
    setReason("");
    setMessage("Pedido de reembolso enviado.");
  }

  async function requestCancellation() {
    if (!entitlement || !activePlan || cancellationRequest) return;
    setBusy("cancel");
    setMessage("");

    if (!supabaseConfigured || !user) {
      setCancellationRequest({ status: "requested", requested_at: new Date().toISOString() });
      setBusy(null);
      setConfirmCancel(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("request-subscription-cancellation");

    setBusy(null);
    if (error) {
      setMessage(error.code === "23505" ? "O cancelamento desta assinatura já foi solicitado." : "Não foi possível solicitar o cancelamento.");
      return;
    }
    setCancellationRequest((data as { request: RequestStatus }).request);
    setConfirmCancel(false);
  }

  if (loading) return <div className="grid min-h-72 place-items-center font-bold text-wine">Carregando seu plano…</div>;

  return (
    <section className="mx-auto max-w-4xl">
      <span className="text-xs font-bold uppercase tracking-[.18em] text-wine">Assinatura e cobrança</span>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Meu plano</h1>
      <p className="mt-2 text-muted">Gerencie sua assinatura mensal e sua garantia.</p>

      <div className="mt-7 overflow-hidden rounded-[28px] bg-wine text-white shadow-[0_24px_70px_rgba(116,16,42,.22)]">
        <div className="relative p-7 md:p-9">
          <div className="absolute -right-12 -top-16 size-52 rounded-full bg-gold/15 blur-2xl" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold">● {activePlan ? "Assinatura ativa" : entitlement ? "Assinatura encerrada" : "Plano não localizado"}</span>
              <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">Conserva Fácil</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">Receitas práticas, cálculo de custos e acompanhamento das suas vendas.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
              <span className="block text-xs font-bold uppercase tracking-widest text-white/65">Seu ciclo</span>
              <strong className="mt-1 block text-xl">Plano mensal</strong>
              <span className="mt-1 block text-sm text-white/70">Renovação automática</span>
            </div>
          </div>
        </div>
      </div>

      {guarantee && (
        <div className="relative mt-6 overflow-hidden rounded-[28px] border border-[#f0c557] bg-gradient-to-br from-[#fff8dc] via-[#fffdf5] to-[#fde7a6] p-6 shadow-[0_18px_45px_rgba(183,132,12,.14)] md:p-8">
          <div className="absolute -right-10 -top-12 size-40 rounded-full bg-gold/40 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-wine text-3xl shadow-lg">🛡️</div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-[.16em] text-[#8a6506]">Compra protegida</span>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink">Garantia de 7 dias</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{guarantee.available ? `Você ainda tem ${guarantee.days} dia${guarantee.days === 1 ? "" : "s"} para solicitar o reembolso.` : "O prazo de garantia desta compra foi encerrado."}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-wine transition-all" style={{ width: `${guarantee.progress}%` }} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_16px_45px_rgba(72,29,42,.07)] md:p-8">
          <h2 className="font-display text-2xl font-bold">Solicitar reembolso</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Disponível durante a garantia. Após a confirmação, o valor será devolvido e o acesso será encerrado.</p>

          {refundRequest ? (
            <div className="mt-6 rounded-2xl border border-emerald/20 bg-emerald/5 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">Pedido registrado</span>
              <strong className="mt-1 block">Reembolso solicitado</strong>
              <p className="mt-1 text-sm text-muted">Enviado em {new Date(refundRequest.requested_at).toLocaleString("pt-BR")}.</p>
            </div>
          ) : (
            <form onSubmit={requestRefund} className="mt-6 grid gap-3">
              <label htmlFor="refund-reason" className="text-sm font-bold">Por que você quer o reembolso? <span className="text-wine">*</span></label>
              <textarea id="refund-reason" value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={5} disabled={!guarantee?.available} placeholder="Conte brevemente o motivo da sua solicitação." className="field min-h-32 resize-y disabled:cursor-not-allowed disabled:opacity-60" />
              <div className="flex justify-between text-xs text-muted"><span>Campo obrigatório</span><span>{reason.length}/1000</span></div>
              <button disabled={busy === "refund" || !guarantee?.available || !entitlement} className="mt-2 min-h-12 rounded-xl bg-wine px-5 py-3 font-bold text-white transition hover:bg-[#5f0d23] disabled:cursor-not-allowed disabled:opacity-50">{busy === "refund" ? "Enviando…" : "Pedir reembolso"}</button>
            </form>
          )}
          {message && <p role="status" className="mt-4 rounded-xl bg-blush p-3 text-sm text-wine">{message}</p>}
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6 md:p-8">
          <div className="grid size-11 place-items-center rounded-xl bg-canvas text-xl">↻</div>
          <h2 className="mt-5 font-display text-2xl font-bold">Renovação mensal</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Ao cancelar, não haverá novas cobranças. Seu acesso continua até o fim do período já pago.</p>
          {cancellationRequest ? (
            <div className="mt-6 rounded-2xl bg-canvas p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-wine">Cancelamento solicitado</span>
              <p className="mt-1 text-sm text-muted">Aguardando confirmação da Cakto.</p>
            </div>
          ) : (
            <button onClick={() => setConfirmCancel(true)} disabled={!activePlan} className="mt-6 min-h-11 w-full rounded-xl border border-wine px-4 py-2.5 text-sm font-bold text-wine transition hover:bg-blush disabled:cursor-not-allowed disabled:opacity-50">Cancelar assinatura</button>
          )}
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl md:p-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-blush text-xl text-wine">!</div>
            <h2 id="cancel-title" className="mt-5 font-display text-2xl font-bold">Cancelar a assinatura?</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Você não receberá novas cobranças. O acesso continuará disponível até o final do período que já foi pago. Isso não solicita reembolso.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={() => setConfirmCancel(false)} className="min-h-11 rounded-xl border border-line px-4 font-bold text-ink">Continuar no plano</button>
              <button onClick={requestCancellation} disabled={busy === "cancel"} className="min-h-11 rounded-xl bg-wine px-4 font-bold text-white disabled:opacity-60">{busy === "cancel" ? "Solicitando…" : "Confirmar cancelamento"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
