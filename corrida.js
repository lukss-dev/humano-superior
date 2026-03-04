const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const container = document.getElementById('cronograma');

// Gerar os campos automaticamente
dias.forEach(dia => {
    const div = document.createElement('div');
    div.className = 'dia-row';
    div.innerHTML = `
        <div class="selo">${dia.toUpperCase()}</div>
        <select class="treino-select">
            <option value="descanso">💤 Sono de Hipnos (Descanso)</option>
            <option value="longao">⚡ Jornada de Odisseu (Longão)</option>
            <option value="tiro">🔥 Fúria de Ares (Tiro)</option>
            <option value="regenerativo">🌿 Bênção de Deméter (Regenerativo)</option>
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
