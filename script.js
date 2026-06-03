/* ============================================================
   TIC TAC TOE — Full Game Logic
   Features: PvP / AI modes, Minimax AI, Score tracker,
             Sound effects (Web Audio), Win/Draw animations,
             Player name input, Difficulty levels
   ============================================================ */

// ─── STATE ───────────────────────────────────────────────────
let gameMode    = 'pvp';      // 'pvp' | 'ai'
let aiDiff      = 'hard';     // 'easy' | 'medium' | 'hard'
let nameX       = 'Player X';
let nameO       = 'Player O';
let board       = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = 'X';
let gameActive  = false;
let scores      = { X: 0, O: 0, D: 0 };
let soundOn     = true;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

// ─── AUDIO (Web Audio API — no files needed) ─────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx;
function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playSound(type) {
  if (!soundOn) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain); gain.connect(ac.destination);

  if (type === 'place') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    osc.start(); osc.stop(ac.currentTime + 0.15);
  } else if (type === 'win') {
    [0, 0.12, 0.25].forEach((t, i) => {
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o2.connect(g2); g2.connect(ac.destination);
      o2.type = 'triangle';
      o2.frequency.setValueAtTime([523, 659, 784][i], ac.currentTime + t);
      g2.gain.setValueAtTime(0.2, ac.currentTime + t);
      g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.25);
      o2.start(ac.currentTime + t); o2.stop(ac.currentTime + t + 0.3);
    });
  } else if (type === 'draw') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.start(); osc.stop(ac.currentTime + 0.3);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ac.currentTime);
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
    osc.start(); osc.stop(ac.currentTime + 0.06);
  }
}

// ─── SETUP SCREEN ────────────────────────────────────────────
function selectMode(mode) {
  gameMode = mode;
  document.getElementById('pvpBtn').classList.toggle('active', mode === 'pvp');
  document.getElementById('aiBtn').classList.toggle('active', mode === 'ai');
  document.getElementById('nameOGroup').style.display    = mode === 'pvp' ? '' : 'none';
  document.getElementById('difficultySection').style.display = mode === 'ai' ? '' : 'none';
  if (mode === 'ai') {
    document.getElementById('nameO').value = 'Computer';
  }
  playSound('click');
}

function selectDiff(btn, diff) {
  aiDiff = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  playSound('click');
}

function startGame() {
  nameX = document.getElementById('nameX').value.trim() || 'Player X';
  nameO = gameMode === 'ai' ? 'Computer' : (document.getElementById('nameO').value.trim() || 'Player O');

  scores = { X: 0, O: 0, D: 0 };
  updateScoreUI();

  document.getElementById('scoreNameX').textContent = nameX;
  document.getElementById('scoreNameO').textContent = nameO;

  // Transition screens
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  playSound('click');
  resetBoard();
}

function goHome() {
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  gameActive = false;
  playSound('click');
}

function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
  playSound('click');
}

// ─── BOARD LOGIC ─────────────────────────────────────────────
function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;

  document.getElementById('resultOverlay').classList.add('hidden');
  document.getElementById('board').classList.remove('disabled');

  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById('c' + i);
    cell.textContent = '';
    cell.className = 'cell';
    cell.onclick = () => handleClick(i);
  }
  updateTurnIndicator();
  updateActiveScore();

  // If AI goes first (O) — doesn't apply here since X always starts
}

function handleClick(idx) {
  if (!gameActive || board[idx]) return;
  placeMarker(idx, currentPlayer);

  const result = checkResult();
  if (result) { endGame(result); return; }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  updateActiveScore();

  if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
    document.getElementById('board').classList.add('disabled');
    setTimeout(aiMove, 420);
  }
}

function placeMarker(idx, player) {
  board[idx] = player;
  const cell = document.getElementById('c' + idx);
  cell.textContent = player === 'X' ? '✕' : '○';
  cell.classList.add(player.toLowerCase(), 'taken');
  cell.onclick = null;
  playSound('place');
}

function updateTurnIndicator() {
  const name = currentPlayer === 'X' ? nameX : nameO;
  const sym  = currentPlayer === 'X' ? '✕' : '○';
  const el   = document.getElementById('turnIndicator');
  el.innerHTML = `<span>${sym} ${name}'s turn</span>`;
  el.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
  el.style.borderColor = currentPlayer === 'X' ? 'rgba(255,77,109,0.3)' : 'rgba(76,201,240,0.3)';
  el.style.background  = currentPlayer === 'X' ? 'rgba(255,77,109,0.06)' : 'rgba(76,201,240,0.06)';
}

