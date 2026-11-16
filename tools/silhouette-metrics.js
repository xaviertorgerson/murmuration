/* Silhouette statistics: the same measurements for the simulation and for film of real flocks.
   A frame is reduced to a raster of darkness (0 sky .. 1 solid) and described by
     elong     length over width of the dark shape        contrast  darkest twentieth over the median darkness
     opacity   median darkness inside the shape           core      darkness of the darkest twentieth
     solidity  the shape's area over its convex hull      comps     separate bodies holding over 4% of the area
     change    how much of the outline is different one second later (0 none .. 1 all)
   For film the raster comes from the frames. For the simulation it is drawn from the birds' positions as seen from the
   ground at two bearings a quarter turn apart, so that it does not depend on the page's own drawing.
   In the console of the page, after loading this file:
     __murmur.setCount(32768); __murmur.applyPreset('golden-dusk'); __murmur.reseed(12); __murmur.P.visitors = 0;
     __murmur.advance(15); console.log(JSON.stringify(__sil.run(40)));
   __sil.REF holds the numbers from four clips of real murmurations (the frames that showed a whole flock clear of the edge). */
(function (root) {
  function box3(src, W, H) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; tmp[i] = (src[i - (x > 0 ? 1 : 0)] + src[i] + src[i + (x < W - 1 ? 1 : 0)]) / 3; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; out[i] = (tmp[i - (y > 0 ? W : 0)] + tmp[i] + tmp[i + (y < H - 1 ? W : 0)]) / 3; }
    return out;
  }
  function pct(arr, q) { const a = Float32Array.from(arr).sort(); return a.length ? a[Math.min(a.length - 1, Math.floor(q * a.length))] : 0; }
  function resample(src, W, H, x0, y0, x1, y1, w, h) {       // area-average / bilinear into w x h
    const out = new Float32Array(w * h), sx = (x1 - x0) / w, sy = (y1 - y0) / h;
    const nx = Math.max(1, Math.ceil(sx)), ny = Math.max(1, Math.ceil(sy));
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      let s = 0;
      for (let b = 0; b < ny; b++) for (let a = 0; a < nx; a++) {
        const fx = x0 + (i + (a + 0.5) / nx) * sx - 0.5, fy = y0 + (j + (b + 0.5) / ny) * sy - 0.5;
        const ix = Math.max(0, Math.min(W - 2, Math.floor(fx))), iy = Math.max(0, Math.min(H - 2, Math.floor(fy)));
        const tx = Math.max(0, Math.min(1, fx - ix)), ty = Math.max(0, Math.min(1, fy - iy)), k = iy * W + ix;
        s += (src[k] * (1 - tx) + src[k + 1] * tx) * (1 - ty) + (src[k + W] * (1 - tx) + src[k + W + 1] * tx) * ty;
      }
      out[j * w + i] = s / (nx * ny);
    }
    return out;
  }
  function hullArea(pts) {
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    const h = lo.slice(0, -1).concat(up.slice(0, -1)); let A = 0;
    for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; A += a[0] * b[1] - a[1] * b[0]; }
    return Math.abs(A) / 2;
  }
  function analyze(D, W, H) {
    // 1. rough extent at input resolution
    let s0 = box3(box3(D, W, H), W, H);
    const t0 = Math.max(0.04, 0.15 * pct(s0, 0.995));
    // keep the largest connected body and any others at least 12% of its size; drop specks and stray marks
    const lab0 = new Int32Array(W * H).fill(-1), sizes = [], st = [];
    for (let i = 0; i < W * H; i++) if (s0[i] > t0 && lab0[i] < 0) {
      const id = sizes.length; let n = 0; st.push(i); lab0[i] = id;
      while (st.length) { const k = st.pop(); n++; const x = k % W, y = (k - x) / W;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx; if (s0[q] > t0 && lab0[q] < 0) { lab0[q] = id; st.push(q); } } }
      sizes.push(n);
    }
    const big = Math.max(0, ...sizes);
    if (big < 12) return {ok: false};
    D = Float32Array.from(D);
    let bx0 = W, by0 = H, bx1 = -1, by1 = -1, cnt = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, l = lab0[i];
      if (l >= 0 && sizes[l] >= 0.12 * big) { cnt++; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
      else if (l >= 0 || s0[i] <= t0 * 0.5) { /* stray body or empty sky */ if (l >= 0) D[i] = 0; } }
    const touch = bx0 <= 0 || by0 <= 0 || bx1 >= W - 1 || by1 >= H - 1;
    // 2. standard raster: longer side of the flock = 96 cells, with a 10% margin
    const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1, m = 0.1 * Math.max(bw, bh), sc = 96 / Math.max(bw, bh);
    const w = Math.max(8, Math.round((bw + 2 * m) * sc)), h = Math.max(8, Math.round((bh + 2 * m) * sc));
    const R = resample(D, W, H, bx0 - m, by0 - m, bx1 + 1 + m, by1 + 1 + m, w, h);
    const S = box3(R, w, h);
    const thr = Math.max(0.04, 0.15 * pct(S, 0.995));
    const vals = []; let A = 0, mx = 0, my = 0, mw = 0;
    const mask = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = S[y * w + x]; if (v > thr) { mask[y * w + x] = 1; A++; vals.push(v); mx += v * x; my += v * y; mw += v; } }
    if (A < 20) return {ok: false};
    mx /= mw; my /= mw;
    let cxx = 0, cyy = 0, cxy = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { const v = S[y * w + x], dx = x - mx, dy = y - my; cxx += v * dx * dx; cyy += v * dy * dy; cxy += v * dx * dy; }
    cxx /= mw; cyy /= mw; cxy /= mw;
    const tr = cxx + cyy, det = cxx * cyy - cxy * cxy, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = Math.max(1e-6, tr / 2 - disc);
    // boundary points for the hull
    const pts = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x] && (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !mask[y * w + x - 1] || !mask[y * w + x + 1] || !mask[(y - 1) * w + x] || !mask[(y + 1) * w + x])) pts.push([x, y], [x + 1, y + 1], [x + 1, y], [x, y + 1]);
    const hull = hullArea(pts);
    // separate bodies holding more than 4% of the area
    const lab = new Int32Array(w * h).fill(-1); let comps = 0; const stack = [];
    for (let i = 0; i < w * h; i++) if (mask[i] && lab[i] < 0) {
      let n = 0; stack.push(i); lab[i] = i;
      while (stack.length) { const k = stack.pop(); n++; const x = k % w, y = (k - x) / w;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const q = yy * w + xx; if (mask[q] && lab[q] < 0) { lab[q] = i; stack.push(q); } } }
      if (n > 0.04 * A) comps++;
    }
    // normalised mask for the change rate: centred on the centroid, sqrt(area) -> 10 cells of a 32 x 32 grid
    const k = Math.sqrt(A) / 10, norm = new Uint8Array(1024);
    for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { const x = Math.round(mx + (i - 15.5) * k), y = Math.round(my + (j - 15.5) * k); if (x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x]) norm[j * 32 + i] = 1; }
    return {ok: true, touch, elong: Math.sqrt(l1 / l2), contrast: pct(vals, 0.95) / Math.max(1e-4, pct(vals, 0.5)), opacity: pct(vals, 0.5), core: pct(vals, 0.95),
            solidity: A / Math.max(hull, 1), comps, norm, sizeFrac: Math.max(bw / W, bh / H)};
  }
  function changeRate(a, b) { let inter = 0, uni = 0; for (let i = 0; i < 1024; i++) { inter += a[i] & b[i]; uni += a[i] | b[i]; } return uni ? 1 - inter / uni : 0; }
  function summarize(frames, dtStep) {        // frames: analyze() results in time order, dtStep seconds apart; change rate over ~1 s
    const ok = frames.filter((f) => f && f.ok && !f.touch);
    const med = (k) => { const a = ok.map((f) => f[k]).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : NaN; };
    const lag = Math.max(1, Math.round(1 / dtStep)), ch = [];
    for (let i = lag; i < frames.length; i++) { const a = frames[i - lag], b = frames[i]; if (a && b && a.ok && b.ok && !a.touch && !b.touch) ch.push(changeRate(a.norm, b.norm)); }
    ch.sort((x, y) => x - y);
    return {n: ok.length, elong: med('elong'), contrast: med('contrast'), opacity: med('opacity'), core: med('core'), solidity: med('solidity'), comps: ok.reduce((s, f) => s + f.comps, 0) / Math.max(1, ok.length),
            change: ch.length ? ch[Math.floor(ch.length / 2)] : NaN, nch: ch.length};
  }
  const api = {analyze, summarize, changeRate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FlockMetrics = api;
})(typeof window !== 'undefined' ? window : globalThis);
const BIRD_AREA = 0.015;      // m^2, a starling's average silhouette
function raster(P, N, az){
  let cx = 0, cy = 0, cz = 0; for (let i = 0; i < N; i++) { cx += P[i * 4]; cy += P[i * 4 + 1]; cz += P[i * 4 + 2]; } cx /= N; cy /= N; cz /= N;
  const rr = new Float32Array(N); for (let i = 0; i < N; i++) rr[i] = Math.hypot(P[i * 4] - cx, P[i * 4 + 1] - cy, P[i * 4 + 2] - cz);
  const r95 = Float32Array.from(rr).sort()[Math.floor(N * 0.95)];
  const L = Math.max(3.5 * r95, 60), o = [cx + Math.sin(az) * L, Math.min(2, cy), cz + Math.cos(az) * L];
  let f = [cx - o[0], cy - o[1], cz - o[2]]; const fl = Math.hypot(...f); f = f.map((v) => v / fl);
  let r = [f[2], 0, -f[0]]; const rl = Math.hypot(...r); r = r.map((v) => v / rl);     // cross(f, up) up to sign
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  if (u[1] < 0) { u[0] = -u[0]; u[1] = -u[1]; u[2] = -u[2]; }
  const X = new Float32Array(N), Y = new Float32Array(N), Z = new Float32Array(N); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < N; i++) { const dx = P[i * 4] - o[0], dy = P[i * 4 + 1] - o[1], dz = P[i * 4 + 2] - o[2]; const z = dx * f[0] + dy * f[1] + dz * f[2]; Z[i] = z;
    if (z < 1) { X[i] = NaN; continue; } X[i] = (dx * r[0] + dy * r[1] + dz * r[2]) / z; Y[i] = -(dx * u[0] + dy * u[1] + dz * u[2]) / z;
    if (X[i] < x0) x0 = X[i]; if (X[i] > x1) x1 = X[i]; if (Y[i] < y0) y0 = Y[i]; if (Y[i] > y1) y1 = Y[i]; }
  const s = Math.max(x1 - x0, y1 - y0) / 176, W = Math.ceil((x1 - x0) / s) + 16, H = Math.ceil((y1 - y0) / s) + 16;
  const tau = new Float32Array(W * H);
  for (let i = 0; i < N; i++) { if (!(X[i] === X[i])) continue; const gx = Math.floor((X[i] - x0) / s) + 8, gy = Math.floor((Y[i] - y0) / s) + 8; tau[gy * W + gx] += BIRD_AREA / (Z[i] * Z[i] * s * s); }
  const D = new Float32Array(W * H); for (let i = 0; i < W * H; i++) D[i] = 1 - Math.exp(-tau[i]);
  return {D, W, H};
}

