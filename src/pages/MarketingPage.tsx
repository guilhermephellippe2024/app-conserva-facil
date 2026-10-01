import { useState } from "react";

type Tutorial = {
  title: string;
  probability: number;
  image: string;
  description: string;
  steps: string[];
  action: string;
};

const tutorials: Tutorial[] = [
  { title: "Venda para pessoas que já conhecem você", probability: 80, image: "/assets/divulgar-contatos.png", description: "Comece com familiares, amigos, vizinhos e colegas. A confiança já existe e você consegue testar preço, embalagem e sabores.", steps: ["Escolha dois sabores para oferecer.", "Tire uma foto clara dos potes perto de uma janela.", "Envie uma mensagem individual para 10 pessoas.", "Defina um dia para produção e outro para entrega.", "Depois da entrega, peça uma opinião."], action: "Mensagem sugerida: “Oi! Estou preparando uma pequena produção de geleias caseiras para [dia]. Tenho os sabores [sabores] por R$ [preço]. Quer que eu reserve um pote para você?”" },
  { title: "Divulgue pelo Status do WhatsApp", probability: 70, image: "/assets/divulgar-status-whatsapp.png", description: "Transforme o Status em uma vitrine simples para pessoas que já possuem seu contato.", steps: ["Publique uma foto bonita mostrando o sabor.", "Informe preço, tamanho do pote e data de entrega.", "Use a chamada: “Responda QUERO para reservar”.", "Mostre quantas unidades ainda estão disponíveis.", "Retire o anúncio quando o lote acabar."], action: "Faça um lote limitado: “Produção desta semana: 12 potes. Entrega na sexta-feira.”" },
  { title: "Conquiste indicações e recompras", probability: 60, image: "/assets/divulgar-indicacao.png", description: "Transforme compradores satisfeitos em novas vendas e reduza a necessidade de procurar desconhecidos todos os dias.", steps: ["Anote o cliente e o sabor comprado.", "Depois de alguns dias, pergunte se a pessoa gostou.", "Peça uma indicação após receber uma resposta positiva.", "Ofereça uma vantagem simples na próxima compra.", "Avise clientes anteriores antes do próximo lote."], action: "Mensagem sugerida: “Fico feliz que tenha gostado! Se você pedir dois potes ou indicar alguém que compre, preparo uma condição especial para você.”" },
  { title: "Faça parcerias no seu bairro", probability: 45, image: "/assets/divulgar-parcerias.png", description: "Apresente suas geleias em cafeterias, padarias, empórios, pousadas e lojas de presentes da região.", steps: ["Escolha cinco estabelecimentos compatíveis com produtos artesanais.", "Leve uma amostra, preços e seu contato.", "Explique quantidade mínima e dias de entrega.", "Use consignação somente se controlar entradas e devoluções.", "Retorne depois de uma semana para negociar reposição."], action: "Apresentação sugerida: “Produzo geleias caseiras em pequenos lotes. Posso deixar uma amostra e uma proposta simples para vocês avaliarem?”" },
  { title: "Crie uma campanha local nas redes sociais", probability: 35, image: "/assets/divulgar-redes-sociais.png", description: "Use conteúdo e anúncios locais quando já conhecer seus sabores mais vendidos, sua margem e sua capacidade de produção.", steps: ["Crie um perfil com nome, cidade, WhatsApp e fotos reais.", "Publique bastidores, formas de consumo e depoimentos.", "Concentre os pedidos em um link para o WhatsApp.", "Teste uma campanha pequena na sua região de entrega.", "Registre quantas conversas e vendas o anúncio gerou."], action: "Mostre a geleia sendo servida e apresente uma oferta concreta: sabor, preço, região de entrega e prazo para pedir." },
];

export default function MarketingPage() {
  const [selected, setSelected] = useState<Tutorial | null>(null);

  return (
    <>
      <header className="mb-7 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-wine">Da primeira venda à divulgação local</span>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl md:text-5xl">Como divulgar suas geleias</h1>
        <p className="mt-3 leading-7 text-muted">Escolha um método, veja o passo a passo e comece pelo que parece mais simples para você.</p>
      </header>

      <div className="grid gap-4">
        {tutorials.map((tutorial) => (
          <article key={tutorial.title} className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:shadow-xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
            <button onClick={() => setSelected(tutorial)} className="relative block h-48 w-full overflow-hidden md:h-full md:min-h-56">
              <img src={tutorial.image} alt="" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
            </button>
            <div className="relative flex min-w-0 flex-col p-5 sm:p-6">
              <span className="self-start rounded-xl bg-blush px-3 py-2 text-sm font-bold text-wine md:absolute md:right-5 md:top-5">🔥 {tutorial.probability}% de probabilidade de venda</span>
              <h2 className="mt-3 max-w-2xl pr-0 font-display text-2xl font-bold leading-tight md:mt-0 md:pr-60">{tutorial.title}</h2>
              <button onClick={() => setSelected(tutorial)} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-wine px-4 py-3 font-bold text-white md:mt-8">Ver método <span className="grid size-7 place-items-center rounded-full bg-white/15">→</span></button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#261013]/65 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="marketing-method-title" className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white shadow-2xl">
            <header className="relative overflow-hidden bg-wine text-white">
              <img src={selected.image} alt="" className="h-48 w-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-wine via-wine/55 to-transparent" />
              <button onClick={() => setSelected(null)} aria-label="Fechar método" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/90 text-2xl text-wine">×</button>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">{selected.probability}% de probabilidade de venda</span>
                <h2 id="marketing-method-title" className="mt-1 pr-10 font-display text-3xl font-bold">{selected.title}</h2>
              </div>
            </header>
            <div className="p-6 sm:p-7">
              <p className="leading-7 text-muted">{selected.description}</p>
              <h3 className="mt-6 font-display text-xl font-bold">Passo a passo</h3>
              <ol className="mt-4 grid gap-4">
                {selected.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3"><span className="grid size-[34px] place-items-center rounded-full bg-wine font-bold text-white">{index + 1}</span><span className="pt-1">{step}</span></li>
                ))}
              </ol>
              <aside className="mt-7 rounded-xl border-l-4 border-gold bg-[#fff5d4] p-4"><strong>Coloque em prática:</strong> {selected.action}</aside>
              <button onClick={() => setSelected(null)} className="mt-6 w-full rounded-xl bg-wine px-5 py-3.5 font-bold text-white">Entendi, vou colocar em prática</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
