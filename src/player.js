import Gameboard from "./gameboard.js";

export default class Player {
    constructor(isComputer = false) {
        this.isComputer = isComputer;
        this.gameboard = new Gameboard();
    }   

    attack(enemyBoard, coordinates) {
        return enemyBoard.receiveAttack(coordinates);
    }

    randomAttack(enemyBoard) {
        let x, y;
        let result;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            result = enemyBoard.receiveAttack([x, y]);
        } while (!result);
        return [x,y];
    }
}
