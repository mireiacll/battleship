import createGame from './gameController.js';
import { renderBoard, updateStatus } from './dom.js';

let game = null;
let gameMode = null; // 'vsComputer' or 'vsPlayer'
let selectedShip = null;
let direction = 'horizontal';
let gameStarted = false;
let currentSetupPlayer = 1; // Which player is currently placing ships (1 or 2)

const shipPlacements = new Map();
const totalShips = 5;

const playerBoardDiv   = document.getElementById('player-board');
const computerBoardDiv = document.getElementById('computer-board');
const allShipEls       = Array.from(document.querySelectorAll('#shipyard .ship'));

const rotateBtn    = document.getElementById('rotate-btn');
const startBtn     = document.getElementById('start-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const resetBtn     = document.getElementById('reset-btn');
const newGameBtn   = document.getElementById('new-game-btn');

// Mode selection elements
const modeSelection = document.getElementById('mode-selection');
const vsComputerBtn = document.getElementById('vs-computer-btn');
const vsPlayerBtn   = document.getElementById('vs-player-btn');

// Pass device overlay
const passDeviceOverlay = document.getElementById('pass-device-overlay');
const passDeviceText    = document.getElementById('pass-device-text');
let continueBtn       = document.getElementById('continue-btn');

// ── Mode Selection ────────────────────────────────────────────────────────────
vsComputerBtn.addEventListener('click', () => {
  gameMode = 'vsComputer';
  startGame();
});

vsPlayerBtn.addEventListener('click', () => {
  gameMode = 'vsPlayer';
  startGame();
});

function startGame() {
  game = createGame(gameMode);
  modeSelection.style.display = 'none';
  document.querySelector('.controls').style.display = 'block';
  document.querySelector('#shipyard').style.display = 'block';
  document.querySelector('.game-container').style.display = 'flex';
  document.querySelector('#status').style.display = 'block';
  
  if (gameMode === 'vsPlayer') {
    updateBoardLabels('Player 1', 'Player 2');
    updateStatus('Player 1: Drag ships onto your board, or click "Randomize Ships".');
  } else {
    updateBoardLabels('Player', 'Computer');
    updateStatus('Drag ships onto your board, or click "Randomize Ships".');
  }
  
  render();
}

function updateBoardLabels(player1Label, player2Label) {
  document.querySelector('.board-container:nth-child(1) h2').textContent = `${player1Label} Board`;
  document.querySelector('.board-container:nth-child(2) h2').textContent = `${player2Label} Board`;
}

// ── Pass Device Screen ────────────────────────────────────────────────────────
function showPassDevice(playerName, callback) {
  passDeviceText.textContent = `Pass device to ${playerName}`;
  passDeviceOverlay.style.display = 'flex';
  
  // Remove old listeners and add new one
  const newBtn = continueBtn.cloneNode(true);
  continueBtn.parentNode.replaceChild(newBtn, continueBtn);
  continueBtn = document.getElementById('continue-btn');
  
  continueBtn.addEventListener('click', () => {
    passDeviceOverlay.style.display = 'none';
    if (callback) callback();
  }, { once: true });
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  if (gameMode === 'vsComputer') {
    renderBoard(game.player1.gameboard, playerBoardDiv, true);
    renderBoard(game.player2.gameboard, computerBoardDiv, false);
  } else if (gameMode === 'vsPlayer') {
    if (!gameStarted) {
      // During setup, show ships for the player currently placing
      if (currentSetupPlayer === 1) {
        renderBoard(game.player1.gameboard, playerBoardDiv, true);
        renderBoard(game.player2.gameboard, computerBoardDiv, false);
      } else {
        renderBoard(game.player1.gameboard, playerBoardDiv, false);
        renderBoard(game.player2.gameboard, computerBoardDiv, true);
      }
    } else {
      // During gameplay, show ships only for current player
      const currentPlayer = game.getCurrentPlayer();
      if (currentPlayer === game.player1) {
        renderBoard(game.player1.gameboard, playerBoardDiv, true);
        renderBoard(game.player2.gameboard, computerBoardDiv, false);
      } else {
        renderBoard(game.player1.gameboard, playerBoardDiv, false);
        renderBoard(game.player2.gameboard, computerBoardDiv, true);
      }
    }
  }

  if (!gameStarted) {
    const targetBoard = currentSetupPlayer === 1 ? playerBoardDiv : computerBoardDiv;
    targetBoard.querySelectorAll('.cell.has-ship').forEach(cell => {
      cell.setAttribute('draggable', 'true');
    });
  }
}

function rebuildPlayerBoard() {
  const player = currentSetupPlayer === 1 ? game.player1 : game.player2;
  player.gameboard.resetBoard();
  shipPlacements.forEach(({ x, y, dir, length, randomized }) => {
    if (!randomized) game.placePlayerShip(length, [x, y], dir, currentSetupPlayer);
  });
}

function updatePlacementStatus() {
  const n = shipPlacements.size;
  const playerName = gameMode === 'vsPlayer' ? `Player ${currentSetupPlayer}` : 'You';
  updateStatus(n === totalShips
    ? `All ships placed! Click "Start Game".`
    : `${playerName}: Place your ships. (${n}/${totalShips})`);
}

// ── Board selection highlight ─────────────────────────────────────────────────
function clearBoardSelection() {
  playerBoardDiv.querySelectorAll('.board-selected').forEach(c =>
    c.classList.remove('board-selected')
  );
  computerBoardDiv.querySelectorAll('.board-selected').forEach(c =>
    c.classList.remove('board-selected')
  );
}

function highlightShipCells(placement, boardDiv) {
  clearBoardSelection();
  if (!placement || placement.randomized) return;
  const { x, y, dir, length } = placement;
  for (let i = 0; i < length; i++) {
    const nx = dir === 'vertical'   ? x + i : x;
    const ny = dir === 'horizontal' ? y + i : y;
    const cell = boardDiv.querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
    if (cell) cell.classList.add('board-selected');
  }
}

function findShipAtCell(x, y) {
  for (const [shipEl, placement] of shipPlacements) {
    if (placement.randomized) continue;
    const { x: px, y: py, dir, length } = placement;
    for (let i = 0; i < length; i++) {
      const nx = dir === 'vertical'   ? px + i : px;
      const ny = dir === 'horizontal' ? py + i : py;
      if (nx === x && ny === y) return shipEl;
    }
  }
  return null;
}

// ── Get active board for current setup player ─────────────────────────────────
function getActiveBoard() {
  return currentSetupPlayer === 1 ? playerBoardDiv : computerBoardDiv;
}

// ── Shipyard ship drag & click ────────────────────────────────────────────────
allShipEls.forEach((ship) => {
  ship.addEventListener('click', () => {
    allShipEls.forEach(s => s.classList.remove('selected'));
    clearBoardSelection();
    selectedShip = ship;
    ship.classList.add('selected');
    direction = ship.classList.contains('vertical') ? 'vertical' : 'horizontal';
  });

  ship.addEventListener('dragstart', (e) => {
    allShipEls.forEach(s => s.classList.remove('selected'));
    clearBoardSelection();
    selectedShip = ship;
    direction = ship.classList.contains('vertical') ? 'vertical' : 'horizontal';
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => ship.classList.add('dragging'), 0);
  });

  ship.addEventListener('dragend', () => ship.classList.remove('dragging'));
});

