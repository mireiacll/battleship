    import Ship from '../src/ship.js';

    describe('Ship', () => {
    test('creates a ship with a given length', () => {
        const ship = new Ship(3);
        expect(ship.length).toBe(3);
    });

    test('ship is not sunk initially', () => {
        const ship = new Ship(3);
        expect(ship.isSunk()).toBe(false);
    });

    test('hit() increases the number of hits', () => {
        const ship = new Ship(3);
        ship.hit();
        expect(ship.hits).toBe(1);
    });

    test('ship is sunk when hits equal its length', () => {
        const ship = new Ship(2);
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });
    });