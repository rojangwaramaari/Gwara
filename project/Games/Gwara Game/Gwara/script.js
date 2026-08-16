/* =========================================================
   GWARA GAMES — script.js
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   Ambient neural-grid backdrop
--------------------------------------------------------- */
(function backdrop(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, nodes;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.max(24, Math.floor((w * h) / 55000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));
  }

  function step(){
    ctx.clearRect(0, 0, w, h);
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    }
    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 140){
          ctx.strokeStyle = `rgba(79,227,236,${(1 - dist / 140) * 0.10})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for(const n of nodes){
      ctx.fillStyle = 'rgba(155,107,255,0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  if(!reduceMotion){ requestAnimationFrame(step); }
  else { step(); }
})();

/* ---------------------------------------------------------
   Clock
--------------------------------------------------------- */
(function clock(){
  const el = document.getElementById('clock');
  function tick(){
    const d = new Date();
    el.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------------------------------------------------------
   View routing
--------------------------------------------------------- */
function showView(id){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + id);
  if(target){ target.classList.add('active'); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
}

document.querySelectorAll('[data-game]').forEach(card => {
  card.addEventListener('click', () => showView(card.dataset.game));
});
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showView('home'));
});
document.querySelector('.brand').addEventListener('click', () => showView('home'));

/* ---------------------------------------------------------
   Small helper: local storage best-scores
--------------------------------------------------------- */
const store = {
  get(key, fallback){
    try{ const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); } catch(e){ /* ignore */ }
  }
};

/* =========================================================
   1. LOVE CALCULATOR
   Classic "letter cancellation + digit folding" algorithm —
   deterministic, so the same two names always score the same.
   ========================================================= */
(function loveGame(){
  const form = document.getElementById('love-form');
  const nameA = document.getElementById('love-name-a');
  const nameB = document.getElementById('love-name-b');
  const scanBox = document.getElementById('love-scan');
  const resultBox = document.getElementById('love-result');
  const meterFill = document.getElementById('meter-fill');
  const meterPct = document.getElementById('meter-pct');
  const verdictTitle = document.getElementById('love-verdict-title');
  const verdictText = document.getElementById('love-verdict-text');
  const heartsField = document.getElementById('hearts-field');

  const CIRC = 2 * Math.PI * 74; // r=74
  meterFill.style.strokeDasharray = `${CIRC}`;
  meterFill.style.strokeDashoffset = `${CIRC}`;

  function cleanName(s){ return s.toLowerCase().replace(/[^a-z]/g, '').split(''); }

  function remainingCount(a, b){
    const bCopy = [...b];
    let remaining = 0;
    for(const ch of a){
      const idx = bCopy.indexOf(ch);
      if(idx > -1){ bCopy.splice(idx, 1); }
      else{ remaining++; }
    }
    return remaining;
  }

  function foldToPercent(digits){
    let d = digits.slice();
    if(d.length === 0) return 100;
    while(d.length > 2){
      const next = [];
      for(let i = 0; i < d.length - 1; i++){
        next.push((d[i] + d[i + 1]) % 10);
      }
      d = next;
    }
    if(d.length === 1) return d[0] * 11;
    return d[0] * 10 + d[1];
  }

  function loveScore(n1, n2){
    const a = cleanName(n1), b = cleanName(n2);
    if(a.length === 0 || b.length === 0) return 50;
    const remA = remainingCount(a, b);
    const remB = remainingCount(b, a);
    if(remA === 0 && remB === 0) return 100;
    const digitStr = `${remA}${remB}`;
    const digits = digitStr.split('').map(Number);
    let pct = foldToPercent(digits);
    pct = Math.max(4, Math.min(100, pct));
    return pct;
  }

  function verdictFor(pct){
    if(pct >= 90) return ['Off the charts', 'The core flags this as a rare, high-resonance match. Rooted in the letters, not the stars.'];
    if(pct >= 75) return ['Strong signal', 'A confident match — plenty of shared frequency to build on.'];
    if(pct >= 55) return ['Promising', 'A solid connection with real potential. Worth exploring further.'];
    if(pct >= 35) return ['Mixed reading', 'Some friction in the signal — not impossible, just needs more effort.'];
    return ['Low resonance', 'The letters don\u2019t line up much today. Could still beat the odds.'];
  }

  const scanSteps = [
    'Reading name A…',
    'Reading name B…',
    'Cross-referencing letter harmony…',
    'Folding compatibility digits…',
    'Result locked.'
  ];

  function runScan(cb){
    scanBox.innerHTML = '';
    let i = 0;
    function next(){
      if(i >= scanSteps.length){ cb(); return; }
      const line = document.createElement('span');
      line.className = 'scan-line' + (i === scanSteps.length - 1 ? ' done' : '');
      line.textContent = '> ' + scanSteps[i];
      line.style.animationDelay = '0s';
      scanBox.appendChild(line);
      i++;
      setTimeout(next, reduceMotion ? 0 : 260);
    }
    next();
  }

  function spawnHearts(count){
    if(reduceMotion) return;
    for(let i = 0; i < count; i++){
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = Math.random() > 0.5 ? '♥' : '♡';
        h.style.left = Math.random() * 100 + 'vw';
        h.style.fontSize = (0.9 + Math.random() * 1.1) + 'rem';
        h.style.animationDuration = (3.5 + Math.random() * 2.5) + 's';
        h.style.color = Math.random() > 0.5 ? '#ff5c8a' : '#ffb1c8';
        heartsField.appendChild(h);
        setTimeout(() => h.remove(), 6500);
      }, i * 90);
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const a = nameA.value.trim();
    const b = nameB.value.trim();
    if(!a || !b) return;

    resultBox.classList.remove('show');
    meterFill.style.transition = 'none';
    meterFill.style.strokeDashoffset = `${CIRC}`;

    runScan(() => {
      const pct = loveScore(a, b);
      const [title, text] = verdictFor(pct);

      verdictTitle.textContent = `${title} — ${a} & ${b}`;
      verdictText.textContent = text;

      resultBox.classList.add('show');

      requestAnimationFrame(() => {
        meterFill.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,.85,.35,1)';
        meterFill.style.strokeDashoffset = `${CIRC * (1 - pct / 100)}`;
      });

      let count = 0;
      const dur = reduceMotion ? 0 : 1200;
      const start = performance.now();
      function tick(t){
        const p = Math.min(1, (t - start) / (dur || 1));
        meterPct.textContent = Math.round(pct * p) + '%';
        if(p < 1 && !reduceMotion) requestAnimationFrame(tick);
        else meterPct.textContent = pct + '%';
      }
      requestAnimationFrame(tick);

      if(pct >= 55) spawnHearts(Math.round(8 + pct / 6));
    });
  });
})();

/* =========================================================
   2. ROCK · PAPER · SCISSORS — vs AI
   ========================================================= */
(function rpsGame(){
  const choices = { rock: '✊', paper: '✋', scissors: '✌️' };
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const youAvatar = document.getElementById('rps-you-avatar');
  const aiAvatar = document.getElementById('rps-ai-avatar');
  const resultEl = document.getElementById('rps-result');
  const scoreYou = document.getElementById('rps-score-you');
  const scoreAI = document.getElementById('rps-score-ai');
  const scoreTie = document.getElementById('rps-score-tie');
  const resetBtn = document.getElementById('rps-reset');

  let s = store.get('gg-rps', { you: 0, ai: 0, tie: 0 });
  renderScore();

  function renderScore(){
    scoreYou.textContent = s.you;
    scoreAI.textContent = s.ai;
    scoreTie.textContent = s.tie;
  }

  document.querySelectorAll('.rps-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const you = btn.dataset.choice;
      const ai = Object.keys(choices)[Math.floor(Math.random() * 3)];
      youAvatar.textContent = choices[you];
      aiAvatar.textContent = choices[ai];

      resultEl.classList.remove('win', 'lose');
      if(you === ai){
        resultEl.textContent = 'Draw — the core mirrored you.';
        s.tie++;
      } else if(beats[you] === ai){
        resultEl.textContent = `${cap(you)} beats ${ai}. You win.`;
        resultEl.classList.add('win');
        s.you++;
      } else {
        resultEl.textContent = `${cap(ai)} beats ${you}. AI wins.`;
        resultEl.classList.add('lose');
        s.ai++;
      }
      store.set('gg-rps', s);
      renderScore();
    });
  });

  resetBtn.addEventListener('click', () => {
    s = { you: 0, ai: 0, tie: 0 };
    store.set('gg-rps', s);
    renderScore();
    resultEl.textContent = 'Score reset.';
    resultEl.classList.remove('win', 'lose');
    youAvatar.textContent = '?';
    aiAvatar.textContent = '?';
  });

  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
})();

/* =========================================================
   3. TIC TAC TOE — unbeatable AI (minimax)
   ========================================================= */
(function tttGame(){
  const boardEl = document.getElementById('ttt-board');
  const statusEl = document.getElementById('ttt-status');
  const resetBtn = document.getElementById('ttt-reset');
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  let board, over, cells;
  let record = store.get('gg-ttt', { you: 0, ai: 0, tie: 0 });

  function init(){
    board = Array(9).fill(null);
    over = false;
    boardEl.innerHTML = '';
    cells = [];
    for(let i = 0; i < 9; i++){
      const c = document.createElement('button');
      c.className = 'ttt-cell';
      c.addEventListener('click', () => humanMove(i));
      boardEl.appendChild(c);
      cells.push(c);
    }
    setStatus('Your move — you are X.');
  }

  function setStatus(msg){
    statusEl.innerHTML = `<span class="big">Record</span>You ${record.you} · AI ${record.ai} · Draws ${record.tie}<br><br>${msg}`;
  }

  function humanMove(i){
    if(over || board[i]) return;
    board[i] = 'X';
    render();
    if(checkEnd()) return;
    setStatus('AI is thinking…');
    setTimeout(() => {
      const move = bestMove();
      if(move > -1) board[move] = 'O';
      render();
      checkEnd();
    }, reduceMotion ? 0 : 380);
  }

  function render(){
    board.forEach((v, i) => {
      cells[i].textContent = v || '';
      cells[i].className = 'ttt-cell' + (v === 'O' ? ' o' : '');
      cells[i].disabled = !!v || over;
    });
  }

  function winner(b){
    for(const [a,b2,c] of lines){
      if(b[a] && b[a] === b[b2] && b[a] === b[c]) return { player: b[a], line: [a,b2,c] };
    }
    if(b.every(v => v)) return { player: 'draw', line: [] };
    return null;
  }

  function checkEnd(){
    const w = winner(board);
    if(!w) { setStatus('Your move — you are X.'); return false; }
    over = true;
    if(w.player === 'draw'){
      record.tie++;
      setStatus('Draw. The core held the line.');
    } else {
      w.line.forEach(i => cells[i].classList.add('win'));
      if(w.player === 'X'){ record.you++; setStatus('You win. The core did not see that coming.'); }
      else { record.ai++; setStatus('AI wins this round.'); }
    }
    store.set('gg-ttt', record);
    render();
    return true;
  }

  function bestMove(){
    let best = -Infinity, move = -1;
    for(let i = 0; i < 9; i++){
      if(!board[i]){
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;
        if(score > best){ best = score; move = i; }
      }
    }
    return move;
  }

  function minimax(b, depth, isMax){
    const w = winner(b);
    if(w){
      if(w.player === 'O') return 10 - depth;
      if(w.player === 'X') return depth - 10;
      return 0;
    }
    if(isMax){
      let best = -Infinity;
      for(let i = 0; i < 9; i++){
        if(!b[i]){ b[i] = 'O'; best = Math.max(best, minimax(b, depth + 1, false)); b[i] = null; }
      }
      return best;
    } else {
      let best = Infinity;
      for(let i = 0; i < 9; i++){
        if(!b[i]){ b[i] = 'X'; best = Math.min(best, minimax(b, depth + 1, true)); b[i] = null; }
      }
      return best;
    }
  }

  resetBtn.addEventListener('click', init);
  init();
})();

/* =========================================================
   4. GUESS THE NUMBER
   ========================================================= */
(function guessGame(){
  const input = document.getElementById('guess-input');
  const submitBtn = document.getElementById('guess-submit');
  const hint = document.getElementById('guess-hint');
  const history = document.getElementById('guess-history');
  const resetBtn = document.getElementById('guess-reset');
  const bestEl = document.getElementById('guess-best');

  let target, tries, over;
  let best = store.get('gg-guess-best', null);
  renderBest();

  function renderBest(){
    bestEl.innerHTML = best ? `Best: <b>${best}</b> tries` : `Best: <b>—</b>`;
  }

  function init(){
    target = Math.floor(Math.random() * 100) + 1;
    tries = 0;
    over = false;
    history.innerHTML = '';
    input.value = '';
    input.disabled = false;
    submitBtn.disabled = false;
    hint.textContent = 'The core picked a number between 1 and 100. Start guessing.';
    input.focus();
  }

  function guess(){
    if(over) return;
    const val = Number(input.value);
    if(!val || val < 1 || val > 100) { hint.textContent = 'Enter a whole number between 1 and 100.'; return; }
    tries++;
    const chip = document.createElement('span');
    chip.className = 'guess-chip';
    chip.textContent = val;

    if(val === target){
      hint.textContent = `Correct — ${target} in ${tries} ${tries === 1 ? 'try' : 'tries'}.`;
      chip.style.color = 'var(--green)';
      over = true;
      input.disabled = true;
      submitBtn.disabled = true;
      if(!best || tries < best){ best = tries; store.set('gg-guess-best', best); renderBest(); }
    } else if(val < target){
      chip.classList.add('lo');
      hint.textContent = 'Higher than that.';
    } else {
      chip.classList.add('hi');
      hint.textContent = 'Lower than that.';
    }
    history.appendChild(chip);
    input.value = '';
    input.focus();
  }

  submitBtn.addEventListener('click', guess);
  input.addEventListener('keydown', e => { if(e.key === 'Enter') guess(); });
  resetBtn.addEventListener('click', init);
  init();
})();

/* =========================================================
   5. MEMORY MATCH
   ========================================================= */
(function memoryGame(){
  const board = document.getElementById('memory-board');
  const movesEl = document.getElementById('memory-moves');
  const timeEl = document.getElementById('memory-time');
  const bestEl = document.getElementById('memory-best');
  const resetBtn = document.getElementById('memory-reset');
  const icons = ['◆','●','▲','■','✦','◈','⬡','☍'];

  let cards, flipped, matched, moves, timer, seconds, locked;
  let best = store.get('gg-memory-best', null);
  renderBest();

  function renderBest(){ bestEl.innerHTML = best ? `Best: <b>${best}</b> moves` : `Best: <b>—</b>`; }

  function init(){
    clearInterval(timer);
    seconds = 0; moves = 0; flipped = []; matched = 0; locked = false;
    movesEl.innerHTML = 'Moves: <b>0</b>';
    timeEl.innerHTML = 'Time: <b>0s</b>';
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    board.innerHTML = '';
    cards = deck.map((icon, i) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.innerHTML = `<div class="face back">?</div><div class="face front">${icon}</div>`;
      el.dataset.icon = icon;
      el.dataset.index = i;
      el.addEventListener('click', () => flip(el));
      board.appendChild(el);
      return el;
    });
    timer = setInterval(() => { seconds++; timeEl.innerHTML = `Time: <b>${seconds}s</b>`; }, 1000);
  }

  function flip(el){
    if(locked || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.classList.add('flipped');
    flipped.push(el);
    if(flipped.length === 2){
      moves++;
      movesEl.innerHTML = `Moves: <b>${moves}</b>`;
      locked = true;
      const [a, b] = flipped;
      if(a.dataset.icon === b.dataset.icon){
        a.classList.add('matched'); b.classList.add('matched');
        flipped = []; locked = false; matched++;
        if(matched === icons.length) finish();
      } else {
        setTimeout(() => {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          flipped = []; locked = false;
        }, reduceMotion ? 300 : 700);
      }
    }
  }

  function finish(){
    clearInterval(timer);
    if(!best || moves < best){ best = moves; store.set('gg-memory-best', best); renderBest(); }
    movesEl.innerHTML = `Moves: <b>${moves}</b> — cleared in ${seconds}s`;
  }

  resetBtn.addEventListener('click', init);
  init();
})();

/* =========================================================
   6. REFLEX TEST
   ========================================================= */
(function reflexGame(){
  const pad = document.getElementById('reflex-pad');
  const padBig = pad.querySelector('.big');
  const padSmall = pad.querySelector('.small');
  const lastEl = document.getElementById('reflex-last');
  const bestEl = document.getElementById('reflex-best');
  const avgEl = document.getElementById('reflex-avg');

  let state = 'idle'; // idle -> waiting -> ready -> done
  let timeoutId, startTime;
  let scores = store.get('gg-reflex-scores', []);
  renderStats();

  function renderStats(){
    const best = scores.length ? Math.min(...scores) : null;
    const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
    bestEl.innerHTML = `Best: <b>${best ?? '—'}</b>${best ? ' ms' : ''}`;
    avgEl.innerHTML = `Avg: <b>${avg ?? '—'}</b>${avg ? ' ms' : ''}`;
  }

  function idle(){
    state = 'idle';
    pad.className = 'reflex-pad wait';
    padBig.textContent = 'Tap to start';
    padSmall.textContent = 'Wait for the pad to turn green, then tap as fast as you can.';
  }

  function arm(){
    state = 'waiting';
    pad.className = 'reflex-pad wait';
    padBig.textContent = 'Wait…';
    padSmall.textContent = 'The AI core will flip this green at a random moment.';
    const delay = 1000 + Math.random() * 3000;
    timeoutId = setTimeout(go, delay);
  }

  function go(){
    state = 'ready';
    startTime = performance.now();
    pad.className = 'reflex-pad go';
    padBig.textContent = 'TAP NOW';
    padSmall.textContent = '';
  }

  function early(){
    clearTimeout(timeoutId);
    state = 'idle';
    pad.className = 'reflex-pad early';
    padBig.textContent = 'Too soon';
    padSmall.textContent = 'Tap to try again.';
    setTimeout(idle, 900);
  }

  function score(){
    const ms = Math.round(performance.now() - startTime);
    scores.push(ms);
    if(scores.length > 20) scores = scores.slice(-20);
    store.set('gg-reflex-scores', scores);
    lastEl.innerHTML = `Last: <b>${ms}</b> ms`;
    renderStats();
    pad.className = 'reflex-pad wait';
    padBig.textContent = `${ms} ms`;
    padSmall.textContent = ms < 200 ? 'Faster than most humans. Tap to go again.' : 'Tap to go again.';
    state = 'idle';
  }

  pad.addEventListener('click', () => {
    if(state === 'idle') arm();
    else if(state === 'waiting') early();
    else if(state === 'ready') score();
  });

  idle();
})();
