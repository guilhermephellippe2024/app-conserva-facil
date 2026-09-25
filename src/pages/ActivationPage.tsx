import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

const schema = z.object({
  email: z.string().trim().email("Informe o mesmo e-mail usado na compra."),
  phoneSuffix: z.string().regex(/^\d{4}$/, "Informe os 4 últimos números do telefone."),
  password: z.string().min(8, "Crie uma senha com pelo menos 8 caracteres."),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  message: "As senhas não são iguais.",
  path: ["confirmPassword"],
});

type ActivationResponse = {
  access_token?: string;
  refresh_token?: string;
  session?: { access_token?: string; refresh_token?: string };
  error?: string;
};

const supportUrl = "https://wa.me/5535991530372?text=N%C3%A3o%20estou%20conseguindo%20acessar%20minha%20conta";

export default function ActivationPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setShowSupport(false);

    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      email: form.get("email"),
      phoneSuffix: String(form.get("phoneSuffix") || "").replace(/\D/g, ""),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Revise os dados informados.");
      return;
    }
    if (!supabaseConfigured) {
      setMessage("Conecte o projeto ao Supabase antes de ativar o acesso.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.functions.invoke<ActivationResponse>("activate-access", {
      body: {
        email: parsed.data.email.toLowerCase(),
        phone_suffix: parsed.data.phoneSuffix,
        password: parsed.data.password,
      },
    });

    if (error || data?.error) {
      setMessage(data?.error || "Não conseguimos validar essa compra. Confira os dados e tente novamente.");
      setShowSupport(true);
      setBusy(false);
      return;
    }

    const accessToken = data?.session?.access_token || data?.access_token;
    const refreshToken = data?.session?.refresh_token || data?.refresh_token;
    if (!accessToken || !refreshToken) {
      setMessage("A compra foi localizada, mas não foi possível iniciar sua sessão.");
      setBusy(false);
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) {
      setMessage("Não foi possível abrir seu acesso. Tente novamente.");
      setBusy(false);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <div aria-hidden="true" className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-blush blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_24px_80px_rgba(64,28,39,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-wine px-7 py-9 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[38px] border-white/5" />
          <div className="relative">
            <img src="/assets/logo-conserva-facil.png" alt="Conserva Fácil" className="w-52 brightness-0 invert" />
            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Compra concluída</p>
            <h1 className="mt-3 max-w-sm font-display text-4xl font-bold leading-tight sm:text-5xl">Falta pouco para começar.</h1>
            <p className="mt-4 max-w-md leading-7 text-white/75">Confirme os dados usados no checkout e crie sua senha. Seu painel será aberto logo em seguida.</p>
          </div>
          <div className="relative mt-10 grid gap-4 text-sm lg:mt-16">
            {["Localizamos sua compra", "Você protege seu acesso", "O Conserva Fácil é liberado"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-gold">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:p-12">
          <div className="mx-auto max-w-lg">
            <span className="inline-flex rounded-full bg-blush px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-wine">Primeiro acesso</span>
            <h2 className="mt-4 font-display text-3xl font-bold">Ative sua conta</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Use exatamente os dados informados durante o pagamento.</p>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4" noValidate>
              <label className="grid gap-1.5 text-sm font-bold">
                E-mail da compra
                <input className="field" type="email" name="email" autoComplete="email" defaultValue={searchParams.get("email") || ""} placeholder="voce@exemplo.com" required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold">
                4 últimos números do telefone
                <input className="field" type="text" name="phoneSuffix" inputMode="numeric" autoComplete="tel" maxLength={4} pattern="[0-9]{4}" placeholder="Ex.: 4821" required />
                <span className="text-xs font-normal text-muted">O mesmo telefone informado no checkout.</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-bold">
                  Crie uma senha
                  <input className="field" type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" minLength={8} required />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Repita a senha
                  <input className="field" type={showPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" minLength={8} required />
                </label>
              </div>
              <label className="flex w-fit items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} className="h-4 w-4 accent-wine" />
                Mostrar senha
              </label>

              {message && (
                <div role="alert" className="grid gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-wine">
                  <p>{message}</p>
                  {showSupport && (
                    <a href={supportUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center rounded-xl bg-emerald px-4 py-2.5 text-center font-bold text-white transition hover:bg-[#087553]">
                      Entrar em contato com suporte
                    </a>
                  )}
                </div>
              )}
              <button type="submit" disabled={busy} className="mt-1 min-h-13 rounded-xl bg-wine px-5 py-3.5 font-bold text-white shadow-lg shadow-wine/15 transition hover:bg-[#5f0d23] disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "Validando sua compra…" : "Ativar e acessar meu painel"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">Já ativou sua conta? <Link to="/login" className="font-bold text-wine hover:underline">Entrar com e-mail e senha</Link></p>
            <div className="mt-7 flex items-start gap-3 rounded-2xl bg-canvas p-4 text-xs leading-5 text-muted">
              <span aria-hidden="true" className="text-base">🔒</span>
              <p>Seus dados são usados somente para confirmar a compra e proteger seu acesso.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
