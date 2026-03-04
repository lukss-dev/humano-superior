// ==========================
// CRONOGRAMA SEMANAL
// ==========================

const dias = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
const container = document.getElementById("cronograma");

if (container) {
  dias.forEach((dia) => {
    const div = document.createElement("div");
    div.className = "dia-row";
    div.innerHTML = `
            <div class="selo">${dia.toUpperCase()}</div>
            <select class="treino-select">
                <option value="descanso">💤 Descanso</option>
                <option value="longao">🔥 Longão</option>
                <option value="tiro">⚡ Tiro</option>
                <option value="regenerativo">🌿 Regenerativo</option>
            </select>
        `;
    container.appendChild(div);
  });
}

const btnSalvar = document.getElementById("btn-salvar");

if (btnSalvar) {
  btnSalvar.addEventListener("click", () => {
    const selects = document.querySelectorAll(".treino-select");
    const escolhas = Array.from(selects).map((s) => s.value);
    localStorage.setItem("meuTreinoRPG", JSON.stringify(escolhas));

    btnSalvar.innerText = "✅ Destino Gravado!";
    setTimeout(() => (btnSalvar.innerText = "Gravar no Oráculo"), 2000);
  });
}

// ==========================
// HISTÓRICO DE CORRIDAS
// ==========================

const raceForm = document.getElementById("race-form");
const raceTable = document.querySelector("#race-table tbody");

let races = JSON.parse(localStorage.getItem("myRaces")) || [];

window.addEventListener("DOMContentLoaded", () => {
  // Carregar cronograma salvo
  const salvo = JSON.parse(localStorage.getItem("meuTreinoRPG"));
  if (salvo) {
    document.querySelectorAll(".treino-select").forEach((s, i) => {
      if (salvo[i]) s.value = salvo[i];
    });
  }

  // Renderizar corridas
  races.forEach((race) => renderRaceRow(race));

  // Recalcular recordes
  recalcularRecordes();
});

if (raceForm) {
  raceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("race-name").value;
    const date = document.getElementById("race-date").value;
    const km = parseFloat(document.getElementById("race-km").value);
    const paceStr = document.getElementById("race-pace").value;
    const notes = document.getElementById("race-notes").value;

    if (!paceStr.includes(":")) {
      alert("Digite o pace no formato correto: mm:ss (ex: 05:20)");
      return;
    }

    const [min, sec] = paceStr.split(":").map(Number);

    if (isNaN(min) || isNaN(sec)) {
      alert("Pace inválido. Use o formato mm:ss");
      return;
    }

    const paceSeconds = min * 60 + sec;

    const totalTimeSeconds = paceSeconds * km;
    const formattedTotalTime = formatTime(totalTimeSeconds);

    const newRace = {
      date,
      name,
      km,
      paceStr,
      paceSeconds,
      formattedTotalTime,
      notes,
    };

    races.push(newRace);
    localStorage.setItem("myRaces", JSON.stringify(races));

    renderRaceRow(newRace);
    recalcularRecordes();

    raceForm.reset();
  });
}

// ==========================
// FUNÇÕES
// ==========================

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
}

function recalcularRecordes() {
  const records = { 5: null, 10: null, 21: null, 42: null };

  races.forEach((race) => {
    const targets = [5, 10, 21, 42];

    targets.forEach((target) => {
      if (race.km >= target && race.km < target + 1) {
        if (!records[target] || race.paceSeconds < records[target]) {
          records[target] = race.paceSeconds;
        }
      }
    });
  });

  mostrarRecordes(records);
}

function mostrarRecordes(records) {
  Object.keys(records).forEach((target) => {
    const el = document.getElementById(`best-${target}k`);
    if (!el) return;

    if (records[target]) {
      const min = Math.floor(records[target] / 60);
      const sec = Math.round(records[target] % 60)
        .toString()
        .padStart(2, "0");

      el.innerText = `${min}:${sec} /km`;
    } else {
      el.innerText = "-";
    }
  });
}

function renderRaceRow(race) {
  if (!raceTable) return;

  const row = raceTable.insertRow(0);

  row.innerHTML = `
        <td>${race.date.split("-").reverse().join("/")}</td>
        <td>${race.name}</td>
        <td>${race.km} km</td>
        <td>${race.paceStr}</td>
        <td><strong>${race.formattedTotalTime}</strong></td>
        <td><small>${race.notes}</small></td>
    `;
}