// ── Board interaction (both boards for 2-player setup) ────────────────────────
function setupBoardInteraction(boardDiv) {
  boardDiv.addEventListener('click', (e) => {
    if (gameStarted) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;

    if (!cell.classList.contains('has-ship')) {
      clearBoardSelection();
      allShipEls.forEach(s => s.classList.remove('selected'));
      if (selectedShip && shipPlacements.has(selectedShip)) selectedShip = null;
      updatePlacementStatus();
      return;
    }

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const shipEl = findShipAtCell(x, y);
    if (!shipEl) return;

    allShipEls.forEach(s => s.classList.remove('selected'));
    selectedShip = shipEl;
    const placement = shipPlacements.get(shipEl);
    direction = placement.dir;
    highlightShipCells(placement, boardDiv);

    updateStatus('Ship selected — drag to move it, or click Rotate to rotate in place.');
  });

  boardDiv.addEventListener('dragstart', (e) => {
    if (gameStarted) return;
    const cell = e.target.closest('.cell.has-ship');
    if (!cell) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const shipEl = findShipAtCell(x, y);
    if (!shipEl) return;

    const placement = shipPlacements.get(shipEl);
    selectedShip = shipEl;
    direction = placement.dir;
    highlightShipCells(placement, boardDiv);
    e.dataTransfer.effectAllowed = 'move';
  });

  boardDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!selectedShip || gameStarted) return;

    const cell = e.target.closest('.cell');
    if (!cell) return;
    clearHighlights();

    const x      = Number(cell.dataset.x);
    const y      = Number(cell.dataset.y);
    const length = Number(selectedShip.dataset.length);

    const positions = [];
    for (let i = 0; i < length; i++) {
      const nx = direction === 'vertical'   ? x + i : x;
      const ny = direction === 'horizontal' ? y + i : y;
      if (nx >= 10 || ny >= 10) return;
      positions.push([nx, ny]);
    }

    const occupied = Array.from({ length: 10 }, () => Array(10).fill(false));
    shipPlacements.forEach((p, shipEl) => {
      if (shipEl === selectedShip || p.randomized) return;
      const { x: px, y: py, dir, length: len } = p;
      for (let i = 0; i < len; i++) {
        const nx = dir === 'vertical'   ? px + i : px;
        const ny = dir === 'horizontal' ? py + i : py;
        occupied[nx][ny] = true;
      }
    });

    const isValid = positions.every(([nx, ny]) => !occupied[nx][ny]);
    positions.forEach(([nx, ny]) => {
      const c = boardDiv.querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
      if (c) c.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
    });
  });

  boardDiv.addEventListener('dragleave', (e) => {
    if (!boardDiv.contains(e.relatedTarget)) clearHighlights();
  });

  boardDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    clearHighlights();
    clearBoardSelection();
    if (!selectedShip || gameStarted) return;

    const cell = e.target.closest('.cell');
    if (!cell) return;

    const x      = Number(cell.dataset.x);
    const y      = Number(cell.dataset.y);
    const length = Number(selectedShip.dataset.length);

    const prevPlacement = shipPlacements.get(selectedShip);
    shipPlacements.delete(selectedShip);
    rebuildPlayerBoard();

    try {
      game.placePlayerShip(length, [x, y], direction, currentSetupPlayer);
      shipPlacements.set(selectedShip, { x, y, dir: direction, length });

      selectedShip.classList.add('placed');
      selectedShip.classList.remove('selected');
      selectedShip = null;

      render();
      updatePlacementStatus();
    } catch {
      if (prevPlacement) shipPlacements.set(selectedShip, prevPlacement);
      rebuildPlayerBoard();
      render();
      updateStatus('Invalid placement — out of bounds or overlapping.');
    }
  });
}

