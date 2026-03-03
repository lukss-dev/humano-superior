const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const container = document.getElementById('cronograma-forca');

// 1. Gerar o Cronograma
dias.forEach(dia => {
    const div = document.createElement('div');
    div.className = 'dia-row';
    div.innerHTML = `
        <div class="selo">${dia.toUpperCase()}</div>
        <select class="treino-select">
            <option value="descanso">💤 Descanso</option>
            <option value="superior">🔱 Membros Superiores </option>
            <option value="inferior">🏛️ Membros Inferiores </option>
        </select>
    `;
    container.appendChild(div);
});

// 2. Lógica do Modo Titã (Modo Sério)
const btnModoSerio = document.getElementById('btn-modo-serio');
const body = document.getElementById('body-corpo');
const titulo = document.getElementById('titulo-pagina');

btnModoSerio.addEventListener('click', () => {
    body.classList.toggle('modo-tita');
    
    if (body.classList.contains('modo-tita')) {
        btnModoSerio.innerText = "Modo Fúria Ativo 🔥";
        titulo.innerText = "🔥 Fúria";
        localStorage.setItem('modoForca', 'serio');
    } else {
        btnModoSerio.innerText = "Ativar Modo Fúria 🔥";
        titulo.innerText = "🏛️ Ginásio de Hércules";
        localStorage.setItem('modoForca', 'normal');
    }
});

// 3. Salvar Escolhas
const btnSalvar = document.getElementById('btn-salvar-forca');
const selects = document.querySelectorAll('.treino-select');

btnSalvar.addEventListener('click', () => {
    const escolhas = Array.from(selects).map(s => s.value);
    localStorage.setItem('treinoForca', JSON.stringify(escolhas));
    alert("O Oráculo guardou seu plano de força!");
});

// 4. Carregar estado anterior
window.onload = () => {
    const salvo = JSON.parse(localStorage.getItem('treinoForca'));
    if (salvo) selects.forEach((s, i) => s.value = salvo[i]);

    if (localStorage.getItem('modoForca') === 'serio') {
        body.classList.add('modo-tita');
        btnModoSerio.innerText = "Modo Titã Ativo 🔥";
    }
};