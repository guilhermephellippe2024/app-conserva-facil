import { useEffect, useMemo, useState } from "react";
import SaleModal from "../components/SaleModal";
import { recipes } from "../data/recipes";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return day && month && year ? [day, month, year].join("/") : value;
}

export default function SalesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sales = useAppStore((state) => state.sales);
  const loading = useAppStore((state) => state.loadingSales);
  const loadSales = useAppStore((state) => state.loadSales);
  const removeSale = useAppStore((state) => state.removeSale);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadSales(user?.id).catch(() => setMessage("Não foi possível carregar suas vendas."));
  }, [loadSales, user?.id]);

  const totals = useMemo(() => sales.reduce((summary, sale) => ({
    revenue: summary.revenue + sale.quantity * sale.unitPrice,
    profit: summary.profit + sale.quantity * (sale.unitPrice - sale.unitCost),
    units: summary.units + sale.quantity,
  }), { revenue: 0, profit: 0, units: 0 }), [sales]);

  async function handleRemove(id: string) {
    if (!window.confirm("Remover esta venda? Os totais serão recalculados.")) return;
    try {
      await removeSale(id, user?.id);
      setMessage("Venda removida.");
    } catch {
      setMessage("Não foi possível remover a venda.");
    }
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-wine">Seu dinheiro organizado</span>
          <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">Minhas vendas</h1>
          <p className="mt-2 max-w-2xl text-muted">Anote cada venda e acompanhe quanto entrou e quanto realmente ficou de lucro.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-wine px-5 py-3.5 font-bold text-white shadow-lg"><span>＋</span> Anotar venda</button>
      </header>

      {message && <button onClick={() => setMessage("")} className="mb-4 w-full rounded-xl bg-blush px-4 py-2 text-sm text-wine">{message}</button>}

      <section aria-label="Resumo das vendas" className="mb-5 grid gap-3 sm:grid-cols-3">
        <Summary label="Faturamento" value={money.format(totals.revenue)} hint="Total recebido" />
        <Summary label="Lucro" value={money.format(totals.profit)} hint="Depois dos custos" highlight />
        <Summary label="Potes vendidos" value={String(totals.units)} hint="Em todas as vendas" />
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <header className="flex items-start justify-between gap-4 px-5 py-5">
          <div><h2 className="font-display text-2xl font-bold">Vendas registradas</h2><p className="text-sm text-muted">As vendas mais recentes aparecem primeiro.</p></div>
          <span className="rounded-full bg-blush px-3 py-1.5 text-xs font-bold text-wine">{sales.length} {sales.length === 1 ? "venda" : "vendas"}</span>
        </header>
        {loading ? (
          <p className="border-t border-line p-10 text-center text-muted">Carregando vendas...</p>
        ) : sales.length === 0 ? (
          <div className="grid min-h-60 place-items-center border-t border-line p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-blush font-bold text-wine">$</span><strong className="mt-3 block">Nenhuma venda anotada</strong><p className="mt-1 text-sm text-muted">Quando registrar a primeira, ela aparecerá aqui.</p></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="border-t border-line bg-[#fcfafb] text-left text-[11px] uppercase tracking-wide text-muted"><th className="table-cell">Data</th><th className="table-cell">Sabor</th><th className="table-cell">Cliente</th><th className="table-cell">Qtd.</th><th className="table-cell">Faturamento</th><th className="table-cell">Lucro</th><th className="w-12"><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>{sales.map((sale) => {
                const recipe = recipes.find((item) => item.id === sale.recipeId);
                return <tr key={sale.id} className="border-t border-line text-sm"><td className="table-cell">{formatDate(sale.date)}</td><td className="table-cell font-bold">{recipe?.name}</td><td className="table-cell">{sale.customer || "—"}</td><td className="table-cell">{sale.quantity}</td><td className="table-cell">{money.format(sale.quantity * sale.unitPrice)}</td><td className="table-cell font-bold text-emerald">{money.format(sale.quantity * (sale.unitPrice - sale.unitCost))}</td><td className="pr-3"><button onClick={() => handleRemove(sale.id)} aria-label="Remover esta venda" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-blush hover:text-wine"><TrashIcon /></button></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>

      <SaleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function Summary({ label, value, hint, highlight }: { label: string; value: string; hint: string; highlight?: boolean }) {
  return <article className={"rounded-2xl border p-5 shadow-sm " + (highlight ? "border-emerald bg-emerald text-white" : "border-line bg-white")}><span className={highlight ? "text-white/75" : "text-muted"}>{label}</span><strong className="mt-1 block font-display text-3xl font-bold">{value}</strong><small className={highlight ? "text-white/75" : "text-muted"}>{hint}</small></article>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" /></svg>;
}
