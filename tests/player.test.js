import Player from '../src/player.js';

describe('Player', () => {
    test('creates a human player', () => {
        const player = new Player();
        expect(player.isComputer).toBe(false);
    });
    test('creates a computer player', () => {
        const player = new Player(true);
        expect(player.isComputer).toBe(true);
    });

    test('player has a gameboard', () => {
        const player = new Player();
        expect(player.gameboard).toBeDefined();
    });
});