// ========================================
// DADOS
// ========================================

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
let app = {
    musculacao: {
        cronograma: Array(7).fill("descanso"),
        exercicios: []
    },
    calistenia: {
        cronograma: Array(7).fill("descanso"),
        movimentos: []
    },
    historico: [],
    nivel: 1,
    poder: 0
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    inicializarTabs();
    inicializarCronograma();
    inicializarEventos();
    atualizarUI();
});

// ========================================
// TABS
// ========================================

function inicializarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('ativo'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('ativo'));
            
            document.getElementById(tab).classList.add('ativo');
            btn.classList.add('ativo');
        });
    });
}

// ========================================
// CRONOGRAMA
// ========================================

function inicializarCronograma() {
    renderizarCronograma('musc', app.musculacao.cronograma, 'musculacao');
    renderizarCronograma('calis', app.calistenia.cronograma, 'calistenia');
}

function renderizarCronograma(tipo, cronograma, chave) {
    const container = document.getElementById(`cronograma-${tipo}`);
    container.innerHTML = '';

    dias.forEach((dia, idx) => {
        const row = document.createElement('div');
        row.className = 'dia-row';
        row.innerHTML = `
            <div class="dia-label">${dia}</div>
            <select class="dia-select" data-idx="${idx}" data-tipo="${chave}">
                <option value="descanso">😴 Descanso</option>
                ${chave === 'musculacao' ? `
                    <option value="peito">💓 Peito</option>
                    <option value="costas">🏔️ Costas</option>
                    <option value="ombro">🪨 Ombro</option>
                    <option value="perna">🦵 Perna</option>
                    <option value="bracos">💪 Braços</option>
                ` : `
                    <option value="basico">🌱 Básico</option>
                    <option value="push">📤 Push</option>
                    <option value="pull">📥 Pull</option>
                    <option value="legs">🦵 Legs</option>
                `}
            </select>
        `;
        container.appendChild(row);
    });

    // Restaurar seleções
    document.querySelectorAll(`.dia-select[data-tipo="${chave}"]`).forEach(select => {
        const idx = parseInt(select.dataset.idx);
        select.value = cronograma[idx];
        select.addEventListener('change', (e) => {
            cronograma[idx] = e.target.value;
            salvarDados();
        });
    });
}

// ========================================
// EVENTOS
// ========================================

function inicializarEventos() {
    // Data atual
    document.getElementById('data-treino').valueAsDate = new Date();

    // Musculação
    document.getElementById('btn-add-ex').addEventListener('click', adicionarExercicio);
    document.getElementById('nome-ex').addEventListener('keypress', e => {
        if (e.key === 'Enter') adicionarExercicio();
    });

    // Calistenia
    document.getElementById('btn-add-mov').addEventListener('click', adicionarMovimento);
    document.getElementById('nome-mov').addEventListener('keypress', e => {
        if (e.key === 'Enter') adicionarMovimento();
    });

    // Diário
    document.getElementById('btn-salvar-treino').addEventListener('click', salvarTreino);
    document.getElementById('rpe-treino').addEventListener('input', (e) => {
        document.getElementById('valor-rpe').textContent = e.target.value;
    });

    // Salvar/Exportar
    document.getElementById('btn-salvar').addEventListener('click', salvarDados);
    document.getElementById('btn-exportar').addEventListener('click', exportarDados);
}

// ========================================
// MUSCULAÇÃO
// ========================================

function adicionarExercicio() {
    const nome = document.getElementById('nome-ex').value.trim();
    const grupo = document.getElementById('grupo-ex').value;
    const series = parseInt(document.getElementById('series-ex').value) || 0;
    const reps = parseInt(document.getElementById('reps-ex').value) || 0;
    const peso = parseFloat(document.getElementById('peso-ex').value) || 0;

    if (!nome || !grupo) {
        alert('Preencha nome e grupo!');
        return;
    }

    app.musculacao.exercicios.push({
        id: Date.now(),
        nome, grupo, series, reps, peso,
        data: new Date().toLocaleDateString()
    });

    // Ganhar poder
    app.poder += Math.round(peso * reps * 0.1);
    app.nivel = Math.floor(app.poder / 500) + 1;

    // Limpar
    document.getElementById('nome-ex').value = '';
    document.getElementById('grupo-ex').value = '';
    document.getElementById('series-ex').value = '';
    document.getElementById('reps-ex').value = '';
    document.getElementById('peso-ex').value = '';

    renderizarExercicios();
    atualizarUI();
    salvarDados();
}

