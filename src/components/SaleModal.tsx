import { useState, type FormEvent } from "react";
import { recipes } from "../data/recipes";
import { saleSchema } from "../lib/schemas";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SaleModal({ open, onClose }: Props) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const addSale = useAppStore((state) => state.addSale);
  const user = useAuthStore((state) => state.user);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = saleSchema.safeParse({
      date: data.get("date"),
      recipeId: data.get("recipeId"),
      customer: data.get("customer"),
      quantity: data.get("quantity"),
      unitPrice: data.get("unitPrice"),
      unitCost: data.get("unitCost"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Revise os dados.");
      return;
    }

    try {
      setSaving(true);
      await addSale(parsed.data, user?.id);
      form.reset();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível registrar a venda.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#261013]/65 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="sale-modal-title" className="max-h-[94vh] w-full max-w-xl overflow-auto rounded-3xl bg-white shadow-2xl">
        <header className="relative border-b border-line px-6 py-5">
          <span className="text-xs font-bold uppercase tracking-widest text-wine">Nova venda</span>
          <h2 id="sale-modal-title" className="mt-1 pr-12 font-display text-3xl font-bold">Anotar nova venda</h2>
          <p className="text-sm text-muted">Preencha os dados de uma venda.</p>
          <button type="button" onClick={onClose} aria-label="Fechar formulário" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-blush text-2xl text-wine">×</button>
        </header>
        <form onSubmit={handleSubmit} className="grid gap-4 p-6">
          <Field label="Data"><input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="field" /></Field>
          <Field label="Sabor"><select name="recipeId" required className="field">{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}</select></Field>
          <Field label="Nome do cliente" optional><input name="customer" autoComplete="name" placeholder="Ex.: Ana" className="field" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Quantidade"><input type="number" name="quantity" min="1" defaultValue="1" required className="field" /></Field>
            <Field label="Preço por pote"><input inputMode="decimal" name="unitPrice" placeholder="Ex.: 18,00" required className="field" /></Field>
          </div>
          <Field label="Custo por pote" hint="Use o valor calculado na área “Calcular custo”."><input inputMode="decimal" name="unitCost" placeholder="Ex.: 7,50" required className="field" /></Field>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={saving} className="mt-1 rounded-xl bg-wine px-5 py-3.5 font-bold text-white transition hover:bg-[#5d0920] disabled:opacity-60">{saving ? "Salvando..." : "Registrar venda"}</button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, optional, hint, children }: { label: string; optional?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold">
      <span className="flex items-center gap-2">{label}{optional && <small className="rounded-full bg-[#f3edef] px-2 py-0.5 text-[10px] font-semibold text-muted">Opcional</small>}</span>
      {children}
      {hint && <small className="font-normal text-muted">{hint}</small>}
    </label>
  );
}