window.__sil = {
  REF: {
  film: {frames: 23, elong: 5.42, contrast: 2.23, opacity: 0.13, core: 0.29, solidity: 0.78, comps: 1.35, change: 0.45},
  uk: {frames: 9, elong: 3.00, contrast: 2.40, opacity: 0.16, core: 0.45, solidity: 0.69, comps: 1.67, change: null},
  italy: {frames: 54, elong: 1.67, contrast: 1.72, opacity: 0.22, core: 0.42, solidity: 0.78, comps: 1.11, change: 0.46},
  dusk4k: {frames: 6, elong: 1.68, contrast: 2.34, opacity: 0.14, core: 0.27, solidity: 0.78, comps: 1.17, change: 0.43}
},
  // T simulated seconds, a frame every half second, both bearings averaged
  run(T){
    const m = window.__murmur, step = 0.5, n = Math.round(T / step), fa = [], fb = [];
    for (let i = 0; i < n; i++) {
      m.advance(step);
      const P = m.dump()[0], N = P.length / 4;
      const A = raster(P, N, 0.6), B = raster(P, N, 0.6 + Math.PI / 2);
      fa.push(FlockMetrics.analyze(A.D, A.W, A.H)); fb.push(FlockMetrics.analyze(B.D, B.W, B.H));
    }
    for (const f of fa.concat(fb)) if (f) f.touch = false;
    const sa = FlockMetrics.summarize(fa, step), sb = FlockMetrics.summarize(fb, step), out = {};
    for (const k of ['elong', 'contrast', 'opacity', 'core', 'solidity', 'comps', 'change']) out[k] = +((sa[k] + sb[k]) / 2).toFixed(2);
    return out;
  },
};
