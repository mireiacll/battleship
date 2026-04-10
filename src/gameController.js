import Player from './player.js';
import Ship from './ship.js';

export default function createGame() {
  const player = new Player(false);
  const computer = new Player(true);

  let currentPlayer = player;

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

  // Only the computer gets ships at initialization
  placeShipsRandomly(computer.gameboard);

  function randomizePlayerShips() {
    player.gameboard.resetBoard();
    placeShipsRandomly(player.gameboard);
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function switchTurn() {
    currentPlayer = currentPlayer === player ? computer : player;
  }

  function playTurn(coordinates) {
    if (isGameOver()) return 'Game Over';

    let result;

    if (currentPlayer === player) {
      result = player.attack(computer.gameboard, coordinates);
    } else {
      result = computer.randomAttack(player.gameboard);
    }

    if (!isGameOver()) {
      switchTurn();
    }

    return result;
  }

  function isGameOver() {
    return (
      player.gameboard.allShipsSunk() ||
      computer.gameboard.allShipsSunk()
    );
  }

  function placePlayerShip(length, coordinates, direction) {
    const ship = new Ship(length);
    player.gameboard.placeShip(ship, coordinates, direction);
  }

  return {
    player,
    computer,
    playTurn,
    getCurrentPlayer,
    isGameOver,
    randomizePlayerShips,
    placePlayerShip,
  };
}