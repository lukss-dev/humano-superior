// ========================================
// DADOS
// ========================================

let app = {
    nivel: parseInt(localStorage.getItem('mis_nivel')) || 1,
    xp: parseInt(localStorage.getItem('mis_xp')) || 0,
    xpProximo: 100,
    serieDias: parseInt(localStorage.getItem('mis_serie')) || 0,
    ultimoDia: localStorage.getItem('mis_ultimo_dia') || null,
    missoes: JSON.parse(localStorage.getItem('mis_missoes')) || [],
    historico: JSON.parse(localStorage.getItem('mis_historico')) || [],
    filtroAtual: 'todas'
};

const templates = {
    forca: {
        nome: '💪 Treino de Força',
        desc: 'Treino completo de musculação',
        xp: 50,
        tipo: 'forca',
        dificuldade: 'dificil'
    },
    cardio: {
        nome: '🏃 Cardio',
        desc: 'Corrida ou cardio de 30 minutos',
        xp: 40,
        tipo: 'cardio',
        dificuldade: 'normal'
    },
    jejum: {
        nome: '⏱️ Jejum Intermitente',
        desc: 'Completar jejum de 16 horas',
        xp: 35,
        tipo: 'jejum',
        dificuldade: 'normal'
    },
    leitura: {
        nome: '📚 Leitura',
        desc: 'Ler por 30 minutos',
        xp: 20,
        tipo: 'geral',
        dificuldade: 'facil'
    },
    meditacao: {
        nome: '🧘 Meditação',
        desc: 'Meditar por 15 minutos',
        xp: 25,
        tipo: 'geral',
        dificuldade: 'facil'
    },
    agua: {
        nome: '💧 Beber Água',
        desc: 'Beber 2 litros de água',
        xp: 15,
        tipo: 'geral',
        dificuldade: 'facil'
    }
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    inicializarFiltros();
    inicializarEventos();
    gerarParticulas();
    atualizarUI();
    verificarSerie();
    carregarMissoes();
});

// ========================================
// VERIFICAR SÉRIE
// ========================================

function verificarSerie() {
    const hoje = new Date().toISOString().split('T')[0];
    
    if (app.ultimoDia !== hoje) {
        if (app.ultimoDia) {
            const ultimoData = new Date(app.ultimoDia);
            const hojeData = new Date(hoje);
            const diferenca = Math.floor((hojeData - ultimoData) / (1000 * 60 * 60 * 24));
            
            if (diferenca === 1) {
                app.serieDias++;
                if (app.serieDias % 7 === 0) {
                    alert(`🔥 SÉRIE DE ${app.serieDias} DIAS! Bônus: +50 XP`);
                    app.xp += 50;
                }
            } else if (diferenca > 1) {
                app.serieDias = 1;
            }
        } else {
            app.serieDias = 1;
        }
        
        app.ultimoDia = hoje;
        salvarDados();
    }
}

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
// FILTROS
// ========================================

function inicializarFiltros() {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            app.filtroAtual = btn.dataset.filtro;
            carregarMissoes();
        });
    });
}

// ========================================
// EVENTOS
// ========================================

function inicializarEventos() {
    document.getElementById('btn-criar-missao').addEventListener('click', criarMissao);
    document.getElementById('btn-salvar').addEventListener('click', salvarDados);
    document.getElementById('btn-exportar').addEventListener('click', exportarDados);
}

// ========================================
// CRIAR MISSÃO
// ========================================

function criarMissao() {
    const nome = document.getElementById('nome-missao').value.trim();
    const desc = document.getElementById('desc-missao').value.trim();
    const xp = parseInt(document.getElementById('xp-missao').value) || 25;
    const dif = document.getElementById('dif-missao').value;
    const tipo = document.getElementById('tipo-missao').value;
    const freq = document.getElementById('freq-missao').value;

    if (!nome || !dif || !tipo) {
        alert('Preencha todos os campos!');
        return;
    }

    const missao = {
        id: Date.now(),
        nome,
        desc,
        xp,
        dificuldade: dif,
        tipo,
        frequencia: freq,
        completa: false,
        dataCriacao: new Date().toLocaleDateString(),
        dataCompletada: null
    };

    app.missoes.push(missao);

    // Limpar
    document.getElementById('nome-missao').value = '';
    document.getElementById('desc-missao').value = '';
    document.getElementById('xp-missao').value = '';
    document.getElementById('dif-missao').value = '';
    document.getElementById('tipo-missao').value = '';

    carregarMissoes();
    salvarDados();
}

function usarTemplate(tipo) {
    const tmpl = templates[tipo];
    if (!tmpl) return;

    document.getElementById('nome-missao').value = tmpl.nome;
    document.getElementById('desc-missao').value = tmpl.desc;
    document.getElementById('xp-missao').value = tmpl.xp;
    document.getElementById('dif-missao').value = tmpl.dificuldade;
    document.getElementById('tipo-missao').value = tmpl.tipo;
}

// ========================================
// CARREGAR MISSÕES
// ========================================

