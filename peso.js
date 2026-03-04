let meuGrafico;
let dadosPeso = JSON.parse(localStorage.getItem('historicoPeso')) || [];

window.onload = function() {
    atualizarMetasNaTela();
    inicializarGrafico();
};

function inicializarGrafico() {
    const ctx = document.getElementById('graficoPeso').getContext('2d');
    
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosPeso.map(d => d.data),
            datasets: [{
                label: 'Peso Atual (kg)',
                data: dadosPeso.map(d => d.valor),
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { grid: { color: '#333' }, ticks: { color: '#aaa' } },
                x: { grid: { display: false }, ticks: { color: '#aaa' } }
            }
        }
    });
}

function registrarPeso() {
    const pesoInput = document.getElementById('input-peso').value;
    if (!pesoInput) return alert("Digite um peso válido!");

    const hoje = new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
    
    dadosPeso.push({ data: hoje, valor: parseFloat(pesoInput) });
    localStorage.setItem('historicoPeso', JSON.stringify(dadosPeso));

    meuGrafico.data.labels.push(hoje);
    meuGrafico.data.datasets[0].data.push(parseFloat(pesoInput));
    meuGrafico.update();
}

function configurarMetas() {
    const s = prompt("Meta para esta semana (kg):");
    const m = prompt("Meta para este mês (kg):");
    const f = prompt("Meta FINAL (kg):");

    const metas = { semana: s, mes: m, final: f };
    localStorage.setItem('metasPeso', JSON.stringify(metas));
    atualizarMetasNaTela();
}

function atualizarMetasNaTela() {
    const metas = JSON.parse(localStorage.getItem('metasPeso'));
    if (metas) {
        document.getElementById('meta-semana').innerText = metas.semana + " kg";
        document.getElementById('meta-mes').innerText = metas.mes + " kg";
        document.getElementById('meta-final').innerText = metas.final + " kg";
    }
}

function atualizarMetasNaTela() {
    const metas = JSON.parse(localStorage.getItem('metasPeso'));
    const ultimoPeso = dadosPeso.length > 0 ? dadosPeso[dadosPeso.length - 1].valor : null;

    if (metas) {
        document.getElementById('meta-semana').innerText = metas.semana + " kg";
        document.getElementById('meta-mes').innerText = metas.mes + " kg";
        document.getElementById('meta-final').innerText = metas.final + " kg";
        
        if (ultimoPeso) {
            calcularRank(ultimoPeso, metas.final);
        }
    }
}

function calcularRank(atual, alvo) {
    const diff = Math.abs(atual - alvo);
    let rank = "";

    if (diff <= 0.5) rank = "🏆 Herói do Olimpo";
    else if (diff <= 2) rank = "⚔️ Veterano";
    else if (diff <= 5) rank = "🛡️ Guerreiro";
    else rank = "🌑 Recruta";

    document.getElementById('status-rank').innerText = rank;
}