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

type RefundRequest = {
  status: "requested" | "processing" | "refunded" | "rejected";
  requested_at: string;
};

const statusLabels: Record<RefundRequest["status"], string> = {
  requested: "Solicitação recebida",
  processing: "Reembolso em processamento",
  refunded: "Reembolso concluído",
  rejected: "Solicitação analisada",
};

export default function PlanPage() {
  const user = useAuthStore((state) => state.user);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(supabaseConfigured);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      if (!supabaseConfigured || !user) {
        const demoPurchase = new Date();
        demoPurchase.setDate(demoPurchase.getDate() - 2);
        if (active) {
          setEntitlement({ id: "demo", cakto_order_id: "demo", granted_at: demoPurchase.toISOString(), status: "active" });
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

      const currentEntitlement = data as Entitlement | null;
      setEntitlement(currentEntitlement);
      if (currentEntitlement) {
        const { data: request } = await supabase
          .from("refund_requests")
          .select("status, requested_at")
          .eq("entitlement_id", currentEntitlement.id)
          .maybeSingle();
        if (active) setRefundRequest(request as RefundRequest | null);
      }
      if (active) setLoading(false);
    }

    void loadPlan();
    return () => { active = false; };
  }, [user]);

  const guarantee = useMemo(() => {
    if (!entitlement) return null;
    const deadline = new Date(new Date(entitlement.granted_at).getTime() + 7 * 24 * 60 * 60 * 1000);
    const remainingMs = deadline.getTime() - Date.now();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    return {
      remainingDays,
      available: entitlement.status === "active" && remainingMs >= 0,
    };
  }, [entitlement]);

  async function handleRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parsed = refundSchema.safeParse({ reason });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Informe o motivo do reembolso.");
      return;
    }
    if (!entitlement || !guarantee?.available || refundRequest) return;

    setSubmitting(true);
    if (!supabaseConfigured || !user) {
      setRefundRequest({ status: "requested", requested_at: new Date().toISOString() });
      setMessage("Solicitação demonstrativa registrada.");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("refund_requests")
      .insert({
        user_id: user.id,
        entitlement_id: entitlement.id,
        cakto_order_id: entitlement.cakto_order_id,
        reason: parsed.data.reason,
      })
      .select("status, requested_at")
      .single();

    setSubmitting(false);
    if (error) {
      setMessage(error.code === "23505" ? "Já existe uma solicitação para esta compra." : "Não foi possível enviar. Tente novamente.");
      return;
    }

    setRefundRequest(data as RefundRequest);
    setReason("");
    setMessage("Pedido enviado. Você receberá a confirmação após o processamento na Cakto.");
  }

  if (loading) return <div className="grid min-h-72 place-items-center font-bold text-wine">Carregando seu plano…</div>;

  return (
    <section className="mx-auto max-w-3xl">
      <span className="text-xs font-bold uppercase tracking-[.16em] text-wine">Sua assinatura</span>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Meu plano</h1>
      <p className="mt-2 text-muted">Consulte seu acesso e solicite ajuda com a sua compra.</p>

      <div className="mt-7 overflow-hidden rounded-3xl border border-line bg-white shadow-[0_18px_55px_rgba(72,29,42,.08)]">
        <div className="flex flex-col gap-4 border-b border-line bg-gradient-to-r from-[#fff9f3] to-blush/40 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <span className="inline-flex rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald">Plano ativo</span>
            <h2 className="mt-3 font-display text-2xl font-bold">Conserva Fácil</h2>
            <p className="mt-1 text-sm text-muted">Acesso às receitas, custos e controle de vendas.</p>
          </div>
          {guarantee && (
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-left sm:text-right">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted">Garantia</span>
              <strong className="mt-1 block text-wine">{guarantee.available ? `${guarantee.remainingDays} dia${guarantee.remainingDays === 1 ? "" : "s"} restante${guarantee.remainingDays === 1 ? "" : "s"}` : "Prazo encerrado"}</strong>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold">Garantia de 7 dias</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Você pode pedir o reembolso dentro do prazo de garantia. Depois da confirmação pela Cakto, o valor será devolvido pelo meio de pagamento utilizado e o acesso será encerrado.</p>

          {!entitlement && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Não encontramos uma compra vinculada a este e-mail.</div>}

          {refundRequest ? (
            <div className="mt-6 rounded-2xl border border-emerald/20 bg-emerald/5 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">Pedido registrado</span>
              <strong className="mt-1 block text-lg">{statusLabels[refundRequest.status]}</strong>
              <p className="mt-1 text-sm text-muted">Enviado em {new Date(refundRequest.requested_at).toLocaleString("pt-BR")}.</p>
            </div>
          ) : (
            <form onSubmit={handleRefund} className="mt-6 grid gap-3">
              <label htmlFor="refund-reason" className="text-sm font-bold">Por que você quer o reembolso? <span className="text-wine">*</span></label>
              <textarea id="refund-reason" value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} rows={5} disabled={!guarantee?.available} placeholder="Conte brevemente o motivo da sua solicitação." className="field min-h-32 resize-y disabled:cursor-not-allowed disabled:opacity-60" />
              <div className="flex items-center justify-between text-xs text-muted"><span>Campo obrigatório</span><span>{reason.length}/1000</span></div>
              {message && <p role="alert" className="rounded-xl bg-blush p-3 text-sm text-wine">{message}</p>}
              <button type="submit" disabled={submitting || !entitlement || !guarantee?.available} className="mt-2 min-h-12 rounded-xl bg-wine px-5 py-3 font-bold text-white transition hover:bg-[#5f0d23] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Enviando pedido…" : "Pedir reembolso"}</button>
            </form>
          )}

          {message && refundRequest && <p role="status" className="mt-4 rounded-xl bg-blush p-3 text-sm text-wine">{message}</p>}
        </div>
      </div>
    </section>
  );
}
