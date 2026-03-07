let intervalo;

// Função principal que roda o cronômetro
function rodarCronometro() {
    clearInterval(intervalo);

    intervalo = setInterval(() => {
        const fim = localStorage.getItem("fimJejum");
        const inicio = localStorage.getItem("inicioJejum");
        const duracao = localStorage.getItem("duracao");

        if (!fim) {
            clearInterval(intervalo);
            return;
        }

        const agora = new Date().getTime();
        const restante = fim - agora;
        const totalMs = duracao * 3600000;
        const feito = agora - inicio;

        // Atualiza a Barra de Progresso
        const porcentagem = (feito / totalMs) * 100;
        document.getElementById("progresso").style.width = Math.min(porcentagem, 100) + "%";

        // Verifica se o tempo acabou
        if (restante <= 0) {
            document.getElementById("tempoRestante").innerText = "CONCLUÍDO";
            document.getElementById("tempoRestante").style.color = "var(--gold)";
            
            // Só ganha XP se o jejum ainda estiver ativo no sistema
            if(localStorage.getItem("fimJejum")) {
                ganharXP();
                pararJejum(); // Limpa o storage mas mantém o status de concluído
            }
            clearInterval(intervalo);
            return;
        }

        // Cálculos de H:M:S
        let h = Math.floor(restante / (1000 * 60 * 60));
        let m = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((restante % (1000 * 60)) / 1000);

        // Formatação com zero à esquerda (00:00:00)
        const formato = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        document.getElementById("tempoRestante").innerText = formato;
        
    }, 1000);
}

function iniciarJejum() {
    const horaInicio = document.getElementById("horaInicio").value;
    const duracao = document.getElementById("duracao").value;

    if (!horaInicio || !duracao) {
        alert("Defina o início e a duração.");
        return;
    }

    // Define o objeto de data baseado na hora escolhida (Hoje)
    let inicio = new Date();
    let partes = horaInicio.split(":");
    inicio.setHours(partes[0], partes[1], 0, 0);

    // Se a hora de início escolhida for maior que agora, assume-se que foi ontem ou é um erro. 
    // Para simplificar, vamos garantir que o início seja o momento do clique ou a hora exata de hoje.
    const agora = new Date().getTime();
    const fim = inicio.getTime() + (duracao * 3600000);

    if (fim <= agora) {
        alert("O horário de término não pode ser no passado!");
        return;
    }

    // Salva no LocalStorage (persiste mesmo fechando o navegador)
    localStorage.setItem("inicioJejum", inicio.getTime());
    localStorage.setItem("fimJejum", fim);
    localStorage.setItem("duracao", duracao);

    document.getElementById("fimJejum").innerText = "Término: " + new Date(fim).toLocaleTimeString();
    
    rodarCronometro();
}

function pararJejum() {
    clearInterval(intervalo);
    localStorage.removeItem("inicioJejum");
    localStorage.removeItem("fimJejum");
    localStorage.removeItem("duracao");
    
    document.getElementById("progresso").style.width = "0%";
    document.getElementById("fimJejum").innerText = "";
}

// --- FUNÇÕES DE STATUS E HISTÓRICO ---

function ganharXP() {
    let xp = parseInt(localStorage.getItem("xp") || 0);
    xp += 50;
    localStorage.setItem("xp", xp);
    document.getElementById("xp").innerText = xp;
    salvarHistorico();
    verificarConquistas();
}

function verificarConquistas() {
    let xp = parseInt(localStorage.getItem("xp") || 0);
    let lista = document.getElementById("conquistas");
    lista.innerHTML = "";

    if (xp >= 10)
lista.innerHTML += "<li>◈ Primeiro Passo — Experimentou o jejum pela primeira vez</li>";

if (xp >= 30)
lista.innerHTML += "<li>◈ Aprendiz do Vazio — Começa a entender o controle da fome</li>";

if (xp >= 60)
lista.innerHTML += "<li>◈ Iniciado da Disciplina — Primeiros sinais de força mental</li>";

if (xp >= 100)
lista.innerHTML += "<li>⬢ Caminhante da Resistência — A fome já não assusta</li>";

if (xp >= 150)
lista.innerHTML += "<li>⬢ Discípulo da Disciplina — Corpo e mente aprendem a obedecer</li>";

if (xp >= 220)
lista.innerHTML += "<li>⬢ Guardião da Vontade — Consegue manter o foco mesmo cansado</li>";

if (xp >= 300)
lista.innerHTML += "<li>✦ Controlador da Fome — O impulso de comer já não domina</li>";

if (xp >= 400)
lista.innerHTML += "<li>✦ Guerreiro da Disciplina — Sua rotina começa a se solidificar</li>";

if (xp >= 500)
lista.innerHTML += "<li>✦ Mestre do Jejum — A fome virou apenas um sinal, não um comando</li>";

if (xp >= 650)
lista.innerHTML += "<li>⚜ Asceta de Ferro — Grande resistência física e mental</li>";

if (xp >= 800)
lista.innerHTML += "<li>⚜ Guardião do Silêncio — Domínio sobre o próprio corpo</li>";

if (xp >= 1000)
lista.innerHTML += "<li>💠 Lenda da Disciplina — Poucos chegam tão longe</li>";

if (xp >= 1500)
lista.innerHTML += "<li>⚡ Titã da Disciplina — Resistência além dos limites humanos</li>";

if (xp >= 2000)
lista.innerHTML += "<li>👑 Arquimestre do Jejum — Controle absoluto da mente</li>";
}

function salvarHistorico() {
    let hist = JSON.parse(localStorage.getItem("historico") || "[]");
    hist.unshift("jejum Completo: " + new Date().toLocaleDateString() + " às " + new Date().toLocaleTimeString());
    localStorage.setItem("historico", JSON.stringify(hist.slice(0, 5))); // Mantém os últimos 5
}

function mostrarHistorico() {
    let hist = JSON.parse(localStorage.getItem("historico") || "[]");
    let div = document.getElementById("historico");
    div.innerHTML = "<h2>Histórico</h2>" + hist.map(e => `<p>${e}</p>`).join("");
}

// --- AO CARREGAR A PÁGINA ---
window.onload = () => {
    // Recupera XP
    let xp = localStorage.getItem("xp") || 0;
    document.getElementById("xp").innerText = xp;
    verificarConquistas();

    // Verifica se existe um jejum em andamento
    if (localStorage.getItem("fimJejum")) {
        const fim = parseInt(localStorage.getItem("fimJejum"));
        if (fim > new Date().getTime()) {
            document.getElementById("fimJejum").innerText = "Término: " + new Date(fim).toLocaleTimeString();
            rodarCronometro();
        } else {
            // Se o tempo acabou enquanto o site estava fechado
            document.getElementById("tempoRestante").innerText = "CONCLUÍDO";
            document.getElementById("progresso").style.width = "100%";
        }
    }
};