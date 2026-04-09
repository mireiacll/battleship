import Gameboard from '../src/gameboard.js';
import Ship from '../src/ship.js';

describe('Gameboard', () => {
  test('places a ship on the board', () => {
    const board = new Gameboard();
    const ship = new Ship(2);

    board.placeShip(ship, [0, 0], 'horizontal');

    expect(board.ships.length).toBe(1);
  });

  test('receives a hit attack', () => {
    const board = new Gameboard();
    const ship = new Ship(1);

    board.placeShip(ship, [0, 0]);
    board.receiveAttack([0, 0]);

    expect(ship.hits).toBe(1);
  });

  test('records missed attacks', () => {
    const board = new Gameboard();
    board.receiveAttack([5, 5]);

    expect(board.missedAttacks).toContainEqual([5, 5]);
  });

  test('reports when all ships are sunk', () => {
    const board = new Gameboard();
    const ship = new Ship(1);

    board.placeShip(ship, [0, 0]);
    board.receiveAttack([0, 0]);

    expect(board.allShipsSunk()).toBe(true);
  });
});