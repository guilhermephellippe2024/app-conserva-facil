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
  },
];
