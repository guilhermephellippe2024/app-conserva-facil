import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useAppStore } from "../stores/appStore";
import InstallAppNotice from "./InstallAppNotice";

const navItems = [
  { to: "/", label: "Receitas", icon: "▣" },
  { to: "/vendas", label: "Minhas vendas", icon: "$" },
  { to: "/custos", label: "Calcular custo", icon: "▦" },
  { to: "/divulgar", label: "Como divulgar", icon: "↗" },
];

export default function Layout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const completed = useAppStore((state) => state.completedRecipes.length);

  useEffect(() => {
    if (!menuOpen || window.matchMedia("(min-width: 768px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  function closeMobileMenu() {
    if (window.matchMedia("(max-width: 767px)").matches) setMenuOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <div className={"min-h-screen w-full max-w-full overflow-x-clip bg-canvas text-ink md:grid " + (menuOpen ? "md:grid-cols-[240px_minmax(0,1fr)]" : "md:grid-cols-1")}>
      {menuOpen && (
        <aside aria-label="Menu principal" className="fixed inset-0 z-[60] flex min-h-dvh flex-col bg-wine p-5 text-white md:sticky md:top-0 md:h-screen md:min-h-0 md:px-5 md:py-7">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" onClick={closeMobileMenu} className="rounded-2xl bg-white p-2.5 shadow-lg">
              <img src="/assets/logo-conserva-facil.png" alt="Conserva Fácil" className="h-12 w-40 object-contain md:h-auto md:max-h-14 md:w-full" />
            </NavLink>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-3xl md:hidden">×</button>
          </div>

          <nav className="mt-10 grid gap-3 md:mt-12 md:gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={closeMobileMenu} className={({ isActive }) => "flex items-center gap-4 rounded-2xl px-4 py-4 text-lg font-semibold transition md:gap-3 md:rounded-xl md:px-3.5 md:py-3 md:text-base " + (isActive ? "bg-white text-wine shadow-lg" : "text-white/85 hover:bg-white/10")}>
                <span className="grid size-8 place-items-center rounded-lg bg-white/10 font-bold md:size-5 md:bg-transparent">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/15 bg-white/8 p-4 text-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Continue assim</span>
            <strong className="mt-1 block font-display text-lg">Um pote de cada vez</strong>
            <small className="mt-1 block text-white/70">Seu próximo sabor pode virar sua próxima venda.</small>
          </div>
        </aside>
      )}

      <div className="min-w-0 max-w-full">
        <header className="flex h-[72px] min-w-0 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur sm:px-5 md:h-[82px] md:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Ocultar menu" : "Mostrar menu"} className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-xl font-bold text-wine shadow-sm">{menuOpen ? "×" : "☰"}</button>
            <img src="/assets/logo-conserva-facil.png" alt="Conserva Fácil" className="w-32 max-w-[45vw] md:hidden" />
            <div className="hidden leading-tight md:grid"><span className="text-xs text-muted">Primeira coleção</span><strong>Minhas geleias</strong></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-blush px-3 py-2 text-xs font-bold text-wine sm:block">{completed}/3 receitas</span>
            <div className="relative">
              <button onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Abrir menu do perfil" className="grid size-10 place-items-center rounded-full bg-wine font-bold text-white ring-blush transition focus:ring-4">{(user?.email?.[0] || "G").toUpperCase()}</button>
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
        <InstallAppNotice />
        <main className="mx-auto w-full max-w-[1120px] px-4 py-8 pb-10 sm:px-5 md:px-6 md:py-10 md:pb-20"><Outlet /></main>
      </div>
    </div>
  );
}
