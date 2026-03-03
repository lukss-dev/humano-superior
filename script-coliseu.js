// Carregar missão salva ou padrão
window.onload = () => {
    const salva = JSON.parse(localStorage.getItem('missao_atual'));
    if (salva) {
        exibirMissao(salva);
    }
    carregarHistorico();
};

function toggleEditor() {
    document.getElementById('editor-missao').classList.toggle('hidden');
}

function salvarMissao() {
    const missao = {
        nome: document.getElementById('novo-nome').value,
        desc: document.getElementById('nova-desc').value,
        xp: document.getElementById('novo-xp').value
    };

    localStorage.setItem('missao_atual', JSON.stringify(missao));
    exibirMissao(missao);
    toggleEditor();
}

function exibirMissao(m) {
    document.getElementById('nome-missao').innerText = m.nome;
    document.getElementById('desc-missao').innerText = m.desc;
    document.getElementById('xp-valor').innerText = `+${m.xp} XP`;
}

function iniciarProva() {
    document.getElementById('btn-entrar').classList.add('hidden');
    document.getElementById('btn-vencer').classList.remove('hidden');
}

function reclamarGloria() {
    const m = JSON.parse(localStorage.getItem('missao_atual'));
    const vitoria = `Venceu: ${m.nome} (+${m.xp} XP)`;
    
    let historico = JSON.parse(localStorage.getItem('coliseu_vitorias')) || [];
    historico.push(vitoria);
    localStorage.setItem('coliseu_vitorias', JSON.stringify(historico));
    
    alert("🔥 GLÓRIA ALCANÇADA!");
    location.reload();
}

function carregarHistorico() {
    const lista = document.getElementById('lista-vitorias');
    const historico = JSON.parse(localStorage.getItem('coliseu_vitorias')) || [];
    lista.innerHTML = historico.reverse().map(v => `<li>🏆 ${v}</li>`).join('');
}