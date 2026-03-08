// ========================================
// DADOS
// ========================================

let app = {
    nivel: parseInt(localStorage.getItem('jej_nivel')) || 1,
    xp: parseInt(localStorage.getItem('jej_xp')) || 0,
    xpProximo: 100,
    jejunsPlaneados: JSON.parse(localStorage.getItem('jej_planejados')) || [],
    historico: JSON.parse(localStorage.getItem('jej_historico')) || [],
    jejumAtivo: null,
    timerInterval: null,
    tempoInicio: null
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
    carregarJejuns();
    
    // Restaurar jejum ativo se existir
    const jejumSalvo = localStorage.getItem('jej_ativo');
    if (jejumSalvo) {
        app.jejumAtivo = JSON.parse(jejumSalvo);
        iniciarCronometro();
        atualizarStatusJejum();
    }
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
    document.getElementById('btn-iniciar-jejum').addEventListener('click', selecionarJejum);
    document.getElementById('btn-parar-jejum').addEventListener('click', pararJejum);
    document.getElementById('btn-completar-jejum').addEventListener('click', completarJejum);
    document.getElementById('btn-criar-jejum').addEventListener('click', criarJejum);
    document.getElementById('btn-salvar').addEventListener('click', salvarDados);
    document.getElementById('btn-exportar').addEventListener('click', exportarDados);
}

// ========================================
// JEJUM ATIVO
// ========================================

function selecionarJejum() {
    const nome = prompt('Digite o tipo de jejum (ou deixe em branco):');
    if (nome === null) return;

    const duracao = prompt('Duração em horas (padrão 16):');
    const horas = parseInt(duracao) || 16;

    app.jejumAtivo = {
        id: Date.now(),
        nome: nome || 'Jejum Customizado',
        duracao: horas * 3600000, // converter para milissegundos
        inicio: Date.now(),
        completado: false
    };

    app.tempoInicio = app.jejumAtivo.inicio;
    localStorage.setItem('jej_ativo', JSON.stringify(app.jejumAtivo));
    
    iniciarCronometro();
    atualizarStatusJejum();
}

function iniciarCronometro() {
    if (app.timerInterval) clearInterval(app.timerInterval);

    app.timerInterval = setInterval(() => {
        if (!app.jejumAtivo) {
            clearInterval(app.timerInterval);
            return;
        }

        const agora = Date.now();
        const decorrido = agora - app.jejumAtivo.inicio;
        const percentual = (decorrido / app.jejumAtivo.duracao) * 100;

        // Atualizar cronômetro
        const segundosTotais = Math.floor(decorrido / 1000);
        const horas = Math.floor(segundosTotais / 3600);
        const minutos = Math.floor((segundosTotais % 3600) / 60);
        const segundos = segundosTotais % 60;

        const display = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        document.getElementById('tempo-display').textContent = display;
        document.getElementById('progresso-ativo').textContent = Math.min(Math.floor(percentual), 100) + '%';

        // Atualizar barra de XP (visual secundário)
        const barra = document.getElementById('barra-xp');
        barra.style.width = Math.min(percentual, 100) + '%';

        // Verificar se completou
        if (decorrido >= app.jejumAtivo.duracao) {
            mostrarAlerta('✅ JEJUM COMPLETO! Clique em "Completar" para registrar.');
        }
    }, 1000);
}

function pararJejum() {
    if (app.timerInterval) {
        clearInterval(app.timerInterval);
        app.timerInterval = null;
    }

    if (app.jejumAtivo) {
        localStorage.removeItem('jej_ativo');
        app.jejumAtivo = null;
        atualizarStatusJejum();
    }
}

function completarJejum() {
    if (!app.jejumAtivo) {
        alert('Nenhum jejum ativo!');
        return;
    }

    const decorrido = Date.now() - app.jejumAtivo.inicio;
    const horas = Math.floor(decorrido / 3600000);
    const minutos = Math.floor((decorrido % 3600000) / 60000);

    // Registrar no histórico
    app.historico.push({
        id: Date.now(),
        nome: app.jejumAtivo.nome,
        duracao: `${horas}h ${minutos}m`,
        duracaoMs: decorrido,
        meta: app.jejumAtivo.duracao,
        data: new Date().toLocaleDateString(),
        completado: decorrido >= app.jejumAtivo.duracao
    });

    // Ganhar XP (baseado em horas completadas)
    app.xp += Math.floor(horas * 10);
    if (app.xp >= app.xpProximo) {
        app.xp -= app.xpProximo;
        app.nivel++;
        app.xpProximo = Math.floor(app.xpProximo * 1.5);
        alert(`⭐ NÍVEL ${app.nivel}!`);
    }

    pararJejum();
    carregarHistorico();
    atualizarUI();
    salvarDados();
    alert('✅ Jejum completado e registrado!');
}

