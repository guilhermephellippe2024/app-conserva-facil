export type Recipe = {
  id: "morango" | "goiaba" | "abacaxi";
  name: string;
  summary: string;
  time: string;
  yield: string;
  image: string;
  ingredients: Array<[string, string]>;
  steps: string[];
  tip: string;
  faq: Array<{ question: string; answer: string }>;
};

export const recipes: Recipe[] = [
  {
    id: "morango",
    name: "Morango clássico",
    summary: "Doce, brilhante e com pedacinhos de fruta.",
    time: "35–45 min",
    yield: "cerca de 6 potes",
    image: "/assets/geleia-morango.png",
    ingredients: [["Morangos limpos", "1 kg"], ["Açúcar", "1 kg"], ["Pectina para geleia", "1 sachê"], ["Limão", "½ unidade"]],
    steps: ["Lave os morangos, retire os cabinhos e corte as frutas maiores.", "Coloque os morangos na panela e amasse levemente.", "Misture a pectina com duas colheres do açúcar e junte aos morangos.", "Acrescente o restante do açúcar aos poucos e cozinhe em fogo médio.", "Junte o limão e cozinhe até cair lentamente da colher.", "Coloque ainda quente nos potes preparados e feche bem."],
    tip: "A geleia fica mais firme depois que esfria. Não espere endurecer dentro da panela.",
    faq: [
      { question: "Por que a geleia de morango ficou mole?", answer: "O morango tem pouca pectina natural. Respeite as quantidades, use a pectina indicada e lembre que a geleia só ganha a textura final depois de esfriar completamente." },
      { question: "Preciso retirar a espuma que aparece?", answer: "Sim. Retire a espuma no final com uma colher para deixar a geleia mais limpa, brilhante e com menos bolhas no pote." },
      { question: "Como manter pedaços de morango?", answer: "Amasse apenas parte das frutas e evite mexer com força depois que a mistura engrossar. Os pedaços devem estar pequenos para cozinhar por igual." },
      { question: "Por que a geleia ficou escura?", answer: "Normalmente isso acontece por cozimento longo ou fogo baixo por tempo demais. Faça lotes pequenos e retire do fogo assim que atingir o ponto." },
    ],
  },
  {
    id: "goiaba",
    name: "Goiaba tradicional",
    summary: "Sabor conhecido, cor bonita e textura cremosa.",
    time: "45–55 min",
    yield: "cerca de 5 potes",
    image: "/assets/geleia-goiaba.png",
    ingredients: [["Polpa de goiaba sem sementes", "1 kg"], ["Açúcar", "650 g"], ["Pectina para geleia", "1 sachê pequeno"], ["Limão", "½ unidade"]],
    steps: ["Lave, corte e bata as goiabas. Passe por uma peneira.", "Pese 1 kg da polpa pronta e coloque na panela.", "Misture a pectina com duas colheres do açúcar e junte à polpa.", "Acrescente o restante do açúcar e cozinhe em fogo médio.", "Junte o limão quando começar a engrossar.", "Quando estiver cremosa, envase ainda quente."],
    tip: "Pese a polpa depois de retirar as sementes para repetir o resultado.",
    faq: [
      { question: "Como retirar as sementes sem perder muita polpa?", answer: "Bata a goiaba apenas até desmanchar e passe por uma peneira em pequenas porções. Pressione com uma colher, sem triturar as sementes." },
      { question: "Por que a geleia de goiaba ficou dura?", answer: "Ela provavelmente cozinhou além do ponto. Retire do fogo quando ainda estiver cremosa, pois ficará mais firme ao esfriar." },
      { question: "O limão é realmente necessário?", answer: "Ele ajuda a equilibrar o sabor e favorece a formação do gel. Use a quantidade indicada para não deixar a geleia ácida demais." },
      { question: "Posso usar goiabas muito maduras?", answer: "Prefira frutas maduras e firmes. Goiabas excessivamente maduras têm menos pectina e podem produzir uma geleia mais mole e com cor menos viva." },
    ],
  },
  {
    id: "abacaxi",
    name: "Abacaxi com pimenta suave",
    summary: "Frutada, dourada e com uma picância bem leve.",
    time: "50–60 min",
    yield: "cerca de 7 potes",
    image: "/assets/geleia-abacaxi-pimenta.png",
    ingredients: [["Abacaxi limpo e picado", "1 kg"], ["Açúcar", "500 g"], ["Pectina para geleia", "1 sachê pequeno"], ["Pimenta dedo-de-moça sem sementes", "1 pequena"], ["Água", "1 litro"]],
    steps: ["Bata o abacaxi com a água.", "Leve ao fogo e acrescente quase todo o açúcar ao ferver.", "Misture a pectina com o açúcar reservado e adicione.", "Pique a pimenta sem sementes e coloque na panela.", "Cozinhe até ficar brilhante e cair lentamente da colher.", "Prove uma pequena quantidade fria e envase ainda quente."],
    tip: "Para ficar suave, retire também a parte branca da pimenta e use luvas ao cortar.",
    faq: [
      { question: "Por que essa receita precisa de pectina?", answer: "O abacaxi é naturalmente pobre em pectina. A pectina ajuda a formar uma textura de geleia sem exigir um cozimento longo." },
      { question: "Como deixar a pimenta realmente suave?", answer: "Retire sementes e toda a parte branca interna. Comece com uma pimenta pequena e prove uma pequena porção fria antes de envasar." },
      { question: "Por que apareceu líquido separado no pote?", answer: "Isso pode acontecer quando a pectina não se dissolve bem ou quando a geleia cozinha além do necessário. Misture a pectina como indicado e retire do fogo ao atingir o ponto." },
      { question: "Posso aumentar a quantidade de pimenta?", answer: "Para consumo refrigerado, ajuste aos poucos conforme seu gosto. Se pretende armazenar fora da geladeira, não altere uma formulação testada sem orientação técnica." },
    ],
  },
];
