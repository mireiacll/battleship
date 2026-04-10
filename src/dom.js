export function renderBoard(gameboard, container, showShips = false) {
  container.innerHTML = '';

  gameboard.board.forEach((row, x) => {
    row.forEach((cell, y) => {
      const div = document.createElement('div');
      div.classList.add('cell');
      div.dataset.x = x;
      div.dataset.y = y;

      // Use 'has-ship' to avoid collision with shipyard .ship CSS class
      if (cell !== null && showShips) {
        div.classList.add('has-ship');
      }

      const isHit  = gameboard.hits.some(([hx, hy]) => hx === x && hy === y);
      const isMiss = gameboard.missedAttacks.some(([mx, my]) => mx === x && my === y);

      if (isHit)       div.classList.add('hit');
      else if (isMiss) div.classList.add('miss');

      container.appendChild(div);
    });
  });
}

export function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}