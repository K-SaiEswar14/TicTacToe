const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const resetBtn = document.getElementById('reset-btn');
const xScoreEl = document.getElementById('x-score');
const oScoreEl = document.getElementById('o-score');
const drawScoreEl = document.getElementById('draw-score');

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, D: 0 };

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + cls;
}

function checkWinner() {
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: [a, b, c] };
    }
  }
  if (board.every(cell => cell !== '')) return { winner: 'Draw', combo: [] };
  return null;
}

function handleClick(e) {
  const idx = +e.target.dataset.index;
  if (gameOver || board[idx]) return;

  board[idx] = currentPlayer;
  const cell = cells[idx];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase(), 'taken');

  const result = checkWinner();
  if (result) {
    gameOver = true;
    if (result.winner === 'Draw') {
      scores.D++;
      drawScoreEl.textContent = scores.D;
      setStatus("It's a Draw!", 'draw');
    } else {
      scores[result.winner]++;
      (result.winner === 'X' ? xScoreEl : oScoreEl).textContent = scores[result.winner];
      result.combo.forEach(i => cells[i].classList.add('win-cell'));
      setStatus(`Player ${result.winner} Wins! 🎉`, 'win');
    }
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  setStatus(`Player ${currentPlayer}'s Turn`, currentPlayer === 'X' ? 'x-turn' : 'o-turn');
}

function restartGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  setStatus("Player X's Turn", 'x-turn');
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  xScoreEl.textContent = 0;
  oScoreEl.textContent = 0;
  drawScoreEl.textContent = 0;
  restartGame();
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', resetScores);

setStatus("Player X's Turn", 'x-turn');
