const ranks = { 
    "F": 10, "E": 20, "D": 35, "C": 55, "B": 80, 
    "A": 120, "S": 200, "SS": 350, "SSS": 600 
};

const missoesPorClima = {
    calor: [
        { rank: "F", desc: "Toque do Verão: 10min Caminhada + Hidratação" },
        { rank: "E", desc: "Pele Solar: 15min Corrida Leve + 10min Exposição" },
        { rank: "D", desc: "Fornalha Interior: 20min Corrida + Controle de Suor" },
        { rank: "C", desc: "Corpo Adaptado: Intervalado Leve + 20min Sol" },
        { rank: "B", desc: "Resistência do Deserto: 30min Calor + Hidratação Fracionada" },
        { rank: "A", desc: "Sangue Quente: Longão Moderado + Recuperação Ativa" },
        { rank: "S", desc: "Guerreiro do Sol: Performance com Frequência Cardíaca Controlada" },
        { rank: "SS", desc: "Núcleo de Magma: Adaptação Cardiovascular Clara" },
        { rank: "SSS", desc: "Avatar Elementar: Domínio e Execução sob Calor Extremo" }
    ],
    frio: [
        { rank: "F", desc: "O Despertar do Norte: 15s Banho Frio + Respiração" },
        { rank: "E", desc: "Pele de Inverno: 45s Banho Frio + Rosto na Água Gelo" },
        { rank: "D", desc: "Corpo que Gera Fogo: 1min Banho Frio + 20min Corrida" },
        { rank: "C", desc: "Disciplina Ártica: 2min Banho Frio + Pés no Gelo" },
        { rank: "B", desc: "Sangue Espesso: 4min Banho Frio + 30min Corrida" },
        { rank: "A", desc: "Guardião do Inverno: 5min Banho Frio + Imersão Pernas" },
        { rank: "S", desc: "Predador Polar: 10min Imersão Parcial + Respiração Estável" },
        { rank: "SS", desc: "Coração do Gelo: 12min Imersão Progressiva + Performance" },
        { rank: "SSS", desc: "Senhor do Inverno: Controle Total e Calma Absoluta no Gelo" }
    ]
};
// --- CARREGAMENTO DE DADOS ---
let xpAtual = parseInt(localStorage.getItem('resistencia_xp')) || 0;
let xpNecessario = parseInt(localStorage.getItem('resistencia_xp_next')) || 100;
let nivel = parseInt(localStorage.getItem('resistencia_nivel')) || 1;
let modoAtual = "calor";

// --- FUNÇÕES DE PERSISTÊNCIA ---
function salvarProgresso() {
    localStorage.setItem('resistencia_xp', xpAtual);
    localStorage.setItem('resistencia_xp_next', xpNecessario);
    localStorage.setItem('resistencia_nivel', nivel);
}

function atualizarUI() {
    const lvlDisplay = document.getElementById('lvl-display');
    const xpTexto = document.getElementById('xp-texto');
    const barraXp = document.getElementById('barra-xp');

    if (lvlDisplay) lvlDisplay.innerText = nivel;
    if (xpTexto) xpTexto.innerText = `${xpAtual} / ${xpNecessario} XP`;
    if (barraXp) {
        let progresso = (xpAtual / xpNecessario) * 100;
        barraXp.style.width = progresso + "%";
    }
}

// --- LÓGICA DE PARTÍCULAS ---
function gerarEfeitos() {
    const container = document.getElementById('particulas-container');
    if (!container) return;
    
    container.innerHTML = "";
    const qtd = 60; 

    for (let i = 0; i < qtd; i++) {
        const p = document.createElement('div');
        p.className = "particula";
        
        const tamanho = Math.random() * 3 + 1;
        p.style.width = tamanho + "px";
        p.style.height = tamanho + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.position = "absolute";
        
        if (modoAtual === "calor") {
            p.style.background = "linear-gradient(to top, #ffae00, #fff)";
            p.style.boxShadow = "0 0 10px #ff4500, 0 0 20px #ff8c00";
            p.style.borderRadius = "1px";
            p.style.bottom = "-10px";

            p.animate([
                { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translateY(-110vh) translateX(${Math.random() * 100 - 50}px) rotate(720deg) scale(0)`, opacity: 0 }
            ], { 
                duration: Math.random() * 1500 + 1000, 
                iterations: Infinity,
                delay: Math.random() * 2000
            });
        } else {
            p.style.background = "#fff";
            p.style.boxShadow = "0 0 8px #00d4ff";
            p.style.borderRadius = "50%";
            p.style.top = "-10px";

            p.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
                { transform: `translateY(110vh) rotate(360deg) translateX(${Math.random() * 60 - 30}px)`, opacity: 0 }
            ], { 
                duration: Math.random() * 4000 + 3000, 
                iterations: Infinity 
            });
        }
        container.appendChild(p);
    }
}

// --- LÓGICA DE MISSÕES ---
function carregarMissoes() {
    const lista = document.getElementById('lista-missoes');
    if (!lista) return;
    lista.innerHTML = "";
    
    missoesPorClima[modoAtual].forEach(m => {
        const div = document.createElement('div');
        div.className = "missao-card";
        div.onclick = () => completarMissao(m);
        div.innerHTML = `
            <div><span class="rank-badge">${m.rank}</span> <span style="margin-left:8px">${m.desc}</span></div>
            <span class="xp-award">+${ranks[m.rank]} XP</span>
        `;
        lista.appendChild(div);
    });
}

function completarMissao(missao) {
    if(confirm(`Iniciar contrato: ${missao.desc}?`)) {
        xpAtual += ranks[missao.rank];
        
        while (xpAtual >= xpNecessario) {
            xpAtual -= xpNecessario;
            nivel++;
            xpNecessario = Math.floor(xpNecessario * 1.5);
            alert(`⭐ ADAPTAÇÃO EVOLUÍDA: Nível ${nivel}`);
        }
        
        salvarProgresso(); // Grava os dados no localStorage
        atualizarUI();     // Atualiza a tela imediatamente
    }
}

// --- EVENTOS ---
document.getElementById('btn-alternar').addEventListener('click', () => {
    document.body.classList.add('trocando');
    setTimeout(() => {
        modoAtual = (modoAtual === "calor") ? "frio" : "calor";
        document.body.className = `modo-${modoAtual}`;
        const titulo = document.getElementById('titulo-reino');
        if (titulo) {
            titulo.innerText = modoAtual === "calor" ? "🔥 Forja de Hefesto" : "❄️ Glaciar de Bóreas";
        }
        gerarEfeitos();
        carregarMissoes();
    }, 600);
    setTimeout(() => document.body.classList.remove('trocando'), 1000);
});

// --- INICIALIZAÇÃO ---
window.onload = () => {
    gerarEfeitos();
    carregarMissoes();
    atualizarUI();
};
