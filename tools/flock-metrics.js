/* Structure metrics for the flock, read from the simulation's own state.
   Paste this file into the console of the page (or load it with a script tag), then for example:
     __murmur.setCount(16384); __murmur.applyPreset('golden-dusk'); __murmur.reseed(11); __murmur.P.visitors = 0;
     __murmur.advance(10); console.log(__fm.HEAD + '\n' + __fm.runSync(60, 1));
   whole      share of the birds in the largest connected body (birds within three spacings are connected), averaged
   wholeMin   its lowest value;  splitTime  share of the time it was under 0.9;  groups  bodies holding over 2% each
   thin       thickness over width of the largest body (standard deviations along its axes); thinMin, thinMax its range
   elong      length over width;  up  how nearly the thin axis is vertical (1 is vertical);  localThin  thin, per block
   turnDegPerS  how fast the mean heading turns;  pol  polarisation;  nn  nearest-neighbour distance in metres
   strip(n, gap, cols) draws a contact sheet of n frames, gap simulated seconds apart, over the page. */
window.__fm = (function(){
  function eig(C){ // Jacobi, returns {val:[...], vec:[[...]...]} sorted ascending
    const a = C.map((r) => r.slice()), v = [[1,0,0],[0,1,0],[0,0,1]];
    for (let s = 0; s < 14; s++) for (const [p, q] of [[0,1],[0,2],[1,2]]) {
      if (Math.abs(a[p][q]) < 1e-12) continue;
      const th = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]), c = Math.cos(th), sn = Math.sin(th);
      for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - sn * y; a[k][q] = sn * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - sn * y; a[q][k] = sn * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = v[k][p], y = v[k][q]; v[k][p] = c * x - sn * y; v[k][q] = sn * x + c * y; }
    }
    const idx = [0,1,2].sort((i, j) => a[i][i] - a[j][j]);
    return {val: idx.map((i) => a[i][i]), vec: idx.map((i) => [v[0][i], v[1][i], v[2][i]])};
  }
  function snap(){
    const m = window.__murmur, D = m.dump(), P = D[0], V = D[1], N = P.length / 4;
    const cell = 3.0 * m.spacing;             // link distance: three bird spacings
    const key = (x, y, z) => x + ',' + y + ',' + z;
    const grid = new Map();
    for (let i = 0; i < N; i++) { const k = key(Math.floor(P[i*4] / cell), Math.floor(P[i*4+1] / cell), Math.floor(P[i*4+2] / cell)); let g = grid.get(k); if (!g) grid.set(k, g = []); g.push(i); }
    // connected components over occupied cells (26-neighbourhood)
    const comp = new Map(); let nc = 0; const sizes = [];
    for (const k0 of grid.keys()) {
      if (comp.has(k0)) continue;
      const id = nc++; let sz = 0; const st = [k0]; comp.set(k0, id);
      while (st.length) { const k = st.pop(); sz += grid.get(k).length; const [x, y, z] = k.split(',').map(Number);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const k2 = key(x + dx, y + dy, z + dz); if (grid.has(k2) && !comp.has(k2)) { comp.set(k2, id); st.push(k2); } } }
      sizes.push(sz);
    }
    let big = 0; for (let i = 1; i < nc; i++) if (sizes[i] > sizes[big]) big = i;
    const groups = sizes.filter((s) => s >= 0.02 * N).length;
    // largest component: shape
    let cx = 0, cy = 0, cz = 0, n = 0, hx = 0, hy = 0, hz = 0;
    const inBig = new Uint8Array(N);
    for (const [k, g] of grid) if (comp.get(k) === big) for (const i of g) { inBig[i] = 1; cx += P[i*4]; cy += P[i*4+1]; cz += P[i*4+2]; n++; const s = Math.hypot(V[i*4], V[i*4+1], V[i*4+2]) || 1; hx += V[i*4] / s; hy += V[i*4+1] / s; hz += V[i*4+2] / s; }
    cx /= n; cy /= n; cz /= n;
    const C = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < N; i++) if (inBig[i]) { const d = [P[i*4] - cx, P[i*4+1] - cy, P[i*4+2] - cz]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a][b] += d[a] * d[b] / n; }
    const E = eig(C), sd = E.val.map((x) => Math.sqrt(Math.max(x, 0)));
    // local thinness: the same, over blocks a third of the flock's length across, weighted by birds
    const B = Math.max(2 * sd[2] / 3, 4 * cell / 3), blocks = new Map();
    for (let i = 0; i < N; i++) if (inBig[i]) { const k = key(Math.floor(P[i*4] / B), Math.floor(P[i*4+1] / B), Math.floor(P[i*4+2] / B)); let g = blocks.get(k); if (!g) blocks.set(k, g = []); g.push(i); }
    let lt = 0, lw = 0, lup = 0;
    for (const g of blocks.values()) { if (g.length < 40) continue; let bx = 0, by = 0, bz = 0; for (const i of g) { bx += P[i*4]; by += P[i*4+1]; bz += P[i*4+2]; } bx /= g.length; by /= g.length; bz /= g.length;
      const c = [[0,0,0],[0,0,0],[0,0,0]]; for (const i of g) { const d = [P[i*4] - bx, P[i*4+1] - by, P[i*4+2] - bz]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) c[a][b] += d[a] * d[b]; }
      const e = eig(c); lt += g.length * Math.sqrt(Math.max(e.val[0], 0) / Math.max(e.val[1], 1e-9)); lup += g.length * Math.abs(e.vec[0][1]); lw += g.length; }
    // counter-flow: birds in cells (two link distances across) whose birds disagree about heading
    const c2 = new Map(), cs = cell * 2;
    for (let i = 0; i < N; i++) { const k = key(Math.floor(P[i*4] / cs), Math.floor(P[i*4+1] / cs), Math.floor(P[i*4+2] / cs)); let g = c2.get(k); if (!g) c2.set(k, g = [0, 0, 0, 0]); const s = Math.hypot(V[i*4], V[i*4+1], V[i*4+2]) || 1; g[0] += V[i*4] / s; g[1] += V[i*4+1] / s; g[2] += V[i*4+2] / s; g[3]++; }
    let mixed = 0; for (const g of c2.values()) if (g[3] >= 12 && Math.hypot(g[0], g[1], g[2]) / g[3] < 0.6) mixed += g[3];
    // nearest-neighbour distance, from a sample of birds
    let nn = 0, nnN = 0;
    for (let i = 0; i < N; i += Math.max(1, Math.floor(N / 400))) { const gx = Math.floor(P[i*4] / cell), gy = Math.floor(P[i*4+1] / cell), gz = Math.floor(P[i*4+2] / cell); let best = 1e9;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const g = grid.get(key(gx + dx, gy + dy, gz + dz)); if (!g) continue; for (const j of g) { if (j === i) continue; const d = Math.hypot(P[j*4] - P[i*4], P[j*4+1] - P[i*4+1], P[j*4+2] - P[i*4+2]); if (d < best) best = d; } }
      if (best < 1e8) { nn += best; nnN++; } }
    const hl = Math.hypot(hx, hy, hz) || 1;
    return {big: sizes[big] / N, groups, sd, thin: sd[0] / sd[1], elong: sd[2] / sd[1], up: Math.abs(E.vec[0][1]), lthin: lw ? lt / lw : 0, lup: lw ? lup / lw : 0, mixed: mixed / N, nn: nnN ? nn / nnN : 0, pol: hl / n, head: [hx / hl, hy / hl, hz / hl], c: [cx, cy, cz]};
  }
  // run for `sec` simulated seconds, sampling every `every`
  async function run(sec, every){
    const m = window.__murmur, S = [];
    for (let t = 0; t < sec; t += every) { m.advance(every); S.push(snap()); await new Promise((r) => setTimeout(r, 0)); }
    const avg = (f) => S.reduce((a, s) => a + f(s), 0) / S.length;
    let turn = 0; for (let i = 1; i < S.length; i++) { const a = S[i - 1].head, b = S[i].head; turn += Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]))) * 57.3; }
    let shape = 0; for (let i = 1; i < S.length; i++) shape += Math.abs(Math.log((S[i].sd[2] / S[i].sd[0]) / (S[i - 1].sd[2] / S[i - 1].sd[0])));
    const r2 = (x) => +x.toFixed(2);
    return {whole: r2(avg((s) => s.big)), wholeMin: r2(Math.min(...S.map((s) => s.big))), splitTime: r2(avg((s) => s.big < 0.9 ? 1 : 0)), groups: r2(avg((s) => s.groups)),
            thin: r2(avg((s) => s.thin)), elong: r2(avg((s) => s.elong)), up: r2(avg((s) => s.up)), localThin: r2(avg((s) => s.lthin)), localUp: r2(avg((s) => s.lup)),
            sd: S[S.length - 1].sd.map(r2), mixed: +avg((s) => s.mixed).toFixed(3), pol: r2(avg((s) => s.pol)), turnDegPerS: r2(turn / (sec - every)), shapePerS: r2(shape / (sec - every))};
  }
  // the same without yielding to timers, which a hidden tab throttles to one a second or slower
  function runSync(sec, every){
    const m = window.__murmur, S = [];
    for (let t = 0; t < sec; t += every) { m.advance(every); S.push(snap()); }
    const avg = (f) => S.reduce((a, s) => a + f(s), 0) / S.length;
    let turn = 0; for (let i = 1; i < S.length; i++) { const a = S[i - 1].head, b = S[i].head; turn += Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]))) * 57.3; }
    let shape = 0; for (let i = 1; i < S.length; i++) shape += Math.abs(Math.log((S[i].sd[2] / S[i].sd[0]) / (S[i - 1].sd[2] / S[i - 1].sd[0])));
    const r2 = (x) => +x.toFixed(2);
    return [r2(avg((s) => s.big)), r2(Math.min(...S.map((s) => s.big))), r2(avg((s) => s.big < 0.9 ? 1 : 0)), r2(avg((s) => s.groups)), r2(avg((s) => s.thin)), r2(Math.min(...S.map((s) => s.thin))), r2(Math.max(...S.map((s) => s.thin))),
            r2(avg((s) => s.elong)), r2(avg((s) => s.up)), r2(avg((s) => s.lthin)), r2(turn / (sec - every)), r2(shape / (sec - every)), r2(avg((s) => s.pol)), r2(avg((s) => s.nn)), S[S.length - 1].sd.map(r2).join('/')].join(' ');
  }
  const HEAD = 'whole wholeMin splitTime groups thin thinMin thinMax elong up localThin turnDegPerS shapePerS pol nn sd';
  // a contact sheet: `n` frames `gap` simulated seconds apart, drawn into one canvas laid over the page
  function strip(n, gap, cols){
    const m = window.__murmur, gl = document.querySelector('canvas');
    let sh = document.getElementById('fmStrip'); if (!sh) { sh = document.createElement('canvas'); sh.id = 'fmStrip'; sh.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99;background:#000'; document.body.appendChild(sh); }
    const rows = Math.ceil(n / cols); sh.width = innerWidth * devicePixelRatio; sh.height = innerHeight * devicePixelRatio;
    const g = sh.getContext('2d'), tw = sh.width / cols, th = sh.height / rows;
    for (let i = 0; i < n; i++) { m.advance(gap); for (let k = 0; k < 40; k++) m.frameStep(1 / 60); g.drawImage(gl, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); }
    return n;
  }
  function unstrip(){ const sh = document.getElementById('fmStrip'); if (sh) sh.remove(); }
  return {snap, run, runSync, HEAD, strip, unstrip};
})();
