import { useEffect, useState } from "react";
interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }>; }
function isStandalone() { return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone); }
export default function InstallAppNotice() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => typeof window !== "undefined" && isStandalone());
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  useEffect(() => {
    const handlePrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const handleInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const handleModeChange = () => setInstalled(isStandalone());
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", handleModeChange);
    return () => { window.removeEventListener("beforeinstallprompt", handlePrompt); window.removeEventListener("appinstalled", handleInstalled); displayMode.removeEventListener("change", handleModeChange); };
  }, []);
  async function installAndroid() {
    if (!installPrompt) { setTutorialOpen(true); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "dismissed") setInstallPrompt(null);
  }
  if (installed) return null;
  return (<>
    <section className="mx-4 mt-4 overflow-hidden rounded-2xl border border-[#efd17a] bg-[#fff7da] shadow-sm sm:mx-5 md:mx-12" aria-label="Instalar aplicativo">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 gap-3"><img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" /><div><strong className="block font-display text-lg">Tenha o Conserva Fácil no seu celular</strong><p className="mt-1 text-sm leading-5 text-muted">{isIOS ? "Adicione o ícone à Tela de Início para abrir como um aplicativo." : "Instale o aplicativo para acessar receitas, custos e vendas direto da sua tela inicial."}</p></div></div>
        <div className="flex shrink-0 flex-col gap-2 min-[430px]:flex-row">
          {!isIOS && <button type="button" onClick={installAndroid} className="whitespace-nowrap rounded-xl bg-wine px-4 py-3 text-sm font-bold text-white shadow-sm">{installPrompt ? "Baixar no Android" : isAndroid ? "Como instalar" : "Instalar aplicativo"}</button>}
          <button type="button" onClick={() => setTutorialOpen(true)} className="whitespace-nowrap rounded-xl border border-wine/25 bg-white px-4 py-3 text-sm font-bold text-wine">{isIOS ? "Ver como adicionar" : "Tutorial para iPhone"}</button>
        </div>
      </div>
    </section>
    {tutorialOpen && <div className="fixed inset-0 z-[80] grid place-items-center bg-[#261013]/65 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setTutorialOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="install-title" className="max-h-[92vh] w-full max-w-md overflow-auto rounded-3xl bg-white shadow-2xl">
        <header className="relative bg-wine p-6 text-white"><span className="text-xs font-bold uppercase tracking-widest text-gold">Instalação no iPhone</span><h2 id="install-title" className="mt-1 pr-12 font-display text-2xl font-bold">Adicione à Tela de Início</h2><button type="button" onClick={() => setTutorialOpen(false)} aria-label="Fechar tutorial" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white text-2xl text-wine">×</button></header>
        <div className="p-6"><p className="text-sm leading-6 text-muted">Abra esta página pelo Safari e siga os passos:</p>
          <ol className="mt-5 grid gap-5">
            <li className="grid grid-cols-[44px_minmax(0,1fr)] gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blush text-xl font-bold text-wine">1</span><div><strong>Toque em Compartilhar</strong><p className="mt-1 text-sm text-muted">É o quadrado com uma seta para cima, na barra do Safari.</p></div></li>
            <li className="grid grid-cols-[44px_minmax(0,1fr)] gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blush text-xl font-bold text-wine">2</span><div><strong>Escolha “Adicionar à Tela de Início”</strong><p className="mt-1 text-sm text-muted">Se não aparecer de imediato, role a lista de opções.</p></div></li>
            <li className="grid grid-cols-[44px_minmax(0,1fr)] gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blush text-xl font-bold text-wine">3</span><div><strong>Toque em “Adicionar”</strong><p className="mt-1 text-sm text-muted">O ícone aparecerá junto dos seus aplicativos.</p></div></li>
          </ol>
          <aside className="mt-6 rounded-xl bg-[#fff7da] p-4 text-sm leading-6"><strong>Importante:</strong> no iPhone, faça a instalação pelo Safari.</aside>
          <button type="button" onClick={() => setTutorialOpen(false)} className="mt-6 w-full rounded-xl bg-wine px-5 py-3.5 font-bold text-white">Entendi</button>
        </div>
      </section>
    </div>}
  </>);
}
