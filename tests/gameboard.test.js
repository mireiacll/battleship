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

  test('prevents ships from being placed out of bounds horizontally', () => {
    const board = new Gameboard();
    const ship = new Ship(4);

    expect(() => {
        board.placeShip(ship, [0, 8], 'horizontal');
    }).toThrow('Ship placement out of bounds');
    });

    test('prevents ships from being placed out of bounds vertically', () => {
    const board = new Gameboard();
    const ship = new Ship(4);

    expect(() => {
        board.placeShip(ship, [8, 0], 'vertical');
    }).toThrow('Ship placement out of bounds');
    });

    test('prevents overlapping ships', () => {
    const board = new Gameboard();
    const ship1 = new Ship(3);
    const ship2 = new Ship(2);

    board.placeShip(ship1, [0, 0], 'horizontal');

    expect(() => {
        board.placeShip(ship2, [0, 1], 'horizontal');
    }).toThrow('Ships cannot overlap');
    });

    test('prevents attacking the same coordinate twice', () => {
    const board = new Gameboard();
    const ship = new Ship(1);

    board.placeShip(ship, [0, 0]);
    board.receiveAttack([0, 0]);

    expect(() => {
        board.receiveAttack([0, 0]);
    }).toThrow('Coordinate already attacked');
    });
});