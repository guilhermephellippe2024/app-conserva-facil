const recipes = [
  {
    id: "morango",
    name: "Morango clássico",
    summary: "Doce, brilhante e com pedacinhos de fruta.",
    time: "35–45 min",
    yield: "cerca de 6 potes",
    accent: "#d7334d",
    ingredients: [
      ["Morangos limpos", "1 kg"],
      ["Açúcar", "1 kg"],
      ["Pectina para geleia", "1 sachê"],
      ["Limão", "½ unidade"]
    ],
    steps: [
      "Lave os morangos, retire os cabinhos e corte as frutas maiores.",
      "Coloque os morangos na panela e amasse levemente, deixando alguns pedaços.",
      "Misture a pectina com duas colheres do açúcar e junte aos morangos.",
      "Acrescente o restante do açúcar aos poucos e cozinhe em fogo médio, mexendo.",
      "Junte o limão e cozinhe até a geleia cair lentamente da colher, formando uma camada grossa.",
      "Coloque ainda quente nos potes preparados e feche bem."
    ],
    tip: "A geleia fica mais firme depois que esfria. Não espere que ela endureça dentro da panela."
  },
  {
    id: "goiaba",
    name: "Goiaba tradicional",
    summary: "Sabor conhecido, cor bonita e textura cremosa.",
    time: "45–55 min",
    yield: "cerca de 5 potes",
    accent: "#ef725f",
    ingredients: [
      ["Polpa de goiaba sem sementes", "1 kg"],
      ["Açúcar", "650 g"],
      ["Pectina para geleia", "1 sachê pequeno"],
      ["Limão", "½ unidade"]
    ],
    steps: [
      "Lave, corte e bata as goiabas. Passe por uma peneira para retirar as sementes.",
      "Pese 1 kg da polpa pronta e coloque na panela.",
      "Misture a pectina com duas colheres do açúcar e junte à polpa.",
      "Acrescente o restante do açúcar e cozinhe em fogo médio, mexendo para não grudar.",
      "Junte o limão quando a geleia começar a engrossar.",
      "Quando estiver cremosa e cair lentamente da colher, envase ainda quente."
    ],
    tip: "Pese a polpa depois de retirar as sementes. Assim o resultado fica igual em todos os lotes."
  },
  {
    id: "abacaxi",
    name: "Abacaxi com pimenta suave",
    summary: "Frutada, dourada e com uma picância bem leve.",
    time: "50–60 min",
    yield: "cerca de 7 potes",
    accent: "#e5af22",
    ingredients: [
      ["Abacaxi limpo e picado", "1 kg"],
      ["Açúcar", "500 g"],
      ["Pectina para geleia", "1 sachê pequeno"],
      ["Pimenta dedo-de-moça sem sementes", "1 pequena"],
      ["Água", "1 litro"]
    ],
    steps: [
      "Bata o abacaxi com a água até obter uma mistura uniforme.",
      "Leve ao fogo e, quando começar a ferver, acrescente quase todo o açúcar.",
      "Misture a pectina com o açúcar reservado e adicione aos poucos.",
      "Retire as sementes da pimenta, pique bem pequeno e coloque na panela.",
      "Cozinhe até a geleia ficar brilhante e cair lentamente da colher.",
      "Prove uma pequena quantidade já fria e envase a geleia ainda quente."
    ],
    tip: "Para uma geleia suave, retire também a parte branca de dentro da pimenta e use luvas ao cortar."
  }
];

const state = {
  activeRecipe: null,
  completed: new Set(JSON.parse(localStorage.getItem("conserva-completed") || "[]"))
};

const recipeGrid = document.querySelector("#recipe-grid");
const dialog = document.querySelector("#recipe-dialog");

function renderRecipes() {
  recipeGrid.innerHTML = recipes.map(recipe => {
    const done = state.completed.has(recipe.id);
    return `
      <article class="recipe-card" style="--accent:${recipe.accent}">
        <div>
          <span class="eyebrow">${done ? "Receita concluída" : "Receita guiada"}</span>
          <h3>${recipe.name}</h3>
          <p>${recipe.summary}</p>
          <div class="card-meta"><span>${recipe.time}</span><span>${recipe.yield}</span></div>
        </div>
        <button class="card-action" type="button" data-recipe="${recipe.id}">
          <span>${done ? "Fazer novamente" : "Ver receita"}</span>
          <span class="${done ? "done-badge" : ""}">${done ? "✓" : "→"}</span>
        </button>
      </article>`;
  }).join("");

  document.querySelector(".progress-label").textContent = `${state.completed.size} de 3 feitas`;
  renderLine();
}

function openRecipe(id) {
  const recipe = recipes.find(item => item.id === id);
  state.activeRecipe = recipe;
  document.querySelector("#dialog-title").textContent = recipe.name;
  document.querySelector("#dialog-summary").textContent = recipe.summary;
  document.querySelector("#ingredient-list").innerHTML = recipe.ingredients
    .map(([name, amount]) => `<li><span>${name}</span><b>${amount}</b></li>`).join("");
  document.querySelector("#steps-list").innerHTML = recipe.steps.map(step => `<li>${step}</li>`).join("");
  document.querySelector("#recipe-tip").innerHTML = `<strong>Uma dica:</strong> ${recipe.tip}`;
  document.querySelector("#finish-recipe").textContent = state.completed.has(id) ? "Receita já concluída" : "Marcar como feita";
  dialog.showModal();
}

function renderLine() {
  const selected = recipes.filter(recipe => state.completed.has(recipe.id));
  document.querySelector("#line-preview").innerHTML = selected.map(recipe => `
    <article class="line-item">
      <span>Geleia artesanal</span>
      <h3>${recipe.name}</h3>
    </article>`).join("");
  document.querySelector("#line-hint").hidden = selected.length > 0;
}

function parseMoney(value) {
  return Number(String(value).replace(/\./g, "").replace(",", ".")) || 0;
}

function updateCost() {
  const data = new FormData(document.querySelector("#cost-form"));
  const total = ["fruit", "sugar", "jars", "extras"].reduce((sum, key) => sum + parseMoney(data.get(key)), 0);
  const amount = Math.max(1, Number(data.get("yield")) || 1);
  const unit = total / amount;
  const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  document.querySelector("#unit-cost").textContent = formatter.format(unit);
  document.querySelector("#price-range").textContent = `${formatter.format(unit * 2)} e ${formatter.format(unit * 2.5)}`;
}

recipeGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-recipe]");
  if (button) openRecipe(button.dataset.recipe);
});

document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#finish-recipe").addEventListener("click", () => {
  if (!state.activeRecipe) return;
  state.completed.add(state.activeRecipe.id);
  localStorage.setItem("conserva-completed", JSON.stringify([...state.completed]));
  dialog.close();
  renderRecipes();
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .view").forEach(element => element.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelector(`#${tab.dataset.view}-view`).classList.add("is-active");
  });
});

document.querySelector("#cost-form").addEventListener("input", updateCost);
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

renderRecipes();
updateCost();
