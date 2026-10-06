(function () {
  'use strict';

  // ---------- Константы ----------
  const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍑', '🍍', '🥥', '🍋', '🍊', '🥭'];
  const PAIRS_COUNT = 8; // 8 пар = 16 карточек (поле 4x4)
  const FLIP_BACK_DELAY = 900;
  const STORAGE_KEY = 'memory_game_leaderboard';

  // ---------- Утилиты DOM ----------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    }
    
    // ---------- Фабрика модальных окон ----------
  function createModal() {
    const overlay = el('div', 'modal-overlay hidden');
    const content = el('div', 'modal');
    overlay.appendChild(content);

    function close() {
      overlay.classList.add('hidden');
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    function open(buildContent) {
      clear(content);
      buildContent(content, close);
      overlay.classList.remove('hidden');
    }

    document.body.appendChild(overlay);

    return { open: open, close: close, content: content };
  }


  // ---------- Состояние игры ----------
  const state = {
    deck: [],
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    moves: 0,
    matchedPairs: 0,
    totalPairs: PAIRS_COUNT,
  };

  // ---------- DOM-ссылки (создаются динамически) ----------
  let boardEl, movesEl, pairsEl;
  let winModal, leaderboardModal;

  // ---------- Построение интерфейса ----------
  function buildUI() {
    const app = el('div', 'app');

    // --- Header ---
    const header = el('header', 'header');
    const title = el('h1', null, '🧠 Memory Game');

    const headerButtons = el('div', 'header-buttons');
    const newGameBtn = el('button', 'btn', 'Новая игра');
    newGameBtn.type = 'button';
    newGameBtn.addEventListener('click', startNewGame);

    const leaderboardBtn = el('button', 'btn btn-secondary', 'Таблица лидеров');
    leaderboardBtn.type = 'button';
    leaderboardBtn.addEventListener('click', openLeaderboard);

    headerButtons.appendChild(newGameBtn);
    headerButtons.appendChild(leaderboardBtn);
    header.appendChild(title);
    header.appendChild(headerButtons);

    // --- Stats ---
    const stats = el('div', 'stats');

    const movesStat = el('div', 'stat');
    const movesLabel = el('div', 'stat-label', 'Ходы');
    movesEl = el('div', 'stat-value', '0');
    movesStat.appendChild(movesLabel);
    movesStat.appendChild(movesEl);

    const pairsStat = el('div', 'stat');
    const pairsLabel = el('div', 'stat-label', 'Найдено пар');
    pairsEl = el('div', 'stat-value', '0 / ' + state.totalPairs);
    pairsStat.appendChild(pairsLabel);
    pairsStat.appendChild(pairsEl);

    stats.appendChild(movesStat);
    stats.appendChild(pairsStat);

    // --- Board ---
    boardEl = el('div', 'game-board');

    app.appendChild(header);
    app.appendChild(stats);
    app.appendChild(boardEl);
    document.body.appendChild(app);

    
      
       winModal = createModal();
       leaderboardModal = createModal();
  }

  // ---------- Логика игры ----------
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
    });
    return shuffle(cards);
  }

  function startNewGame() {
    if (winModal) winModal.close();
    if (leaderboardModal) leaderboardModal.close();
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
      boardEl.appendChild(createCardElement(cardData));
    });
  }

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
    });

    return card;
  }

  function handleCardClick(card) {
    if (state.lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!state.firstCard) {
      state.firstCard = card;
      return;
    }

    state.secondCard = card;
    state.moves++;
    updateStats();
    checkMatch();
  }

  function checkMatch() {
    const first = state.firstCard;
    const second = state.secondCard;
    const isMatch = first.dataset.emoji === second.dataset.emoji;

    if (isMatch) {
      first.classList.add('matched');
      second.classList.add('matched');
      state.matchedPairs++;
      updateStats();
      resetSelection();

      if (state.matchedPairs === state.totalPairs) {
        setTimeout(showWinModal, 500);
      }
    } else {
      state.lockBoard = true;
      setTimeout(function () {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
        resetSelection();
      }, FLIP_BACK_DELAY);
    }
    }
    
    function resetSelection() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = false;
}

function updateStats() {
  movesEl.textContent = String(state.moves);
  pairsEl.textContent = state.matchedPairs + ' / ' + state.totalPairs;
    }
    
   function showWinModal() {
  saveResult(state.moves);

  winModal.open(function (content, close) {
    content.appendChild(el('h2', null, '🎉 Победа!'));
    content.appendChild(el('p', null, 'Вы нашли все пары!'));
    content.appendChild(el('div', 'modal-highlight', 'Ходов: ' + state.moves));

    const btnWrap = el('div', 'header-buttons');
    btnWrap.style.justifyContent = 'center';

    const againBtn = el('button', 'btn', 'Играть снова');
    againBtn.type = 'button';
    againBtn.addEventListener('click', function () {
      close();
      startNewGame();
    });

    const boardBtn = el('button', 'btn btn-secondary', 'Таблица лидеров');
    boardBtn.type = 'button';
    boardBtn.addEventListener('click', function () {
      close();
      openLeaderboard(true);
    });

    btnWrap.appendChild(againBtn);
    btnWrap.appendChild(boardBtn);
    content.appendChild(btnWrap);
  });
}

    function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

function saveResult(moves) {
  const results = getLeaderboard();
  results.push({ moves: moves, date: new Date().toISOString() });
  results.sort(function (a, b) { return a.moves - b.moves; });
  const top = results.slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  } catch (e) {
    // localStorage может быть недоступен (приватный режим, переполнение)
  }
    }
    
    function openLeaderboard(fromWin) {
  leaderboardModal.open(function (content, close) {
    content.appendChild(el('h2', null, '🏆 Таблица лидеров'));

    const results = getLeaderboard();

    if (results.length === 0) {
      content.appendChild(el('p', 'leaderboard-empty', 'Пока нет результатов. Сыграйте первую игру!'));
    } else {
      const list = el('ul', 'leaderboard-list');
      results.forEach(function (item, index) {
        const li = el('li');

        const left = el('span');
        left.appendChild(el('span', 'rank', '#' + (index + 1)));
        left.appendChild(document.createTextNode('Игра'));

        const moves = el('span', 'moves', item.moves + ' ходов');

        li.appendChild(left);
        li.appendChild(moves);
        list.appendChild(li);
      });
      content.appendChild(list);
    }

    const btnWrap = el('div', 'header-buttons');
    btnWrap.style.justifyContent = 'center';

    const closeBtn = el('button', 'btn', 'Закрыть');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', close);
    btnWrap.appendChild(closeBtn);

    if (fromWin) {
      const againBtn = el('button', 'btn btn-secondary', 'Новая игра');
      againBtn.type = 'button';
      againBtn.addEventListener('click', function () {
        close();
        startNewGame();
      });
      btnWrap.appendChild(againBtn);
    }

    content.appendChild(btnWrap);
  });
}
    
    
    function init() {
  buildUI();
  startNewGame();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
  
})();