setupBoardInteraction(playerBoardDiv);
setupBoardInteraction(computerBoardDiv);

function clearHighlights() {
  playerBoardDiv.querySelectorAll('.preview-valid, .preview-invalid').forEach(c =>
    c.classList.remove('preview-valid', 'preview-invalid')
  );
  computerBoardDiv.querySelectorAll('.preview-valid, .preview-invalid').forEach(c =>
    c.classList.remove('preview-valid', 'preview-invalid')
  );
}

// ── Rotate ────────────────────────────────────────────────────────────────────
rotateBtn.addEventListener('click', () => {
  if (!selectedShip) {
    updateStatus('Click a ship first to select it.');
    return;
  }

  const placement = shipPlacements.get(selectedShip);
  const activeBoard = getActiveBoard();

  if (placement && !placement.randomized) {
    const newDir = placement.dir === 'horizontal' ? 'vertical' : 'horizontal';
    const { x, y, length } = placement;

    shipPlacements.delete(selectedShip);
    rebuildPlayerBoard();

    try {
      game.placePlayerShip(length, [x, y], newDir, currentSetupPlayer);
      shipPlacements.set(selectedShip, { x, y, dir: newDir, length });
      direction = newDir;
      render();
      highlightShipCells({ x, y, dir: newDir, length }, activeBoard);
      updateStatus('Rotated! Drag to move, or click another ship.');
    } catch {
      shipPlacements.set(selectedShip, placement);
      rebuildPlayerBoard();
      render();
      highlightShipCells(placement, activeBoard);
      updateStatus("Not enough space to rotate here — move the ship first.");
    }
  } else {
    direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
    selectedShip.classList.toggle('vertical');
  }
});

// ── Randomize ─────────────────────────────────────────────────────────────────
randomizeBtn.addEventListener('click', () => {
  game.randomizePlayerShips(currentSetupPlayer);
  shipPlacements.clear();
  allShipEls.forEach(s => {
    s.classList.remove('selected', 'vertical', 'dragging');
    s.classList.add('placed');
    shipPlacements.set(s, { randomized: true });
  });
  selectedShip = null;
  direction = 'horizontal';
  clearBoardSelection();
  render();
  updateStatus('Ships randomized! Click "Start Game".');
});

