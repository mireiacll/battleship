export default class Gameboard {
  constructor() {
    this.size = 10;
    this.ships = [];
    this.missedAttacks = [];
    this.board = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null)
    );
    this.attackedCoordinates = new Set();
  }

  placeShip(ship, start, direction = 'horizontal') {
    const [x, y] = start;
    const positions = [];

    for (let i = 0; i < ship.length; i++) {
      const newX = direction === 'vertical' ? x + i : x;
      const newY = direction === 'horizontal' ? y + i : y;

      // Check bounds
      if (
        newX < 0 ||
        newX >= this.size ||
        newY < 0 ||
        newY >= this.size
      ) {
        throw new Error('Ship placement out of bounds');
      }

      // Check overlap
      if (this.board[newX][newY] !== null) {
        throw new Error('Ships cannot overlap');
      }

      positions.push([newX, newY]);
    }

    // Place ship
    positions.forEach(([row, col]) => {
      this.board[row][col] = ship;
    });

    this.ships.push(ship);
  }

  receiveAttack([x, y]) {
    const key = `${x},${y}`;

    // Prevent duplicate attacks
    if (this.attackedCoordinates.has(key)) {
      throw new Error('Coordinate already attacked');
    }

    this.attackedCoordinates.add(key);

    const target = this.board[x][y];

    if (target) {
      target.hit();
      return 'hit';
    } else {
      this.missedAttacks.push([x, y]);
      return 'miss';
    }
  }

  allShipsSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}