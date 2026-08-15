const faces = [
  { symbol: "☠", name: "Teschio rosso", score: -2, className: "red-skull" },
  { symbol: "✕", name: "X rossa", score: -1, className: "red-x" },
  { symbol: "✕", name: "X rossa", score: -1, className: "red-x" },
  { symbol: "♣", name: "Quadrifoglio verde", score: 1, className: "green-clover" },
  { symbol: "♣", name: "Quadrifoglio verde", score: 1, className: "green-clover" },
  { symbol: "♛", name: "Corona verde scintillante", score: 2, className: "green-crown" }
];

let diceCount = 1;
let rolling = false;
let history = [];

const countEl = document.getElementById("dice-count");
const minusBtn = document.getElementById("minus");
const plusBtn = document.getElementById("plus");
const rollBtn = document.getElementById("roll-button");
const diceContainer = document.getElementById("dice-container");
const resultPanel = document.getElementById("result-panel");
const resultScore = document.getElementById("result-score");
const resultBreakdown = document.getElementById("result-breakdown");
const historyButton = document.getElementById("history-button");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");

function updateCount() {
  countEl.textContent = diceCount;
}

minusBtn.addEventListener("click", () => {
  if (!rolling && diceCount > 1) {
    diceCount--;
    updateCount();
renderHistory();
  }
});

plusBtn.addEventListener("click", () => {
  if (!rolling && diceCount < 30) {
    diceCount++;
    updateCount();
renderHistory();
  }
});

function randomFace() {
  return faces[Math.floor(Math.random() * faces.length)];
}

function createDie(face, index) {
  const die = document.createElement("div");
  die.className = `die ${face.className}`;
  die.textContent = face.symbol;
  die.setAttribute("aria-label", face.name);
  die.style.setProperty("--rot", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
  die.style.animationDelay = `${index * 55}ms`;
  return die;
}


function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">Nessun tiro registrato.</div>';
    return;
  }

  historyList.innerHTML = history.map((entry, index) => {
    const totalClass = entry.total < 0 ? "negative" : "";
    const totalText = entry.total > 0 ? `+${entry.total}` : entry.total;
    return `
      <div class="history-entry">
        <div class="history-number">#${history.length - index}</div>
        <div class="history-symbols" title="${entry.details}">
          ${entry.symbols.join(" ")}
        </div>
        <div class="history-total ${totalClass}">${totalText}</div>
      </div>
    `;
  }).join("");
}

historyButton.addEventListener("click", () => {
  const isHidden = historyPanel.hidden;
  historyPanel.hidden = !isHidden;
  historyButton.setAttribute("aria-expanded", String(isHidden));
});

clearHistoryButton.addEventListener("click", () => {
  history = [];
  renderHistory();
});


function formatBreakdown(results, total) {
  const pieces = results.map(r => {
    const sign = r.score > 0 ? "+" : "";
    return `${r.symbol} ${sign}${r.score}`;
  });
  const totalSign = total > 0 ? "+" : "";
  return `${pieces.join("   ·   ")}   =   ${totalSign}${total}`;
}

async function rollDice() {
  if (rolling) return;
  rolling = true;
  rollBtn.disabled = true;
  resultPanel.classList.remove("show");
  resultScore.textContent = "…";
  resultBreakdown.textContent = "Il destino decide…";

  diceContainer.innerHTML = "";

  const results = [];
  for (let i = 0; i < diceCount; i++) {
    const face = randomFace();
    results.push(face);
    const die = createDie(face, i);
    die.classList.add("rolling");
    diceContainer.appendChild(die);
  }

  // Piccola animazione complessiva, senza rallentare inutilmente il gioco.
  await new Promise(resolve => setTimeout(resolve, 680));

  const total = results.reduce((sum, face) => sum + face.score, 0);

  history.unshift({
    total,
    symbols: results.map(face => face.symbol),
    details: results.map(face => `${face.name}: ${face.score > 0 ? "+" : ""}${face.score}`).join(" · ")
  });
  history = history.slice(0, 10);
  renderHistory();

  resultScore.textContent = total > 0 ? `+${total}` : total;
  resultBreakdown.textContent = formatBreakdown(results, total);
  resultPanel.classList.add("show");

  rolling = false;
  rollBtn.disabled = false;
}

rollBtn.addEventListener("click", rollDice);

updateCount();
renderHistory();
