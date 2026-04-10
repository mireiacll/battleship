import createGame from './gameController.js';
import { renderBoard, updateStatus } from './dom.js';

let game = createGame();
let selectedShip = null; // the shipyard <div> element currently selected
let direction = 'horizontal';
let gameStarted = false;

// Map<shipElement -> { x, y, dir, length }>
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

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  renderBoard(game.player.gameboard, playerBoardDiv, true);
  renderBoard(game.computer.gameboard, computerBoardDiv, false);

  // Make placed ship cells draggable so they can be moved directly
  if (!gameStarted) {
    playerBoardDiv.querySelectorAll('.cell.has-ship').forEach(cell => {
      cell.setAttribute('draggable', 'true');
    });
  }
}

function rebuildPlayerBoard() {
  game.player.gameboard.resetBoard();
  shipPlacements.forEach(({ x, y, dir, length, randomized }) => {
    if (!randomized) game.placePlayerShip(length, [x, y], dir);
  });
}

function updatePlacementStatus() {
  const n = shipPlacements.size;
  updateStatus(n === totalShips
    ? 'All ships placed! Click "Start Game".'
    : `Place your ships. (${n}/${totalShips})`);
}

// ── Board selection highlight ─────────────────────────────────────────────────
function clearBoardSelection() {
  playerBoardDiv.querySelectorAll('.board-selected').forEach(c =>
    c.classList.remove('board-selected')
  );
}

function highlightShipCells(placement) {
  clearBoardSelection();
  if (!placement || placement.randomized) return;
  const { x, y, dir, length } = placement;
  for (let i = 0; i < length; i++) {
    const nx = dir === 'vertical'   ? x + i : x;
    const ny = dir === 'horizontal' ? y + i : y;
    const cell = playerBoardDiv.querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
    if (cell) cell.classList.add('board-selected');
  }
}

// ── Find which ship element owns a board cell ─────────────────────────────────
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

// ── Click a ship cell on the board → select it (stays on board) ───────────────
playerBoardDiv.addEventListener('click', (e) => {
  if (gameStarted) return;
  const cell = e.target.closest('.cell');
  if (!cell) return;

  if (!cell.classList.contains('has-ship')) {
    // Clicked empty water → deselect
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

  // Select this ship (keep it on the board, just highlight)
  allShipEls.forEach(s => s.classList.remove('selected'));
  selectedShip = shipEl;
  const placement = shipPlacements.get(shipEl);
  direction = placement.dir;
  highlightShipCells(placement);

  updateStatus('Ship selected — drag to move it, or click Rotate to rotate in place.');
});

// ── Drag a ship directly from the board ───────────────────────────────────────
playerBoardDiv.addEventListener('dragstart', (e) => {
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

  // Highlight which ship is being dragged
  highlightShipCells(placement);

  e.dataTransfer.effectAllowed = 'move';
  // Note: we do NOT rebuild the board here — we do it on drop
  // so the drag image stays visible during the drag
});

// ── Rotate ────────────────────────────────────────────────────────────────────
rotateBtn.addEventListener('click', () => {
  if (!selectedShip) {
    updateStatus('Click a ship first to select it.');
    return;
  }

  const placement = shipPlacements.get(selectedShip);

  if (placement && !placement.randomized) {
    // Ship is on the board → rotate in place
    const newDir = placement.dir === 'horizontal' ? 'vertical' : 'horizontal';
    const { x, y, length } = placement;

    shipPlacements.delete(selectedShip);
    rebuildPlayerBoard();

    try {
      game.placePlayerShip(length, [x, y], newDir);
      shipPlacements.set(selectedShip, { x, y, dir: newDir, length });
      direction = newDir;
      render();
      highlightShipCells({ x, y, dir: newDir, length });
      updateStatus('Rotated! Drag to move, or click another ship.');
    } catch {
      // Not enough room — restore original
      shipPlacements.set(selectedShip, placement);
      rebuildPlayerBoard();
      render();
      highlightShipCells(placement);
      updateStatus("Not enough space to rotate here — move the ship first.");
    }
  } else {
    // Ship is in the shipyard (not yet placed)
    direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
    selectedShip.classList.toggle('vertical');
  }
});

// ── Drag-over preview ─────────────────────────────────────────────────────────
function clearHighlights() {
  playerBoardDiv.querySelectorAll('.preview-valid, .preview-invalid').forEach(c =>
    c.classList.remove('preview-valid', 'preview-invalid')
  );
}

playerBoardDiv.addEventListener('dragover', (e) => {
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

  // Occupancy excluding the ship being moved
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
    const c = playerBoardDiv.querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
    if (c) c.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
  });
});

playerBoardDiv.addEventListener('dragleave', (e) => {
  if (!playerBoardDiv.contains(e.relatedTarget)) clearHighlights();
});

// ── Drop ──────────────────────────────────────────────────────────────────────
playerBoardDiv.addEventListener('drop', (e) => {
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
    game.placePlayerShip(length, [x, y], direction);
    shipPlacements.set(selectedShip, { x, y, dir: direction, length });

    // Hide from shipyard (in case it came from there)
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

// ── Randomize ─────────────────────────────────────────────────────────────────
randomizeBtn.addEventListener('click', () => {
  game.randomizePlayerShips();
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
  game.player.gameboard.resetBoard();
  shipPlacements.clear();
  selectedShip = null;
  direction = 'horizontal';
  allShipEls.forEach(s =>
    s.classList.remove('placed', 'selected', 'vertical', 'dragging')
  );
  clearBoardSelection();
  render();
  updateStatus('Ships reset. Drag your ships onto the board.');
});

// ── Start ─────────────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (shipPlacements.size < totalShips) {
    updateStatus(`Place all ${totalShips} ships first! (${shipPlacements.size}/${totalShips})`);
    return;
  }
  gameStarted = true;
  startBtn.disabled     = true;
  randomizeBtn.disabled = true;
  resetBtn.disabled     = true;
  rotateBtn.disabled    = true;
  newGameBtn.disabled   = false;
  clearBoardSelection();
  updateStatus('Game started! Click an enemy cell to attack.');
});

// ── Attack ────────────────────────────────────────────────────────────────────
computerBoardDiv.addEventListener('click', (e) => {
  if (!gameStarted) return;
  const cell = e.target.closest('.cell');
  if (!cell) return;

  try {
    game.playTurn([Number(cell.dataset.x), Number(cell.dataset.y)]);
    render();
    if (game.isGameOver()) { updateStatus('🎉 You win! Click "New Game" to play again.'); return; }

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
  } catch {
    updateStatus('Already attacked here — pick another cell.');
  }
});

// ── New Game ──────────────────────────────────────────────────────────────────
newGameBtn.addEventListener('click', () => location.reload());

// ── Init ──────────────────────────────────────────────────────────────────────
render();
updateStatus('Drag ships onto your board, or click "Randomize Ships".');