import { useEffect, useMemo, useState } from "react";
import { recipes, type Recipe } from "../data/recipes";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";

export default function RecipesPage() {
  const [selected, setSelected] = useState<Recipe | null>(null);
  const completed = useAppStore((state) => state.completedRecipes);
  const toggleRecipe = useAppStore((state) => state.toggleRecipe);
  const globalRecipeSales = useAppStore((state) => state.globalRecipeSales);
  const loadGlobalRecipeSales = useAppStore((state) => state.loadGlobalRecipeSales);
  const loadingGlobalSales = useAppStore((state) => state.loadingGlobalSales);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void loadGlobalRecipeSales(user?.id).catch(() => undefined);
  }, [loadGlobalRecipeSales, user?.id]);

  const rankedRecipes = useMemo(() => recipes
    .map((recipe) => ({ recipe, salesCount: globalRecipeSales[recipe.id] || 0 }))
    .sort((a, b) => b.salesCount - a.salesCount), [globalRecipeSales]);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Receitas que mais estão vendendo:</h1>
          <p className="mt-2 text-muted">Ranking calculado com as vendas registradas por todos os usuários do aplicativo.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {rankedRecipes.map(({ recipe, salesCount }, index) => {
          const done = completed.includes(recipe.id);
          return (
            <article key={recipe.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:shadow-xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
              <button onClick={() => setSelected(recipe)} className="relative block h-48 w-full overflow-hidden md:h-full md:min-h-56">
                <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-wine text-sm font-bold text-white shadow-lg">#{index + 1}</span>
                {done && <span className="absolute right-3 top-3 rounded-full bg-emerald px-3 py-1.5 text-xs font-bold text-white">Concluída ✓</span>}
              </button>
              <div className="p-5 relative">
                <div className="absolute top-0 right-0 bg-blush px-3 rounded-bl-2xl-xl">
                  <p className="py-2  font-bold">
                    {loadingGlobalSales ? "Atualizando vendas…" : <>🔥 {salesCount} {salesCount === 1 ? "venda no app" : "vendas no app"}</>}
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-wine">{done ? "Você já fez" : "Receita guiada"}</span>
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{recipe.name}</h2>
                <p className="mt-1 text-sm text-muted">{recipe.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted"><span className="rounded-lg bg-[#f6f2f3] px-2.5 py-1.5">{recipe.time}</span><span className="rounded-lg bg-[#f6f2f3] px-2.5 py-1.5">{recipe.yield}</span></div>
                <button onClick={() => setSelected(recipe)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-wine px-4 py-3 font-bold text-white">Ver receita <span className="grid size-7 place-items-center rounded-full bg-white/15">→</span></button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#261013]/65 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white shadow-2xl">
            <header className="relative bg-wine px-7 py-7 text-white">
              <button onClick={() => setSelected(null)} aria-label="Fechar receita" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/15 text-2xl">×</button>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Receita guiada</span>
              <h2 className="mt-1 pr-12 font-display text-3xl font-bold">{selected.name}</h2>
              <p className="mt-1 text-white/80">{selected.summary}</p>
            </header>
            <div className="p-7">
              <h3 className="font-display text-xl font-bold">Você vai precisar</h3>
              <ul className="mt-3">{selected.ingredients.map(([name, amount]) => <li key={name} className="flex justify-between gap-4 border-b border-line py-2.5"><span>{name}</span><b className="text-wine">{amount}</b></li>)}</ul>
              <h3 className="mt-7 font-display text-xl font-bold">Como fazer</h3>
              <ol className="mt-4 grid gap-4">{selected.steps.map((step, index) => <li key={step} className="grid grid-cols-[34px_1fr] gap-3"><span className="grid size-[34px] place-items-center rounded-full bg-wine font-bold text-white">{index + 1}</span><span>{step}</span></li>)}</ol>
              <aside className="mt-7 rounded-xl border-l-4 border-gold bg-[#fff5d4] p-4"><strong>Uma dica:</strong> {selected.tip}</aside>
              <section className="mt-7" aria-labelledby="recipe-faq-title">
                <h3 id="recipe-faq-title" className="font-display text-xl font-bold">Dúvidas frequentes</h3>
                <div className="mt-3 grid gap-2">
                  {selected.faq.map((item) => (
                    <details key={item.question} className="group rounded-xl border border-line bg-[#fcfafb] px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink">{item.question}<span className="text-xl text-wine transition group-open:rotate-45">+</span></summary>
                      <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-muted">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
              <button onClick={() => { toggleRecipe(selected.id); setSelected(null); }} className="mt-5 w-full rounded-xl bg-wine px-5 py-3.5 font-bold text-white">{completed.includes(selected.id) ? "Marcar como não concluída" : "Marcar como concluída"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