function renderizarExercicios() {
    const container = document.getElementById('lista-ex');
    container.innerHTML = '';

    app.musculacao.exercicios.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div>
                <div class="item-titulo">${ex.nome}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${ex.series}×${ex.reps}</strong></div>
                    <div class="item-detalhe"><strong>${ex.peso}kg</strong></div>
                </div>
            </div>
            <button class="btn btn-deletar" onclick="deletarExercicio(${ex.id})">🗑️</button>
        `;
        container.appendChild(item);
    });
}

function deletarExercicio(id) {
    app.musculacao.exercicios = app.musculacao.exercicios.filter(e => e.id !== id);
    renderizarExercicios();
    salvarDados();
}

// ========================================
// CALISTENIA
// ========================================

function adicionarMovimento() {
    const nome = document.getElementById('nome-mov').value.trim();
    const nivel = document.getElementById('nivel-mov').value;
    const series = parseInt(document.getElementById('series-mov').value) || 0;
    const reps = parseInt(document.getElementById('reps-mov').value) || 0;

    if (!nome || !nivel) {
        alert('Preencha nome e nível!');
        return;
    }

    app.calistenia.movimentos.push({
        id: Date.now(),
        nome, nivel, series, reps,
        data: new Date().toLocaleDateString()
    });

    // Ganhar poder
    const bonus = { 'basico': 50, 'intermedio': 100, 'avancado': 200 };
    app.poder += bonus[nivel] || 50;
    app.nivel = Math.floor(app.poder / 500) + 1;

    // Limpar
    document.getElementById('nome-mov').value = '';
    document.getElementById('nivel-mov').value = '';
    document.getElementById('series-mov').value = '';
    document.getElementById('reps-mov').value = '';

    renderizarMovimentos();
    atualizarUI();
    salvarDados();
}

function renderizarMovimentos() {
    const container = document.getElementById('lista-mov');
    container.innerHTML = '';

    app.calistenia.movimentos.forEach(mov => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div>
                <div class="item-titulo">${mov.nome}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${mov.series}×${mov.reps}</strong></div>
                    <div class="item-detalhe"><strong>${mov.nivel}</strong></div>
                </div>
            </div>
            <button class="btn btn-deletar" onclick="deletarMovimento(${mov.id})">🗑️</button>
        `;
        container.appendChild(item);
    });
}

function deletarMovimento(id) {
    app.calistenia.movimentos = app.calistenia.movimentos.filter(m => m.id !== id);
    renderizarMovimentos();
    salvarDados();
}

// ========================================
// DIÁRIO
// ========================================

function salvarTreino() {
    const data = document.getElementById('data-treino').value;
    const tipo = document.getElementById('tipo-treino').value;
    const duracao = parseInt(document.getElementById('duracao-treino').value) || 0;
    const rpe = parseInt(document.getElementById('rpe-treino').value) || 5;
    const notas = document.getElementById('notas-treino').value;

    if (!data || !tipo) {
        alert('Preencha data e tipo!');
        return;
    }

    app.historico.push({
        id: Date.now(),
        data, tipo, duracao, rpe, notas
    });

    // Ganhar poder
    app.poder += rpe * 10;
    app.nivel = Math.floor(app.poder / 500) + 1;

    // Limpar
    document.getElementById('duracao-treino').value = '';
    document.getElementById('notas-treino').value = '';
    document.getElementById('rpe-treino').value = '5';
    document.getElementById('valor-rpe').textContent = '5';
    document.getElementById('data-treino').valueAsDate = new Date();

    renderizarHistorico();
    atualizarUI();
    salvarDados();
    alert('✅ Treino registrado!');
}

function renderizarHistorico() {
    const container = document.getElementById('historico');
    container.innerHTML = '';

    [...app.historico].reverse().forEach(treino => {
        const iconTipo = {
            'forca': '💪',
            'dominio': '🤸',
            'misto': '⚡',
            'descanso': '😴'
        };

        const item = document.createElement('div');
        item.className = 'treino-item';
        item.innerHTML = `
            <div class="treino-data">${iconTipo[treino.tipo]} ${new Date(treino.data).toLocaleDateString('pt-BR')}</div>
            <div class="treino-info">
                <div><strong>RPE:</strong> ${treino.rpe}</div>
                <div><strong>Duração:</strong> ${treino.duracao}m</div>
            </div>
            ${treino.notas ? `<div class="treino-notas">"${treino.notas}"</div>` : ''}
        `;
        container.appendChild(item);
    });
}

// ========================================
// UI
// ========================================

function atualizarUI() {
    document.getElementById('nivel').textContent = `Nível ${app.nivel}`;
    document.getElementById('poder').textContent = `Poder ${Math.floor(app.poder)}`;
    renderizarExercicios();
    renderizarMovimentos();
    renderizarHistorico();
}

// ========================================
// SALVAR/CARREGAR
// ========================================

function salvarDados() {
    localStorage.setItem('temploForca', JSON.stringify(app));
}

function carregarDados() {
    const saved = localStorage.getItem('temploForca');
    if (saved) {
        app = JSON.parse(saved);
    }
}

function exportarDados() {
    const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forca-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
