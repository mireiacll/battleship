import createGame from './gameController.js';
import { renderBoard, updateStatus } from './dom.js';

let game = createGame();

const playerBoardDiv = document.getElementById('player-board');
const computerBoardDiv = document.getElementById('computer-board');
const randomizeBtn = document.getElementById('randomize-btn');
const restartBtn = document.getElementById('restart-btn');

function render() {
  renderBoard(game.player.gameboard, playerBoardDiv, true);
  renderBoard(game.computer.gameboard, computerBoardDiv, false);
}

function handlePlayerTurn(event) {
  if (!event.target.classList.contains('cell')) return;

  const x = Number(event.target.dataset.x);
  const y = Number(event.target.dataset.y);

  try {
    game.playTurn([x, y]);
    render();

    if (game.isGameOver()) {
      updateStatus('🎉 You win!');
      computerBoardDiv.removeEventListener('click', handlePlayerTurn);
      return;
    }

    updateStatus("Computer's turn...");
    setTimeout(handleComputerTurn, 500);
  } catch (error) {
    updateStatus('Invalid move. Try again.');
  }
}

function handleComputerTurn() {
  game.playTurn();
  render();

  if (game.isGameOver()) {
    updateStatus('💻 Computer wins!');
    computerBoardDiv.removeEventListener('click', handlePlayerTurn);
    return;
  }

  updateStatus('Your turn!');
}

// Event listener for attacking the computer board
computerBoardDiv.addEventListener('click', handlePlayerTurn);

// Randomize Player Ships
if (randomizeBtn) {
  randomizeBtn.addEventListener('click', () => {
    game.randomizePlayerShips();
    render();
    updateStatus('🔄 Player ships randomized!');
  });
}

// 🔄 Restart the Game
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    game = createGame();
    render();
    updateStatus('New game started! Your turn.');

    // Reattach event listener after restart
    computerBoardDiv.addEventListener('click', handlePlayerTurn);
  });
}

// Initial render
render();
updateStatus('Your turn! Attack the enemy board.');