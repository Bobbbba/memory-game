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
        headerButtons.appendChild(leaderboardBtn);
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



        boardEl = el('div', 'game-board');

        app.appendChild(header);
        app.appendChild(stats);
        app.appendChild(boardEl);
        document.body.appendChild(app);

        //    Оверлей победы

        modalOverlay = el('div', 'modal-overlay hidden');
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) closeModal();
        });

        modalContent = el('div', 'modal');
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        //    Оверлей таблица лидеров

        leaderboardOverlay = el('div', 'modal-overlay hidden');
        leaderboardOverlay.addEventListener('click', function (e) {
            if (e.target === leaderboardOverlay) closeLeaderboard();
        });
        document.body.appendChild(leaderboardOverlay)



        // алгоритм Фишера–Йетса

        function shuffle(array) {
            const arr = array.slice();
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function createDeck() {
            const selected = shuffle(EMOJIS).slice(0, state.totalPairs);
            const cards = selected.concat(selected).map(function (emoji) {
                return { emoji: emoji, id: Math.random().toString(36).slice(2) };
            })
            return shuffle(cards);
        }

        // запуск новой игры

        function startNewGame() {
            closeModal();
            closeLeaderboard();
            state.firstCard = null;
            state.secondCard = null;
            state.lockBoard = false;
            state.moves = 0;
            state.matchedPairs = 0;


            updateStats();
            clear(boardEl);
            state.deck = createDeck();


            const columns = Math.ceil(Math.sqrt(state.deck.length));
            boardEl.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(60px, 110px))';

            state.deck.forEach(function (cardData) {
            boardEl.appendChild(createCardElement(cardData))
            })

            function createCardElement(cardData) {
                const card = el('div', 'card');
                card.dataset.id = cardData.id;
                card.dataset.emoji = cardData.emoji;


                const inner = el('div', 'card-inner');
                const back = el('div', 'card-face card-back');
                const front = el('div', 'card-face card-front', cardData.emoji);

                inner.appendChild(back);
                inner.appendChild(front);
                card.appendChild(inner);

                card.addEventListener('click', function () {
                    handleCardClick(card);
                })
                return card;
            }

            // создание карточки
        }




        function init() {
            buildUl();
            startNewGame();
        }


     }   

})