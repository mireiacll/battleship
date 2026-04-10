import createGame from '../src/gameController.js';

describe('Game Controller', () => {
  test('initializes two players', () => {
    const game = createGame();

    expect(game.player).toBeDefined();
    expect(game.computer).toBeDefined();
  });

  test('sets the human player to start first', () => {
    const game = createGame();
    expect(game.getCurrentPlayer()).toBe(game.player);
  });

  test('switches turns after a valid move', () => {
    const game = createGame();

    game.playTurn([0, 0]);
    expect(game.getCurrentPlayer()).toBe(game.computer);
  });

  test('detects when the game is over', () => {
    const game = createGame();

    // Sink all computer ships
    game.computer.gameboard.ships.forEach(ship => {
      for (let i = 0; i < ship.length; i++) {
        ship.hit();
      }
    });

    expect(game.isGameOver()).toBe(true);
  });
});