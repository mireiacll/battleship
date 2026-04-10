import Gameboard from './gameboard.js';

export default class Player {
  constructor(isComputer = false, name = 'Player') {
    this.isComputer = isComputer;
    this.name = name;
    this.gameboard = new Gameboard();
    this.previousMoves = new Set();
    
    // Smart AI tracking
    this.hitQueue = []; // Coordinates adjacent to hits that need to be checked
    this.currentHits = []; // Track hits for the current ship being targeted
  }

  attack(enemyBoard, coordinates) {
    return enemyBoard.receiveAttack(coordinates);
  }

  randomAttack(enemyBoard) {
    if (!this.isComputer) {
      throw new Error('Only computer players can make random attacks.');
    }

    let x, y, key;

    // TARGET MODE: If we have hits to follow up on, attack adjacent cells
    if (this.hitQueue.length > 0) {
      const target = this.hitQueue.shift();
      x = target[0];
      y = target[1];
      key = `${x},${y}`;
      
      // If already attacked, try next in queue
      if (this.previousMoves.has(key)) {
        return this.randomAttack(enemyBoard); // Recursively try next target
      }
    } else {
      // HUNT MODE: Random attack
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
        key = `${x},${y}`;
      } while (this.previousMoves.has(key));
    }

    this.previousMoves.add(key);
    const result = enemyBoard.receiveAttack([x, y]);

    // If we got a hit, add adjacent cells to the queue
    if (result === 'hit') {
      this.currentHits.push([x, y]);
      this.addAdjacentTargets(x, y);
      
      // Check if we just sank a ship
      const shipAtLocation = enemyBoard.board[x][y];
      if (shipAtLocation && shipAtLocation.isSunk()) {
        // Ship sunk! Clear the queue and current hits
        this.hitQueue = [];
        this.currentHits = [];
      }
    }

    return result;
  }

  addAdjacentTargets(x, y) {
    // Add all 4 adjacent cells (up, down, left, right) to the hit queue
    const directions = [
      [x - 1, y], // up
      [x + 1, y], // down
      [x, y - 1], // left
      [x, y + 1]  // right
    ];

    directions.forEach(([nx, ny]) => {
      // Check if in bounds and not already attacked
      if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
        const key = `${nx},${ny}`;
        if (!this.previousMoves.has(key)) {
          // Avoid duplicates in queue
          const alreadyQueued = this.hitQueue.some(([qx, qy]) => qx === nx && qy === ny);
          if (!alreadyQueued) {
            this.hitQueue.push([nx, ny]);
          }
        }
      }
    });
  }
}