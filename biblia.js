// O bibleData agora recebe os dados diretamente da variável global BIBLE_DATA
const bibleData = BIBLE_DATA;
const mainContent = document.getElementById('main-content');
const nav = document.getElementById('navigation');

// Inicia o app imediatamente
function init() {
    renderBooks();
    updateProgressBar();
}

function renderBooks() {
    mainContent.className = 'grid-container';
    nav.innerHTML = '<span onclick="renderBooks()">Bíblia</span>';
    mainContent.innerHTML = '';
    
    bibleData.forEach((book, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerText = book.name;
        div.onclick = () => renderChapters(index);
        mainContent.appendChild(div);
    });
}

function renderChapters(bookIndex) {
    const book = bibleData[bookIndex];
    nav.innerHTML = `<span onclick="renderBooks()">Bíblia</span> > ${book.name}`;
    mainContent.innerHTML = '';

    book.chapters.forEach((verses, index) => {
        const chapterNum = index + 1;
        const div = document.createElement('div');
        div.className = 'item';
        div.innerText = `Cap. ${chapterNum}`;
        div.onclick = () => renderVerses(bookIndex, chapterNum);
        mainContent.appendChild(div);
    });
}

function renderVerses(bookIndex, chapterNum) {
    const book = bibleData[bookIndex];
    const verses = book.chapters[chapterNum - 1];
    
    nav.innerHTML = `<span onclick="renderBooks()">Bíblia</span> > <span onclick="renderChapters(${bookIndex})">${book.name}</span> > Cap. ${chapterNum}`;
    mainContent.innerHTML = '';
    mainContent.className = 'grid-container grid-verses';

    verses.forEach((text, index) => {
        const verseNum = index + 1;
        const id = `${book.abbrev}-${chapterNum}-${verseNum}`;
        
        const div = document.createElement('div');
        div.className = 'item';
        if (localStorage.getItem(id)) div.classList.add('read');

        div.innerHTML = `<strong>${verseNum}</strong>`;
        
        div.onclick = () => {
            div.classList.toggle('read');
            if (div.classList.contains('read')) {
                localStorage.setItem(id, 'true');
            } else {
                localStorage.removeItem(id);
            }
            updateProgressBar();
        };
        mainContent.appendChild(div);
    });
}

function renderHistory() {
    nav.innerHTML = '<span onclick="renderBooks()">Bíblia</span> > Histórico';
    mainContent.innerHTML = '';
    mainContent.className = 'grid-container';

    let hasHistory = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('-')) {
            hasHistory = true;
            const parts = key.split('-');
            const div = document.createElement('div');
            div.className = 'item history-item';
            div.innerHTML = `<div><strong>${parts[0].toUpperCase()}</strong> ${parts[1]}:${parts[2]}</div><span>Lido ✓</span>`;
            div.onclick = () => {
                if(confirm("Remover do histórico?")) {
                    localStorage.removeItem(key);
                    renderHistory();
                    updateProgressBar();
                }
            };
            mainContent.appendChild(div);
        }
    }
    
    // Adiciona botão de limpar tudo se houver histórico
    if (hasHistory) {
        const btnClear = document.createElement('button');
        btnClear.className = 'btn-history';
        btnClear.style.backgroundColor = '#e74c3c';
        btnClear.innerText = '🗑️ Limpar Todo o Progresso';
        btnClear.onclick = () => {
            if(confirm("Tem certeza que deseja apagar TUDO?")) {
                localStorage.clear();
                renderHistory();
                updateProgressBar();
            }
        };
        mainContent.appendChild(btnClear);
    } else {
        mainContent.innerHTML = '<p>Nenhum versículo lido ainda.</p>';
    }
}

function updateProgressBar() {
    const totalVerses = 31102;
    let readCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('-')) readCount++;
    }
    const percentage = ((readCount / totalVerses) * 100).toFixed(2);
    
    const fill = document.getElementById('progress-fill');
    const percText = document.getElementById('progress-percentage');
    const countText = document.getElementById('progress-count');

    if(fill) fill.style.width = `${percentage}%`;
    if(percText) percText.innerText = `${percentage}%`;
    if(countText) countText.innerText = `${readCount} de ${totalVerses} versículos lidos`;
}

// Executa assim que abrir
init();