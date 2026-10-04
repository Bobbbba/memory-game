(function () {
    'use strict'

    const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍑', '🍍', '🥥', '🍋', '🍊', '🥭'];
    const PAIRS_COUNT = 8;
    const FLIP_BACk_DELAY = 900;
    const STORAGE_KEY = 'memory_game_leaderboard'


    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    const state = {
        deck: [],
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        moves: 0,
        matchedPairs: 0,
        totalPairs: PAIRS_COUNT,
    };

    let boardEl, movesEl, pairsEl, modalOverlay, modalContent, leaderboardOverlay;

    function buildUl() {
        const app = el('div', 'app');

        const header = el('header', 'header');
        const title = el('h1', null, 'Memory Game')
        
        const headerButtons = el('div', 'header-buttons');
        const newGameBtn = el('button', 'btn', 'Hовая игра');
        newGameBtn.type = 'button';
        newGameBtn.addEventListener('click', startGame);

        const leaderboardBtn = el('button', 'btn btn-secondary', 'Таблица лидеров');
        leaderboardBtn.type = 'button';
        leaderboardBtn.addEventListener('click', openLeaderboard);


        headerButtons.appendChild(newGameBtn);
        header.appendChild(title);
        header.appendChild(headerButtons)


        const stats = el('div', 'stats');

        const movesStat = el('div', 'stat');
        const movesLabel = el('div', 'stat-label', 'Ходы')
        movesEl = el('div', 'stat-value', '0')
        movesStat.appendChild(movesLabel);
        movesStat.appendChild(movesEl)

        const pairsStat = el('div', 'stat');
        const pairsLabel = el('div', 'stat-label', 'Найдено пар');
        pairsEl = el('div', 'stat-value', '0 /' + state.totalPairs);
        pairsStat.appendChild(pairsLabel);
        pairsStat.appendChild(pairsEl)


        stats.appendChild(movesStat);
        stats.appendChild(pairsStat);




     }   

})