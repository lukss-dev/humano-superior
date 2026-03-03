let totalAgua = 0;
const metaDiaria = 4000; // 3 Litros em ml

// Carregar progresso salvo
window.onload = () => {
    const salvo = localStorage.getItem('aguaConsumida');
    if (salvo) {
        totalAgua = parseInt(salvo);
        atualizarInterface();
    }
};

function adicionarAgua(quantidade) {
    totalAgua += quantidade;
    
    // Feedback de conquista se atingir a meta
    if (totalAgua >= metaDiaria && (totalAgua - quantidade) < metaDiaria) {
        alert("🔱 Poseidon está satisfeito! Sua essência está plena.");
    }

    localStorage.setItem('aguaConsumida', totalAgua);
    atualizarInterface();
}

function atualizarInterface() {
    const porcentagem = Math.min((totalAgua / metaDiaria) * 100, 100);
    
    document.getElementById('agua-nivel').style.height = porcentagem + "%";
    document.getElementById('porcentagem').innerText = Math.floor(porcentagem) + "%";
    
    // Mudar a cor do texto se bater a meta
    if (porcentagem >= 100) {
        document.getElementById('porcentagem').style.color = "var(--ouro)";
    }
}

function resetarFonte() {
    if(confirm("Deseja esvaziar o altar para um novo dia?")) {
        totalAgua = 0;
        localStorage.setItem('aguaConsumida', 0);
        atualizarInterface();
    }
}