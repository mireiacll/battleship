import createGame from './gameController.js';
import { renderBoard, updateStatus } from './dom.js';

const game = createGame();

const playerBoardDiv = document.getElementById('player-board');
const computerBoardDiv = document.getElementById('computer-board');

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
    return;
  }

  updateStatus('Your turn!');
}

computerBoardDiv.addEventListener('click', handlePlayerTurn);

render();
updateStatus('Your turn! Attack the enemy board.');