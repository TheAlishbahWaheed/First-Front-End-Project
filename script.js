const $     = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const delay = ()  => Math.round(1150 - $('spd').value * 105);
const log   = h   => $('log').innerHTML = h;
/*Global State*/
let mode    = 'bubble';
let arr     = [];
let running = false;
let stop    = false;
let LL      = [];   // Linked List data
let SK      = [];   // Stack data
let QU      = [];   // Queue data
const SORTS = ['bubble', 'selection', 'insertion', 'merge'];
/*MODE SWITCHING*/
function sw(m) {
  stop = true; running = false; mode = m;
  const labels = {
    bubble: 'bubble', selection: 'selection', insertion: 'insertion',
    merge: 'merge',   linkedlist: 'linked',   stack: 'stack', queue: 'queue'
  };
  document.querySelectorAll('.db').forEach(b =>
    b.classList.toggle('active', b.textContent.trim().toLowerCase().includes(labels[m]))
  );
  $('sh').style.display  = SORTS.includes(m) ? ''     : 'none';
  $('lh').style.display  = m === 'linkedlist' ? ''     : 'none';
  $('kh').style.display  = m === 'stack'      ? ''     : 'none';
  $('qh').style.display  = m === 'queue'      ? ''     : 'none';
  $('leg').style.display = SORTS.includes(m)  ? ''     : 'none';
  const titles = {
    bubble: 'Bubble Sort', selection: 'Selection Sort',
    insertion: 'Insertion Sort', merge: 'Merge Sort'
  };
  if (titles[m]) $('st').textContent = titles[m];
  if (SORTS.includes(m))  { arr = []; drawBars([], {}); }
  else if (m === 'linkedlist') drawLL();
  else if (m === 'stack')      drawSK();
  else if (m === 'queue')      drawQU();
  log(`Switched to <span class="op">${m}</span>.`);
}
/*SORTING, SHARED HELPERS*/
function drawBars(a, S) {
  const vc = $('vc');
  if (!a.length) {
    vc.innerHTML = '<div class="empty">Enter numbers and press Load, or click Random.</div>';
    return;
  }
  const max = Math.max(...a, 1);
  vc.innerHTML = '<div class="bars" id="ba"></div>';
  a.forEach((v, i) => {
    const h   = Math.max(4, Math.round(v / max * 168));
    const cls = S[i] || 'def';
    const w   = document.createElement('div');
    w.className = 'bw';
    w.innerHTML = `<div class="br c-${cls}" style="height:${h}px"></div><div class="bn">${v}</div>`;
    $('ba').appendChild(w);
  });
}
/*Builds a state object: sorted indices → 'srt', plus arbitrary highlight pairs.*/
function mkState(done, ...pairs) {
  const S = {};
  done.forEach(k => S[k] = 'srt');
  for (let i = 0; i < pairs.length; i += 2) S[pairs[i]] = pairs[i + 1];
  return S;
}
function loadArr() {
  const nums = $('si').value.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (!nums.length) { log('<span class="err">Enter at least one number.</span>'); return; }
  arr = nums;
  drawBars(arr, {});
  log(`Loaded: <span class="val">[${arr.join(', ')}]</span>`);
}
function randArr() {
  arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 88) + 8);
  $('si').value = arr.join(', ');
  drawBars(arr, {});
  log(`Random: <span class="val">[${arr.join(', ')}]</span>`);
}
function resetSort() {
  stop = true; running = false; arr = [];
  $('si').value = '';
  drawBars([], {});
  log('Reset.');
}
/*Entry point for all sorting animations.*/
async function go() {
  if (running) return;
  if (!arr.length) { randArr(); await sleep(300); }
  stop = false; running = true; $('sb').disabled = true;
  if (mode === 'bubble')    await bubble();
  if (mode === 'selection') await selection();
  if (mode === 'insertion') await insertion();
  if (mode === 'merge')     await mergeRun();
  running = false; $('sb').disabled = false;
}
function finishSort(a, n) {
  const F = {};
  for (let k = 0; k < n; k++) F[k] = 'srt';
  drawBars(a, F);
  arr = [...a];
  log(`<span class="ok">${mode.charAt(0).toUpperCase() + mode.slice(1)} sort complete</span>: <span class="val">[${a.join(', ')}]</span>`);
}
/*SORTING ALGORITHMS*/
/*Bubble Sort*/
async function bubble() {
  const a = [...arr], n = a.length, done = new Set();
  log('<span class="op">Bubble sort</span> started');

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (stop) return;
      drawBars(a, mkState(done, j, 'cmp', j + 1, 'cmp'));
      log(`<span class="op">Compare</span> <span class="val">${a[j]}</span> &amp; <span class="val">${a[j+1]}</span>`);
      await sleep(delay());
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        drawBars(a, mkState(done, j, 'swp', j + 1, 'swp'));
        log(`<span class="op">Swap</span> → <span class="val">${a[j]}</span> &amp; <span class="val">${a[j+1]}</span>`);
        await sleep(delay());
      }
    }
    done.add(n - 1 - i);
  }
  done.add(0);
  finishSort(a, n);
}
/*Selection Sort*/
async function selection() {
  const a = [...arr], n = a.length, done = new Set();
  log('<span class="op">Selection sort</span> started');
  for (let i = 0; i < n; i++) {
    let mi = i;
    for (let j = i + 1; j < n; j++) {
      if (stop) return;
      drawBars(a, mkState(done, mi, 'min', j, 'cmp'));
      log(`<span class="op">Min</span>: <span class="val">${a[mi]}</span>, compare <span class="val">${a[j]}</span>`);
      await sleep(delay());
      if (a[j] < a[mi]) mi = j;
    }
    if (mi !== i) {
      [a[i], a[mi]] = [a[mi], a[i]];
      drawBars(a, mkState(done, i, 'swp', mi, 'swp'));
      log(`<span class="op">Place min</span> <span class="val">${a[i]}</span> at index ${i}`);
      await sleep(delay());
    }
    done.add(i);
  }
  finishSort(a, n);
}
/*Insertion Sort*/
async function insertion() {
  const a = [...arr], n = a.length;
  log('<span class="op">Insertion sort</span> started');
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      if (stop) return;
      const S = {};
      for (let k = 0; k < i; k++) S[k] = 'srt';
      S[j] = S[j - 1] = 'cmp';
      drawBars(a, S);
      log(`<span class="op">Insert</span> <span class="val">${a[j]}</span>: compare <span class="val">${a[j-1]}</span>`);
      await sleep(delay());
      if (a[j] < a[j - 1]) {
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        const S2 = {};
        for (let k = 0; k < i; k++) S2[k] = 'srt';
        S2[j] = S2[j - 1] = 'swp';
        drawBars(a, S2);
        await sleep(delay() * .6 | 0);
        j--;
      } else break;
    }
    const S3 = {};
    for (let k = 0; k <= i; k++) S3[k] = 'srt';
    drawBars(a, S3);
    await sleep(delay() * .4 | 0);
  }
  finishSort(a, n);
}
/*Merge Sort*/
async function mergeRun() {
  const a = [...arr];
  log('<span class="op">Merge sort</span> started');
  await ms(a, 0, a.length - 1);
  if (!stop) { arr = [...a]; finishSort(a, a.length); }
}
async function ms(a, l, r) {
  if (l >= r || stop) return;
  const m = (l + r) >> 1;
  await ms(a, l, m);
  await ms(a, m + 1, r);
  await mp(a, l, m, r);
}
async function mp(a, l, r2, r) {
  const L = a.slice(l, r2 + 1);
  const R = a.slice(r2 + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < L.length && j < R.length) {
    if (stop) return;
    const S = {};
    for (let x = l; x <= r; x++) S[x] = 'cmp';
    drawBars(a, S);
    log(`<span class="op">Merge</span> [${l}..${r}]: <span class="val">${L[i]}</span> &amp; <span class="val">${R[j]}</span>`);
    await sleep(delay());
    a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    const S2 = {};
    for (let x = l; x <= r; x++) S2[x] = 'swp';
    drawBars(a, S2);
    await sleep(delay() * .5 | 0);
  }
  while (i < L.length) a[k++] = L[i++];
  while (j < R.length) a[k++] = R[j++];
  const F = {};
  for (let x = l; x <= r; x++) F[x] = 'srt';
  drawBars(a, F);
  await sleep(delay() * .5 | 0);
}
/*LINKED LIST*/
function drawLL() {
  const vc = $('vc');
  if (!LL.length) {
    vc.innerHTML = '<div class="empty">Linked list is empty.</div>';
    return;
  }
  const area = document.createElement('div');
  area.className = 'lla';
  LL.forEach((v, i) => {
    const tag = i === 0 ? 'head' : i === LL.length - 1 ? 'tail' : '';
    const n   = document.createElement('div');
    n.className = 'lln';
    n.innerHTML = `<div class="llt">${tag || '&nbsp;'}</div><div class="llb">${v}</div>`;
    area.appendChild(n);
    if (i < LL.length - 1) {
      const a = document.createElement('div');
      a.className = 'llarr';
      a.textContent = '→';
      area.appendChild(a);
    }
  });
  const ar = document.createElement('div'); ar.className = 'llarr'; ar.textContent = '→';
  const nl = document.createElement('div'); nl.className = 'llnull'; nl.textContent = 'null';
  area.appendChild(ar);
  area.appendChild(nl);
  vc.innerHTML = '';
  vc.appendChild(area);
}
/*Reads and validates a numeric input field. Clears the field on success.*/
function llVal(id) {
  const v = parseInt($(id).value);
  if (isNaN(v)) { log('<span class="err">Enter a valid number.</span>'); return null; }
  $(id).value = '';
  return v;
}
function llApp() {
  const v = llVal('li'); if (v === null) return;
  LL.push(v); drawLL();
  log(`<span class="op">Append</span> <span class="val">${v}</span>. Length: <span class="val">${LL.length}</span>`);
}
function llPre() {
  const v = llVal('li'); if (v === null) return;
  LL.unshift(v); drawLL();
  log(`<span class="op">Prepend</span> <span class="val">${v}</span>. Length: <span class="val">${LL.length}</span>`);
}
function llDH() {
  if (!LL.length) { log('<span class="err">List is empty.</span>'); return; }
  const r = LL.shift(); drawLL();
  log(`<span class="op">Del head</span>: <span class="val">${r}</span>`);
}
function llDT() {
  if (!LL.length) { log('<span class="err">List is empty.</span>'); return; }
  const r = LL.pop(); drawLL();
  log(`<span class="op">Del tail</span>: <span class="val">${r}</span>`);
}
function llClr() {
  LL = []; drawLL();
  log('List <span class="op">cleared</span>.');
}
/*STACK*/
function drawSK() {
  const vc = $('vc');
  if (!SK.length) {
    vc.innerHTML = '<div class="empty">Stack is empty. Push a value.</div>';
    return;
  }
  const area = document.createElement('div'); area.className = 'ska';
  const col  = document.createElement('div'); col.className = 'skc';
  const base = document.createElement('div'); base.className = 'skbase';
  col.appendChild(base);
  SK.forEach((v, i) => {
    const n = document.createElement('div');
    n.className = 'skn' + (i === SK.length - 1 ? ' top' : '');
    n.textContent = v;
    col.appendChild(n);
  });
  const lbl = document.createElement('div'); lbl.className = 'skl';
  const ph  = document.createElement('div'); ph.style.height = '3px';
  lbl.appendChild(ph);
  SK.forEach((_, i) => {
    const d = document.createElement('div');
    d.className  = 'sll' + (i === SK.length - 1 ? ' tl' : '');
    d.textContent = i === SK.length - 1 ? '← top' : '';
    lbl.appendChild(d);
  });
  area.appendChild(col);
  area.appendChild(lbl);
  vc.innerHTML = '';
  vc.appendChild(area);
}
function skPush() {
  const v = llVal('ki'); if (v === null) return;
  SK.push(v); drawSK();
  log(`<span class="op">Push</span> <span class="val">${v}</span>. Size: <span class="val">${SK.length}</span>`);
}
function skPop() {
  if (!SK.length) { log('<span class="err">Stack underflow!</span>'); return; }
  const r = SK.pop(); drawSK();
  log(`<span class="op">Pop</span>: <span class="val">${r}</span>. Size: <span class="val">${SK.length}</span>`);
}
function skPeek() {
  if (!SK.length) { log('<span class="err">Stack is empty.</span>'); return; }
  log(`<span class="op">Peek</span>: top = <span class="val">${SK[SK.length - 1]}</span>`);
}
function skClr() {
  SK = []; drawSK();
  log('Stack <span class="op">cleared</span>.');
}
/*QUEUE*/
function drawQU() {
  const vc = $('vc');
  if (!QU.length) {
    vc.innerHTML = '<div class="empty">Queue is empty. Enqueue a value.</div>';
    return;
  }
  const area  = document.createElement('div'); area.className = 'qua';
  const tags  = document.createElement('div'); tags.className = 'qtags';
  tags.innerHTML = '<span class="qt qf">front (dequeue)</span><span style="color:var(--t3);font-size:11px;font-family:var(--mono)">──────&gt;</span><span class="qt qr">rear (enqueue)</span>';
  const nodes = document.createElement('div'); nodes.className = 'qnodes';
  QU.forEach((v, i) => {
    const cls = i === 0 ? 'front' : i === QU.length - 1 ? 'rear' : 'mid';
    const nd  = document.createElement('div');
    nd.className  = `qn ${cls}`;
    nd.textContent = v;
    nodes.appendChild(nd);
    if (i < QU.length - 1) {
      const a = document.createElement('div');
      a.className  = 'qarr';
      a.textContent = '→';
      nodes.appendChild(a);
    }
  });
  area.appendChild(tags);
  area.appendChild(nodes);
  vc.innerHTML = '';
  vc.appendChild(area);
}
function quEnq() {
  const v = llVal('qi'); if (v === null) return;
  QU.push(v); drawQU();
  log(`<span class="op">Enqueue</span> <span class="val">${v}</span>. Size: <span class="val">${QU.length}</span>`);
}
function quDeq() {
  if (!QU.length) { log('<span class="err">Queue is empty!</span>'); return; }
  const r = QU.shift(); drawQU();
  log(`<span class="op">Dequeue</span>: <span class="val">${r}</span>. Size: <span class="val">${QU.length}</span>`);
}
function quPeek() {
  if (!QU.length) { log('<span class="err">Queue is empty.</span>'); return; }
  log(`<span class="op">Peek</span>: front = <span class="val">${QU[0]}</span>`);
}
function quClr() {
  QU = []; drawQU();
  log('Queue <span class="op">cleared</span>.');
}
/*Init*/ 
sw('bubble');