import Gameboard from './gameboard.js';

export default class Player {
  constructor(isComputer = false) {
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
    this.previousMoves = new Set();
  }

  attack(enemyBoard, coordinates) {
    return enemyBoard.receiveAttack(coordinates);
  }

  randomAttack(enemyBoard) {
    if (!this.isComputer) {
      throw new Error('Only computer players can make random attacks.');
    }

    let x, y, key;

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      key = `${x},${y}`;
    } while (this.previousMoves.has(key));

    this.previousMoves.add(key);
    return enemyBoard.receiveAttack([x, y]);
  }
}