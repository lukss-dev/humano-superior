// ========================================
// DADOS
// ========================================

let app = {
    modoAtual: 'calor',
    nivel: parseInt(localStorage.getItem('res_nivel')) || 1,
    xp: parseInt(localStorage.getItem('res_xp')) || 0,
    xpProximo: 100,
    sessoes: JSON.parse(localStorage.getItem('res_sessoes')) || [],
    treinos: JSON.parse(localStorage.getItem('res_treinos')) || []
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    inicializarEventos();
    gerarParticulas();
    atualizarUI();
    carregarHistorico();
    carregarTreinos();
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
// EVENTOS
// ========================================

function inicializarEventos() {
    // Toggle clima
    document.getElementById('btn-alternar').addEventListener('click', alternarClima);

    // Sessões
    document.getElementById('intensidade-sessao').addEventListener('input', (e) => {
        document.getElementById('valor-intensidade').textContent = e.target.value;
    });
    document.getElementById('btn-salvar-sessao').addEventListener('click', salvarSessao);

    // Treinos
    document.getElementById('btn-criar-treino').addEventListener('click', criarTreino);

    // Geral
    document.getElementById('btn-salvar').addEventListener('click', salvarDados);
    document.getElementById('btn-exportar').addEventListener('click', exportarDados);
}

// ========================================
// ALTERNAR CLIMA
// ========================================

function alternarClima() {
    const body = document.getElementById('clima-body');
    body.classList.add('trocando');

    setTimeout(() => {
        app.modoAtual = app.modoAtual === 'calor' ? 'frio' : 'calor';
        body.className = `modo-${app.modoAtual}`;

        const titulo = document.getElementById('titulo-reino');
        titulo.innerText = app.modoAtual === 'calor' 
            ? '🔥 Câmara de Resistência' 
            : '❄️ Câmara de Resistência';

        gerarParticulas();
        atualizarSessoes();
    }, 600);

    setTimeout(() => body.classList.remove('trocando'), 1000);
}

// ========================================
// SESSÕES
// ========================================

function salvarSessao() {
    const tipo = document.getElementById('tipo-sessao').value;
    const duracao = parseInt(document.getElementById('duracao-sessao').value) || 0;
    const intensidade = parseInt(document.getElementById('intensidade-sessao').value) || 5;
    const notas = document.getElementById('notas-sessao').value;

    if (!tipo || duracao === 0) {
        alert('Preencha tipo e duração!');
        return;
    }

    const sessao = {
        id: Date.now(),
        tipo,
        duracao,
        intensidade,
        notas,
        modo: app.modoAtual,
        data: new Date().toLocaleDateString()
    };

    app.sessoes.push(sessao);

    // Ganhar XP
    app.xp += intensidade * 2 + duracao;
    if (app.xp >= app.xpProximo) {
        app.xp -= app.xpProximo;
        app.nivel++;
        app.xpProximo = Math.floor(app.xpProximo * 1.5);
        alert(`⭐ NÍVEL ${app.nivel}!`);
    }

    // Limpar
    document.getElementById('tipo-sessao').value = '';
    document.getElementById('duracao-sessao').value = '';
    document.getElementById('intensidade-sessao').value = '5';
    document.getElementById('valor-intensidade').textContent = '5';
    document.getElementById('notas-sessao').value = '';

    atualizarUI();
    carregarHistorico();
    salvarDados();
    alert('✅ Sessão registrada!');
}

function carregarHistorico() {
    const container = document.getElementById('lista-historico');
    container.innerHTML = '';

    if (app.sessoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec);">Nenhuma sessão registrada</p>';
        return;
    }

    [...app.sessoes].reverse().forEach(sessao => {
        const icon = sessao.modo === 'calor' ? '🔥' : '❄️';
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div>
                <div class="item-titulo">${icon} ${sessao.tipo}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${sessao.data}</strong></div>
                    <div class="item-detalhe"><strong>${sessao.duracao}min</strong></div>
                    <div class="item-detalhe"><strong>Intensidade: ${sessao.intensidade}/10</strong></div>
                </div>
                ${sessao.notas ? `<div style="margin-top: 6px; font-size: 0.8em; color: var(--texto-sec);">"${sessao.notas}"</div>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function atualizarSessoes() {
    // Atualizar tipos de exposição baseado no modo
    const select = document.getElementById('tipo-sessao');
    const opcoesFrio = [
        { value: 'banho', text: 'Banho Gelado' },
        { value: 'corrida', text: 'Corrida Fria' },
        { value: 'imersao', text: 'Imersão' },
        { value: 'sauna', text: 'Sauna Fria' }
    ];
    const opcoesCalor = [
        { value: 'banho', text: 'Banho Quente' },
        { value: 'corrida', text: 'Corrida Quente' },
        { value: 'imersao', text: 'Sauna' },
        { value: 'sauna', text: 'Calor Extremo' }
    ];

    const opcoes = app.modoAtual === 'frio' ? opcoesFrio : opcoesCalor;
    
    select.innerHTML = '<option value="">Selecione</option>';
    opcoes.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op.value;
        opt.textContent = op.text;
        select.appendChild(opt);
    });
}

// ========================================
// TREINOS
// ========================================

function criarTreino() {
    const nome = document.getElementById('nome-treino').value.trim();
    const tipo = document.getElementById('tipo-treino').value;
    const freq = parseInt(document.getElementById('freq-treino').value) || 1;

    if (!nome || !tipo) {
        alert('Preencha nome e tipo!');
        return;
    }

    const treino = {
        id: Date.now(),
        nome,
        tipo,
        freq,
        modo: app.modoAtual
    };

    app.treinos.push(treino);

    document.getElementById('nome-treino').value = '';
    document.getElementById('tipo-treino').value = '';
    document.getElementById('freq-treino').value = '';

    carregarTreinos();
    salvarDados();
}

function carregarTreinos() {
    const container = document.getElementById('lista-treinos');
    container.innerHTML = '';

    const treinosFiltrados = app.treinos.filter(t => t.modo === app.modoAtual);

    if (treinosFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec);">Nenhum treino criado</p>';
        return;
    }

    treinosFiltrados.forEach(treino => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div>
                <div class="item-titulo">${treino.nome}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${treino.tipo}</strong></div>
                    <div class="item-detalhe"><strong>${treino.freq}x/sem</strong></div>
                </div>
            </div>
            <button class="btn-deletar" onclick="deletarTreino(${treino.id})">🗑️</button>
        `;
        container.appendChild(item);
    });
}

function deletarTreino(id) {
    app.treinos = app.treinos.filter(t => t.id !== id);
    carregarTreinos();
    salvarDados();
}

// ========================================
// UI
// ========================================

function atualizarUI() {
    document.getElementById('lvl-display').textContent = app.nivel;
    document.getElementById('xp-texto').textContent = `${app.xp} / ${app.xpProximo} XP`;
    
    const barra = document.getElementById('barra-xp');
    const percent = (app.xp / app.xpProximo) * 100;
    barra.style.width = percent + '%';

    atualizarSessoes();
    carregarTreinos();
}

// ========================================
// PARTÍCULAS
// ========================================

function gerarParticulas() {
    const container = document.getElementById('particulas-container');
    container.innerHTML = '';

    const qtd = 60;
    for (let i = 0; i < qtd; i++) {
        const p = document.createElement('div');
        p.className = 'particula';

        const tamanho = Math.random() * 3 + 1;
        p.style.width = tamanho + 'px';
        p.style.height = tamanho + 'px';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');

        if (app.modoAtual === 'calor') {
            p.style.bottom = '-10px';
            const duration = Math.random() * 1500 + 1000;
            const delay = Math.random() * 2000;
            p.style.animation = `subirFogo ${duration}ms linear ${delay}ms infinite`;
        } else {
            p.style.top = '-10px';
            const duration = Math.random() * 4000 + 3000;
            p.style.animation = `caiuGelo ${duration}ms linear infinite`;
        }

        container.appendChild(p);
    }
}

// ========================================
// SALVAR/CARREGAR
// ========================================

function salvarDados() {
    localStorage.setItem('res_nivel', app.nivel);
    localStorage.setItem('res_xp', app.xp);
    localStorage.setItem('res_sessoes', JSON.stringify(app.sessoes));
    localStorage.setItem('res_treinos', JSON.stringify(app.treinos));
}

function exportarDados() {
    const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resistencia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
