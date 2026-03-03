const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const container = document.getElementById('cronograma');

// Gerar os campos automaticamente
dias.forEach(dia => {
    const div = document.createElement('div');
    div.className = 'dia-row';
    div.innerHTML = `
        <div class="selo">${dia.toUpperCase()}</div>
        <select class="treino-select">
            <option value="descanso">💤Descanso💤</option>
            <option value="longao"> 🔥Longão🔥</option>
            <option value="tiro"> ⚡Tiro⚡</option>
            <option value="regenerativo">🌿Regenerativo🌿</option>
        </select>
    `;
    container.appendChild(div);
});

// Lógica de Salvar
const btnSalvar = document.getElementById('btn-salvar');
const selects = document.querySelectorAll('.treino-select');

btnSalvar.addEventListener('click', () => {
    const escolhas = Array.from(selects).map(s => s.value);
    localStorage.setItem('meuTreinoRPG', JSON.stringify(escolhas));
    
    btnSalvar.innerText = "✅ Destino Gravado!";
    setTimeout(() => btnSalvar.innerText = "Gravar no Oráculo", 2000);
});

// Carregar ao abrir
window.onload = () => {
    const salvo = JSON.parse(localStorage.getItem('meuTreinoRPG'));
    if (salvo) {
        selects.forEach((s, i) => s.value = salvo[i]);
    }
};
const raceForm = document.getElementById('race-form');
const raceTable = document.querySelector('#race-table tbody');

// Carrega as corridas já salvas ou cria uma lista vazia
let races = JSON.parse(localStorage.getItem('myRaces')) || [];
let records = { 5: Infinity, 10: Infinity, 21: Infinity, 42: Infinity };

// Ao carregar a página, exibe o que já está salvo
window.addEventListener('DOMContentLoaded', () => {
    races.forEach(race => {
        renderRaceRow(race);
        updateRecords(race.km, race.totalPaceSeconds, race.paceStr);
    });
});

raceForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('race-name').value;
    const date = document.getElementById('race-date').value;
    const km = parseFloat(document.getElementById('race-km').value);
    const paceStr = document.getElementById('race-pace').value;
    const notes = document.getElementById('race-notes').value;

    const [min, sec] = paceStr.split(':').map(Number);
    const totalPaceSeconds = (min * 60) + sec;
    const totalTimeSeconds = totalPaceSeconds * km;
    const formattedTotalTime = formatTime(totalTimeSeconds);

    const newRace = { date, name, km, paceStr, formattedTotalTime, notes, totalPaceSeconds };

    // Salva no array e no LocalStorage
    races.push(newRace);
    localStorage.setItem('myRaces', JSON.stringify(races));

    // Atualiza a tela
    renderRaceRow(newRace);
    updateRecords(km, totalPaceSeconds, paceStr);
    
    raceForm.reset();
});

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

function updateRecords(km, paceSeconds, paceStr) {
    const targets = [5, 10, 21, 42];
    targets.forEach(target => {
        if (km >= target && km < target + 1) {
            if (paceSeconds < records[target]) {
                records[target] = paceSeconds;
                document.getElementById(`best-${target}k`).innerText = paceStr + " /km";
            }
        }
    });
}

function renderRaceRow(race) {
    const row = raceTable.insertRow(0);
    row.innerHTML = `
        <td>${race.date.split('-').reverse().join('/')}</td>
        <td>${race.name}</td>
        <td>${race.km} km</td>
        <td>${race.paceStr}</td>
        <td><strong>${race.formattedTotalTime}</strong></td>
        <td><small>${race.notes}</small></td>
    `;
}