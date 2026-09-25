import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useAppStore } from "../stores/appStore";

const navItems = [
  { to: "/", label: "Receitas", icon: "▣" },
  { to: "/vendas", label: "Minhas vendas", icon: "$" },
  { to: "/custos", label: "Calcular custo", icon: "▦" },
];

export default function Layout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const completed = useAppStore((state) => state.completedRecipes.length);

  async function handleSignOut() {
    await signOut();
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-canvas text-ink md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 py-2 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-0 md:bg-wine md:px-5 md:py-7">
        <NavLink to="/" className="hidden rounded-2xl bg-white p-2.5 shadow-lg md:block">
          <img src="/assets/logo-conserva-facil.png" alt="Conserva Fácil" className="h-auto max-h-14 w-full object-contain" />
        </NavLink>
        <nav className="grid grid-cols-3 gap-1 md:mt-12 md:grid-cols-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-xs font-semibold transition md:flex-row md:gap-3 md:px-3.5 md:py-3 md:text-base " + (isActive ? "bg-blush text-wine md:bg-white" : "text-muted hover:bg-white/10 md:text-white/80")}>
              <span className="grid size-5 place-items-center font-bold">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-white/15 bg-white/8 p-4 text-white md:block">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Continue assim</span>
          <strong className="mt-1 block font-display text-lg">Um pote de cada vez</strong>
          <small className="mt-1 block text-white/70">Seu próximo sabor pode virar sua próxima venda.</small>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex h-[72px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur md:h-[82px] md:px-12">
          <img src="/assets/logo-conserva-facil.png" alt="Conserva Fácil" className="w-36 md:hidden" />
          <div className="hidden leading-tight md:grid">
            <span className="text-xs text-muted">Primeira coleção</span>
            <strong>Minhas geleias</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-blush px-3 py-2 text-xs font-bold text-wine sm:block">{completed}/3 receitas</span>
            <div className="relative">
              <button onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Abrir menu do perfil" className="grid size-10 place-items-center rounded-full bg-wine font-bold text-white ring-blush transition focus:ring-4">
                {(user?.email?.[0] || "G").toUpperCase()}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-line bg-white p-2 shadow-xl">
                  <span className="block px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">{supabaseConfigured ? user?.email || "Minha conta" : "Modo demonstração"}</span>
                  <button onClick={() => { setProfileOpen(false); navigate("/plano"); }} className="mt-1 w-full rounded-xl px-3 py-2 text-left font-bold text-ink hover:bg-blush">◇ Meu plano</button>
                  <button onClick={handleSignOut} className="mt-1 w-full rounded-xl px-3 py-2 text-left font-bold text-wine hover:bg-blush">↪ Sair</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {!supabaseConfigured && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-xs text-amber-900">
            Modo demonstração: configure o Supabase para ativar login e sincronização.
          </div>
        )}
        <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-8 pb-28 md:w-[min(1120px,calc(100%-48px))] md:py-10 md:pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