function carregarMissoes() {
    const container = document.getElementById('lista-missoes');
    container.innerHTML = '';

    let missoesFiltradas = app.missoes;

    if (app.filtroAtual === 'ativas') {
        missoesFiltradas = app.missoes.filter(m => !m.completa);
    } else if (app.filtroAtual === 'completas') {
        missoesFiltradas = app.missoes.filter(m => m.completa);
    }

    if (missoesFiltradas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec); padding: 20px;">Nenhuma missão</p>';
        return;
    }

    const ativas = app.missoes.filter(m => !m.completa).length;
    const completas = app.missoes.filter(m => m.completa).length;
    document.getElementById('completas-hoje').textContent = `${completas}/${app.missoes.length}`;

    missoesFiltradas.forEach(missao => {
        const card = document.createElement('div');
        card.className = `missao-card ${missao.completa ? 'completa' : ''}`;
        
        const iconDif = {
            'facil': '🌱',
            'normal': '📈',
            'dificil': '🔥',
            'impossivel': '👑'
        };

        const iconTipo = {
            'forca': '💪',
            'resistencia': '❄️',
            'jejum': '⏱️',
            'cardio': '🏃',
            'geral': '⭐'
        };

        card.innerHTML = `
            <div class="missao-header">
                <div class="missao-titulo">${missao.nome}</div>
                <div class="missao-xp">+${missao.xp} XP</div>
            </div>
            ${missao.desc ? `<div class="missao-desc">${missao.desc}</div>` : ''}
            <div class="missao-info">
                <span class="info-tag">${iconDif[missao.dificuldade]} ${missao.dificuldade}</span>
                <span class="info-tag">${iconTipo[missao.tipo]} ${missao.tipo}</span>
                <span class="info-tag">📅 ${missao.frequencia}</span>
            </div>
            <div class="missao-acoes">
                <div class="barra-progresso">
                    <div class="barra-fill" style="width: ${missao.completa ? 100 : 0}%"></div>
                </div>
                ${missao.completa ? 
                    `<button class="btn-completar" disabled>✅</button>` :
                    `<button class="btn-completar" onclick="completarMissao(${missao.id})">✓</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

function completarMissao(id) {
    const missao = app.missoes.find(m => m.id === id);
    if (!missao) return;

    missao.completa = true;
    missao.dataCompletada = new Date().toLocaleDateString();

    // Registrar no histórico
    app.historico.push({
        id: Date.now(),
        missaoId: id,
        nome: missao.nome,
        xp: missao.xp,
        data: missao.dataCompletada
    });

    // Ganhar XP
    app.xp += missao.xp;
    
    if (app.xp >= app.xpProximo) {
        app.xp -= app.xpProximo;
        app.nivel++;
        app.xpProximo = Math.floor(app.xpProximo * 1.5);
        alert(`⭐ NÍVEL ${app.nivel}!`);
        criarEfeitoVitoria();
    }

    carregarMissoes();
    carregarHistorico();
    atualizarUI();
    salvarDados();
}

function carregarHistorico() {
    const container = document.getElementById('lista-historico');
    container.innerHTML = '';

    if (app.historico.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec); padding: 20px;">Nenhuma missão completada</p>';
        return;
    }

    [...app.historico].reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'missao-card completa';
        card.innerHTML = `
            <div class="missao-header">
                <div class="missao-titulo">✅ ${item.nome}</div>
                <div class="missao-xp">+${item.xp} XP</div>
            </div>
            <div class="missao-info">
                <span class="info-tag">📅 ${item.data}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ========================================
// UI
// ========================================

function atualizarUI() {
    document.getElementById('lvl-display').textContent = app.nivel;
    document.getElementById('xp-texto').textContent = `${app.xp} / ${app.xpProximo} XP`;
    document.getElementById('serie-dias').textContent = `${app.serieDias} dias`;
    
    const barra = document.getElementById('barra-xp');
    const percent = (app.xp / app.xpProximo) * 100;
    barra.style.width = percent + '%';

    const completas = app.missoes.filter(m => m.completa).length;
    document.getElementById('completas-hoje').textContent = `${completas}/${app.missoes.length}`;
}

function criarEfeitoVitoria() {
    const container = document.getElementById('particulas-container');
    
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        
        const tamanho = Math.random() * 3 + 2;
        p.style.width = tamanho + 'px';
        p.style.height = tamanho + 'px';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

// ========================================
// SALVAR/CARREGAR
// ========================================

function salvarDados() {
    localStorage.setItem('mis_nivel', app.nivel);
    localStorage.setItem('mis_xp', app.xp);
    localStorage.setItem('mis_serie', app.serieDias);
    localStorage.setItem('mis_ultimo_dia', app.ultimoDia);
    localStorage.setItem('mis_missoes', JSON.stringify(app.missoes));
    localStorage.setItem('mis_historico', JSON.stringify(app.historico));
}

function exportarDados() {
    const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `missoes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// PARTÍCULAS
// ========================================

function gerarParticulas() {
    const container = document.getElementById('particulas-container');
    if (!container) return;
}
