import Player from '../src/player.js';
import Gameboard from '../src/gameboard.js';
import Ship from '../src/ship.js';

describe('Player', () => {
  test('creates a human player by default', () => {
    const player = new Player();
    expect(player.isComputer).toBe(false);
  });

  test('creates a computer player when specified', () => {
    const player = new Player(true);
    expect(player.isComputer).toBe(true);
  });

  test('player has a gameboard', () => {
    const player = new Player();
    expect(player.gameboard).toBeDefined();
  });
});

describe('Player Attacks', () => {
  test('player can attack an enemy gameboard', () => {
    const player = new Player();
    const enemyBoard = new Gameboard();
    const ship = new Ship(1);

    enemyBoard.placeShip(ship, [0, 0]);
    player.attack(enemyBoard, [0, 0]);

    expect(ship.hits).toBe(1);
  });

  test('computer makes a valid random attack', () => {
    const computer = new Player(true);
    const enemyBoard = new Gameboard();

    computer.randomAttack(enemyBoard);

    const totalAttacks =
      enemyBoard.missedAttacks.length +
      enemyBoard.ships.reduce((sum, ship) => sum + ship.hits, 0);

    expect(totalAttacks).toBe(1);
  });

  test('computer does not attack the same coordinate twice', () => {
    const computer = new Player(true);
    const enemyBoard = new Gameboard();

    const attacked = new Set();

    for (let i = 0; i < 20; i++) {
      computer.randomAttack(enemyBoard);
      enemyBoard.attackedCoordinates.forEach(coord =>
        attacked.add(coord)
      );
    }

    expect(attacked.size).toBe(20);
  });
});