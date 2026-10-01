import { useMemo, useState } from "react";
import { costSchema } from "../lib/schemas";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CostPage() {
  const [values, setValues] = useState({ fruit: "18,00", sugar: "7,50", jars: "15,00", extras: "5,00", yield: "6" });
  const result = useMemo(() => costSchema.safeParse(values), [values]);
  const unit = result.success ? (result.data.fruit + result.data.sugar + result.data.jars + result.data.extras) / result.data.yield : 0;

  return (
    <>
      <header className="mb-8 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-wine">Preço sem adivinhação</span>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl md:text-5xl">Quanto custa cada pote?</h1>
        <p className="mt-2 text-muted">Coloque quanto você gastou no lote. O cálculo acontece automaticamente.</p>
      </header>
      <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-xl lg:grid-cols-[1.15fr_.85fr]">
        <form className="grid gap-3 p-6 md:p-8" onSubmit={(event) => event.preventDefault()}>
          <div className="mb-1"><h2 className="font-display text-2xl font-bold">Gastos do lote</h2><p className="text-sm text-muted">Use o valor total de cada item.</p></div>
          {([["fruit", "Frutas"], ["sugar", "Açúcar e limão"], ["jars", "Potes e tampas"], ["extras", "Gás e outros"]] as const).map(([name, label]) => (
            <label key={name} className="grid grid-cols-[minmax(0,1fr)_auto_104px] sm:grid-cols-[minmax(0,1fr)_auto_120px] items-center gap-2 border-b border-line py-2 font-semibold"><span>{label}</span><small className="text-muted">R$</small><input value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} inputMode="decimal" className="field min-w-0 text-right" /></label>
          ))}
          <label className="mt-1 grid grid-cols-[minmax(0,1fr)_104px] sm:grid-cols-[minmax(0,1fr)_120px] items-center gap-3 font-semibold">Quantos potes rendeu?<input value={values.yield} onChange={(event) => setValues({ ...values, yield: event.target.value })} type="number" min="1" className="field min-w-0 text-right" /></label>
        </form>
        <aside className="flex flex-col justify-center bg-wine p-8 text-white md:p-12">
          <span className="text-white/70">Seu custo por pote</span>
          <strong className="my-2 break-words font-display text-4xl font-bold sm:text-5xl">{money.format(unit)}</strong>
          <div className="mt-5 rounded-2xl bg-gold p-4 text-ink"><small>Faixa inicial para testar</small><b className="mt-1 block">{money.format(unit * 2)} e {money.format(unit * 2.5)}</b></div>
          <p className="mt-4 text-sm text-white/70">É um ponto de partida. Depois inclua seu tempo e ajuste a margem.</p>
        </aside>
      </div>
    </>
  );
}
