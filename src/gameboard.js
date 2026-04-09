export default class Gameboard {
    constructor() {
        this.ships = [];
        this.missedAttacks = [];
        this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    }

    placeShip(ship, start, direction = 'horizontal') {
        const [x, y] = start;
        for (let i = 0; i < ship.length; i++) {
            if (direction === 'horizontal') {
                this.board[x][y + i] = ship;
            } else {
                this.board[x + i][y] = ship;
            }
        }
        this.ships.push(ship);
    }

    receiveAttack([x,y]) {
        const target = this.board[x][y];
        if (target) {
            target.hit();
            return 'hit';
        } else {
            this.missedAttacks.push([x,y]);
            return 'miss';
        }
    }

    allShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
    }   
}