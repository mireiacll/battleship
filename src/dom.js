export function renderBoard(board, container, showShips = false) {
  container.innerHTML = '';

  board.board.forEach((row, x) => {
    row.forEach((cell, y) => {
      const div = document.createElement('div');
      div.classList.add('cell');
      div.dataset.x = x;
      div.dataset.y = y;

      // Show ships on the player's board
      if (cell && showShips) {
        div.classList.add('ship');
      }

      // Check if this coordinate is a hit
      const isHit = board.hits.some(
        ([hx, hy]) => hx === x && hy === y
      );

      // Check if this coordinate is a miss
      const isMiss = board.missedAttacks.some(
        ([mx, my]) => mx === x && my === y
      );

      if (isHit) {
        div.classList.add('hit');
      } else if (isMiss) {
        div.classList.add('miss');
      }

      container.appendChild(div);
    });
  });
}

export function updateStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
}