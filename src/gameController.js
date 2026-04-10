import Player from './player.js';
import Ship from './ship.js';

export default function createGame(mode = 'vsComputer') {
  const player1 = new Player(false, 'Player 1');
  const player2 = mode === 'vsComputer' 
    ? new Player(true, 'Computer')
    : new Player(false, 'Player 2');

  let currentPlayer = player1;
  const gameMode = mode;

  function placeShipsRandomly(gameboard) {
    const shipLengths = [5, 4, 3, 3, 2];

    shipLengths.forEach((length) => {
      let placed = false;

      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const ship = new Ship(length);

        try {
          gameboard.placeShip(ship, [x, y], direction);
          placed = true;
        } catch {
          // Retry until placement is valid
        }
      }
    });
  }

  // Only the computer gets ships at initialization in vs Computer mode
  if (mode === 'vsComputer') {
    placeShipsRandomly(player2.gameboard);
  }

  function randomizePlayerShips(playerNum = 1) {
    const player = playerNum === 1 ? player1 : player2;
    player.gameboard.resetBoard();
    placeShipsRandomly(player.gameboard);
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function getOpponent() {
    return currentPlayer === player1 ? player2 : player1;
  }

  function switchTurn() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  }

  function playTurn(coordinates) {
    if (isGameOver()) return 'Game Over';

    const opponent = getOpponent();
    let result;

    if (currentPlayer.isComputer) {
      result = currentPlayer.randomAttack(opponent.gameboard);
    } else {
      result = currentPlayer.attack(opponent.gameboard, coordinates);
    }

    if (!isGameOver()) {
      switchTurn();
    }

    return result;
  }

  function isGameOver() {
    return (
      player1.gameboard.allShipsSunk() ||
      player2.gameboard.allShipsSunk()
    );
  }

  function getWinner() {
    if (player1.gameboard.allShipsSunk()) return player2;
    if (player2.gameboard.allShipsSunk()) return player1;
    return null;
  }

  function placePlayerShip(length, coordinates, direction, playerNum = 1) {
    const player = playerNum === 1 ? player1 : player2;
    const ship = new Ship(length);
    player.gameboard.placeShip(ship, coordinates, direction);
  }

  return {
    player1,
    player2,
    playTurn,
    getCurrentPlayer,
    getOpponent,
    isGameOver,
    getWinner,
    randomizePlayerShips,
    placePlayerShip,
    gameMode,
  };
}