// ── Reset Ships ───────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  const player = currentSetupPlayer === 1 ? game.player1 : game.player2;
  player.gameboard.resetBoard();
  shipPlacements.clear();
  selectedShip = null;
  direction = 'horizontal';
  allShipEls.forEach(s =>
    s.classList.remove('placed', 'selected', 'vertical', 'dragging')
  );
  clearBoardSelection();
  render();
  const playerName = gameMode === 'vsPlayer' ? `Player ${currentSetupPlayer}` : '';
  updateStatus(`${playerName} Ships reset. Drag your ships onto the board.`);
});

// ── Start ─────────────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (shipPlacements.size < totalShips) {
    updateStatus(`Place all ${totalShips} ships first! (${shipPlacements.size}/${totalShips})`);
    return;
  }
  
  if (gameMode === 'vsPlayer' && currentSetupPlayer === 1) {
    // Player 1 done, now Player 2's turn
    currentSetupPlayer = 2;
    shipPlacements.clear();
    allShipEls.forEach(s =>
      s.classList.remove('placed', 'selected', 'vertical', 'dragging')
    );
    selectedShip = null;
    direction = 'horizontal';
    
    showPassDevice('Player 2', () => {
      render();
      updateStatus('Player 2: Drag ships onto your board, or click "Randomize Ships".');
    });
    return;
  }
  
  // All players ready - start the game
  gameStarted = true;
  startBtn.disabled     = true;
  randomizeBtn.disabled = true;
  resetBtn.disabled     = true;
  rotateBtn.disabled    = true;
  newGameBtn.disabled   = false;
  clearBoardSelection();
  
  if (gameMode === 'vsPlayer') {
    showPassDevice('Player 1', () => {
      render();
      updateStatus('Player 1: Click an enemy cell to attack.');
    });
  } else {
    render();
    updateStatus('Game started! Click an enemy cell to attack.');
  }
});

// ── Attack ────────────────────────────────────────────────────────────────────
function handleAttack(boardDiv, e) {
  if (!gameStarted) return;
  const cell = e.target.closest('.cell');
  if (!cell) return;

  const currentPlayer = game.getCurrentPlayer();
  const opponent = game.getOpponent();
  
  // In 2-player mode, ensure they're clicking the opponent's board
  if (gameMode === 'vsPlayer') {
    if (currentPlayer === game.player1 && boardDiv === playerBoardDiv) {
      updateStatus('Click on Player 2\'s board to attack!');
      return;
    }
    if (currentPlayer === game.player2 && boardDiv === computerBoardDiv) {
      updateStatus('Click on Player 1\'s board to attack!');
      return;
    }
  }

  try {
    game.playTurn([Number(cell.dataset.x), Number(cell.dataset.y)]);
    render();
    
    if (game.isGameOver()) {
      const winner = game.getWinner();
      updateStatus(`🎉 ${winner.name} wins! Click "New Game" to play again.`);
      return;
    }

    if (gameMode === 'vsComputer') {
      updateStatus("Computer's turn...");
      computerBoardDiv.style.pointerEvents = 'none';
      setTimeout(() => {
        game.playTurn();
        render();
        computerBoardDiv.style.pointerEvents = '';
        updateStatus(game.isGameOver()
          ? '💻 Computer wins! Click "New Game" to play again.'
          : 'Your turn! Click an enemy cell.');
      }, 600);
    } else {
      // 2-player mode - show pass device screen
      const nextPlayer = game.getCurrentPlayer();
      showPassDevice(nextPlayer.name, () => {
        render();
        updateStatus(`${nextPlayer.name}: Click an enemy cell to attack.`);
      });
    }
  } catch {
    updateStatus('Already attacked here — pick another cell.');
  }
}

playerBoardDiv.addEventListener('click', (e) => handleAttack(playerBoardDiv, e));
computerBoardDiv.addEventListener('click', (e) => handleAttack(computerBoardDiv, e));

// ── New Game ──────────────────────────────────────────────────────────────────
newGameBtn.addEventListener('click', () => location.reload());

// ── Init ──────────────────────────────────────────────────────────────────────
// Start with mode selection visible
modeSelection.style.display = 'flex';
document.querySelector('.controls').style.display = 'none';
document.querySelector('#shipyard').style.display = 'none';
document.querySelector('.game-container').style.display = 'none';
document.querySelector('#status').style.display = 'none';