function updateActiveScore() {
  document.querySelectorAll('.score-box').forEach(b => b.classList.remove('active-turn'));
  const cls = currentPlayer === 'X' ? '.x-box' : '.o-box';
  document.querySelector(cls).classList.add('active-turn');
}

// ─── RESULT CHECK ────────────────────────────────────────────
function checkResult() {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { type: 'win', player: board[a], line };
    }
  }
  if (board.every(c => c !== null)) return { type: 'draw' };
  return null;
}

function endGame(result) {
  gameActive = false;
  document.getElementById('board').classList.add('disabled');

  if (result.type === 'win') {
    const winCells = result.line;
    winCells.forEach(i => document.getElementById('c'+i).classList.add('winner'));

    scores[result.player]++;
    updateScoreUI();

    const winnerName = result.player === 'X' ? nameX : nameO;
    showResult(
      result.player === 'X' ? '🎉' : '🎊',
      `${winnerName} Wins!`,
      `${result.player === 'X' ? '✕' : '○'} dominates the grid`,
      result.player === 'X' ? 'x-win' : 'o-win'
    );
    playSound('win');
    setTimeout(() => spawnConfetti(result.player), 200);
  } else {
    for (let i = 0; i < 9; i++) document.getElementById('c'+i).classList.add('draw-end');
    scores.D++;
    updateScoreUI();
    showResult('🤝', "It's a Draw!", 'Great minds think alike', 'draw');
    playSound('draw');
  }
}

function showResult(emoji, text, sub, cls) {
  document.getElementById('resultEmoji').textContent = emoji;
  const rt = document.getElementById('resultText');
  rt.textContent = text;
  rt.className = 'result-text ' + cls;
  document.getElementById('resultSub').textContent = sub;
  document.getElementById('resultOverlay').classList.remove('hidden');
}

function updateScoreUI() {
  document.getElementById('scoreX').textContent = scores.X;
  document.getElementById('scoreO').textContent = scores.O;
  document.getElementById('scoreD').textContent = scores.D;
}

// ─── CONFETTI ────────────────────────────────────────────────
function spawnConfetti(player) {
  const colors = player === 'X'
    ? ['#ff4d6d','#ff85a2','#ff0040','#ffd6e0']
    : ['#4cc9f0','#74d7f5','#00b4d8','#90e0ef'];

  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);

  for (let i = 0; i < 52; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left: ${Math.random()*100}vw;
      width: ${6+Math.random()*10}px;
      height: ${8+Math.random()*14}px;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      border-radius: ${Math.random()>0.5?'50%':'2px'};
      animation-duration: ${1.2+Math.random()*1.6}s;
      animation-delay: ${Math.random()*0.6}s;
      transform: rotate(${Math.random()*360}deg);
    `;
    wrap.appendChild(p);
  }
  setTimeout(() => wrap.remove(), 3500);
}

// ─── AI ENGINE ───────────────────────────────────────────────
function aiMove() {
  document.getElementById('board').classList.remove('disabled');
  let idx;

  if (aiDiff === 'easy') {
    idx = randomMove();
  } else if (aiDiff === 'medium') {
    // 60% smart, 40% random
    idx = Math.random() < 0.6 ? bestMove() : randomMove();
  } else {
    // hard = full minimax
    idx = bestMove();
  }

  if (idx === null || idx === undefined) return;

  placeMarker(idx, 'O');

  const result = checkResult();
  if (result) { endGame(result); return; }

  currentPlayer = 'X';
  updateTurnIndicator();
  updateActiveScore();
}

function randomMove() {
  const empty = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
  return empty[Math.floor(Math.random()*empty.length)];
}

function bestMove() {
  let bestScore = -Infinity, bestIdx = null;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = 'O';
    const score = minimax(board, 0, false, -Infinity, Infinity);
    board[i] = null;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
}

function minimax(b, depth, isMax, alpha, beta) {
  const result = evalBoard(b);
  if (result !== null) return result - depth * (result > 0 ? 1 : -1);
  if (b.every(c=>c)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = 'O';
      best = Math.max(best, minimax(b, depth+1, false, alpha, beta));
      b[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = 'X';
      best = Math.min(best, minimax(b, depth+1, true, alpha, beta));
      b[i] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function evalBoard(b) {
  for (const [a,c,d] of WIN_LINES) {
    if (b[a] && b[a]===b[c] && b[a]===b[d]) {
      return b[a]==='O' ? 10 : -10;
    }
  }
  return null;
}

// ─── INIT ────────────────────────────────────────────────────
// Default mode is PvP on page load — no extra init needed.
// selectMode() called by buttons; startGame() transitions to game.