function atualizarStatusJejum() {
    const btnIniciar = document.getElementById('btn-iniciar-jejum');
    const btnParar = document.getElementById('btn-parar-jejum');
    const btnCompletar = document.getElementById('btn-completar-jejum');
    const tipoAtivo = document.getElementById('tipo-ativo');
    const metaAtiva = document.getElementById('meta-ativa');

    if (app.jejumAtivo) {
        btnIniciar.style.display = 'none';
        btnParar.style.display = 'block';
        btnCompletar.style.display = 'block';
        tipoAtivo.textContent = app.jejumAtivo.nome;
        const metaHoras = Math.floor(app.jejumAtivo.duracao / 3600000);
        metaAtiva.textContent = `${metaHoras}h`;
    } else {
        btnIniciar.style.display = 'block';
        btnParar.style.display = 'none';
        btnCompletar.style.display = 'none';
        tipoAtivo.textContent = 'Nenhum';
        metaAtiva.textContent = '0h';
        document.getElementById('tempo-display').textContent = '00:00:00';
        document.getElementById('progresso-ativo').textContent = '0%';
    }
}

// ========================================
// JEJUNS PLANEJADOS
// ========================================

function criarJejum() {
    const nome = document.getElementById('nome-jejum').value.trim();
    const duracao = parseInt(document.getElementById('duracao-jejum').value) || 0;
    const tipo = document.getElementById('tipo-jejum').value;
    const freq = parseInt(document.getElementById('freq-jejum').value) || 1;
    const notas = document.getElementById('notas-jejum').value;

    if (!nome || duracao === 0 || !tipo) {
        alert('Preencha todos os campos!');
        return;
    }

    const jejum = {
        id: Date.now(),
        nome,
        duracao,
        tipo,
        freq,
        notas
    };

    app.jejunsPlaneados.push(jejum);

    // Limpar
    document.getElementById('nome-jejum').value = '';
    document.getElementById('duracao-jejum').value = '';
    document.getElementById('tipo-jejum').value = '';
    document.getElementById('freq-jejum').value = '';
    document.getElementById('notas-jejum').value = '';

    carregarJejuns();
    salvarDados();
}

function carregarJejuns() {
    const container = document.getElementById('lista-jejuns');
    container.innerHTML = '';

    if (app.jejunsPlaneados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec);">Nenhum jejum planejado</p>';
        return;
    }

    app.jejunsPlaneados.forEach(jejum => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div>
                <div class="item-titulo">${jejum.nome}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${jejum.duracao}h</strong></div>
                    <div class="item-detalhe"><strong>${jejum.tipo}</strong></div>
                    <div class="item-detalhe"><strong>${jejum.freq}x/sem</strong></div>
                </div>
                ${jejum.notas ? `<div style="margin-top: 6px; font-size: 0.8em; color: var(--texto-sec);">"${jejum.notas}"</div>` : ''}
            </div>
            <button class="btn-deletar" onclick="deletarJejum(${jejum.id})">🗑️</button>
        `;
        container.appendChild(item);
    });
}

function deletarJejum(id) {
    app.jejunsPlaneados = app.jejunsPlaneados.filter(j => j.id !== id);
    carregarJejuns();
    salvarDados();
}

// ========================================
// HISTÓRICO
// ========================================

function carregarHistorico() {
    const container = document.getElementById('lista-historico');
    container.innerHTML = '';

    if (app.historico.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--texto-sec);">Nenhum jejum registrado</p>';
        return;
    }

    [...app.historico].reverse().forEach(item => {
        const sucesso = item.completado ? '✅' : '⏸️';
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.innerHTML = `
            <div>
                <div class="item-titulo">${sucesso} ${item.nome}</div>
                <div class="item-detalhes">
                    <div class="item-detalhe"><strong>${item.data}</strong></div>
                    <div class="item-detalhe"><strong>${item.duracao}</strong></div>
                </div>
            </div>
        `;
        container.appendChild(itemEl);
    });
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
}

function mostrarAlerta(msg) {
    // Mostrar de forma sutil no console (evita quebrar cronômetro)
    console.log(msg);
}

// ========================================
// PARTÍCULAS
// ========================================

function gerarParticulas() {
    const container = document.getElementById('particulas-container');
    container.innerHTML = '';

    const qtd = 40;
    for (let i = 0; i < qtd; i++) {
        const p = document.createElement('div');
        p.className = 'particula';

        const tamanho = Math.random() * 2 + 1;
        p.style.width = tamanho + 'px';
        p.style.height = tamanho + 'px';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = -10 + 'px';
        p.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');

        const duration = Math.random() * 6000 + 4000;
        const delay = Math.random() * 4000;
        p.style.animationDuration = duration + 'ms';
        p.style.animationDelay = delay + 'ms';

        container.appendChild(p);
    }
}

// ========================================
// SALVAR/CARREGAR
// ========================================

function salvarDados() {
    localStorage.setItem('jej_nivel', app.nivel);
    localStorage.setItem('jej_xp', app.xp);
    localStorage.setItem('jej_planejados', JSON.stringify(app.jejunsPlaneados));
    localStorage.setItem('jej_historico', JSON.stringify(app.historico));
}

function exportarDados() {
    const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jejum-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
