// 1. Configurações de Ranks e Missões
const ranks = {
    "F": 10, "E": 25, "D": 50, "C": 100, 
    "B": 250, "A": 500, "S": 1000, "SS": 2500, "SSS": 5000
};

const missoesPorClima = {
    calor: [
        { rank: "F", desc: "Lavar louça no vapor da água quente" },
        { rank: "E", desc: "Caminhada de 20min sob sol" },
        { rank: "D", desc: "Treino funcional sem ventilador" },
        { rank: "C", desc: "Banho progressivamente quente" },
        { rank: "B", desc: "Corrida leve ao meio-dia" },
        { rank: "A", desc: "Sessão de 15min de Sauna" },
        { rank: "S", desc: "Treino de força em alta temperatura" },
        { rank: "SS", desc: "Marcha com carga no deserto/calor extremo" },
        { rank: "SSS", desc: "Provação de Hefesto: Exposição Limite" }
    ],
    frio: [
        { rank: "F", desc: "Lavar o rosto com água gelada ao acordar" },
        { rank: "E", desc: "Banho: Últimos 30s de água fria" },
        { rank: "D", desc: "Ficar 5min sem casaco no vento frio" },
        { rank: "C", desc: "Imersão de pés em balde de gelo" },
        { rank: "B", desc: "Banho totalmente gelado (3min)" },
        { rank: "A", desc: "Treino ao ar livre (noite fria/sereno)" },
        { rank: "S", desc: "Imersão de corpo inteiro no gelo (5min)" },
        { rank: "SS", desc: "Natação em águas abertas/frias" },
        { rank: "SSS", desc: "Pele de Titã: Resistência Criogênica" }
    ]
};

// 2. Variáveis de Estado (Iniciam o jogo)
let xpAtual = 0;
let xpNecessario = 100;
let nivel = 1;
let modoAtual = "calor";

// 3. Função para Renderizar as Missões na Tela
function carregarMissoes() {
    const lista = document.getElementById('lista-missoes');
    if (!lista) return;

    lista.innerHTML = "";
    missoesPorClima[modoAtual].forEach(m => {
        const div = document.createElement('div');
        div.className = "missao-card";
        div.onclick = () => completarMissao(m);
        div.innerHTML = `
            <div>
                <span class="rank-badge">${m.rank}</span> 
                <span style="margin-left:8px">${m.desc}</span>
            </div>
            <span class="xp-award">+${ranks[m.rank]} XP</span>
        `;
        lista.appendChild(div);
    });
}

// 4. Função para Completar Missão e Ganhar XP
function completarMissao(missao) {
    const xpGanho = ranks[missao.rank];
    if(confirm(`Deseja iniciar o contrato [${missao.desc}]?\nRecompensa: ${xpGanho} XP`)) {
        xpAtual += xpGanho;
        
        // Lógica de Level Up
        while (xpAtual >= xpNecessario) {
            xpAtual -= xpNecessario;
            nivel++;
            xpNecessario = Math.floor(xpNecessario * 1.5);
            alert(`⭐ ADAPTAÇÃO EVOLUÍDA: Nível ${nivel}`);
        }
        atualizarUI();
    }
}

// 5. Função para Atualizar a Interface (Barra e Textos)
function atualizarUI() {
    const lvlDisp = document.getElementById('lvl-display');
    const xpTxt = document.getElementById('xp-texto');
    const barra = document.getElementById('barra-xp');

    if (lvlDisp) lvlDisp.innerText = nivel;
    if (xpTxt) xpTxt.innerText = `${xpAtual} / ${xpNecessario} XP`;
    if (barra) {
        const porcentagem = (xpAtual / xpNecessario) * 100;
        barra.style.width = porcentagem + "%";
    }
}

// 6. Evento de Transição Suave (O "Portal Elemental")
document.getElementById('btn-alternar').addEventListener('click', () => {
    document.body.classList.add('trocando'); // Ativa desfoque e escurecimento no CSS

    setTimeout(() => {
        // Troca o modo e os textos no auge do efeito visual
        modoAtual = (modoAtual === "calor") ? "frio" : "calor";
        document.body.className = `modo-${modoAtual}`;
        
        const titulo = document.getElementById('titulo-reino');
        if (titulo) {
            titulo.innerText = (modoAtual === "calor") ? "🔥 Forja de Hefesto" : "❄️ Glaciar de Bóreas";
        }
        
        carregarMissoes();
    }, 600); 

    setTimeout(() => {
        document.body.classList.remove('trocando'); // Remove o efeito e volta a nitidez
    }, 1000);
});

// 7. Inicialização ao carregar a página
carregarMissoes();
atualizarUI();