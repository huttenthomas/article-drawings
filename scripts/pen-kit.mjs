// Pen kit: draws by hand-placed strokes in the format drawFigure() plays.
// strokes[i] = [inkIndex, width*10, alpha*100, x0, y0, dx1, dy1, ...]. Ink 0 is the page ink, ink 1 (MARK) the accent.
// O() firm outline, D() detail, H() light hatching; each takes an ink. Copied from the article-drawings skill.

// ── seeded randomness, so a re-run gives the same drawing ──
let seed = 7;
const rnd = (a = 0, b = 1) => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return a + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * (b - a);
};

// ── pen ──
const INK = 0, MARK = 1;
const OUTLINE = { w: 36, a: 100, amp: 1.5 };
const DETAIL = { w: 28, a: 95, amp: 1.0 };
const HATCH = { w: 21, a: 72, amp: 0.6 };

let strokes = [];
let xf = (p) => p; // current transform, used for the tilted recipe card
const withTransform = (t, fn) => { const old = xf; xf = t; fn(); xf = old; };

function resample(pts, step = 7) {
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const len = Math.hypot(bx - ax, by - ay);
    let d = step - carry;
    while (d < len) { out.push([ax + ((bx - ax) * d) / len, ay + ((by - ay) * d) / len]); d += step; }
    carry = len - (d - step);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function pen(pts, { c = INK, w, a, amp } = OUTLINE, step = 7) {
  const r = resample(pts, step);
  const p1 = rnd(0, 6.28), p2 = rnd(0, 6.28), l1 = rnd(70, 130), l2 = rnd(24, 42);
  let s = 0;
  const moved = r.map(([x, y], i) => {
    const [ax, ay] = r[Math.max(0, i - 1)], [bx, by] = r[Math.min(r.length - 1, i + 1)];
    const n = Math.hypot(bx - ax, by - ay) || 1;
    if (i) s += Math.hypot(x - r[i - 1][0], y - r[i - 1][1]);
    const off = amp * (Math.sin(s / l1 + p1) + 0.45 * Math.sin(s / l2 + p2));
    return xf([x - ((by - ay) / n) * off, y + ((bx - ax) / n) * off]);
  });
  const st = [c, w, a, Math.round(moved[0][0]), Math.round(moved[0][1])];
  let [px, py] = [st[3], st[4]];
  for (let i = 1; i < moved.length; i++) {
    const x = Math.round(moved[i][0]), y = Math.round(moved[i][1]);
    if (x === px && y === py) continue;
    st.push(x - px, y - py);
    px = x; py = y;
  }
  if (st.length > 5) strokes.push(st);
}

const O = (c = INK) => ({ ...OUTLINE, c });
const D = (c = INK) => ({ ...DETAIL, c });
const H = (c = INK) => ({ ...HATCH, c });

function line(ax, ay, bx, by, o = O()) {
  const len = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / len, uy = (by - ay) / len;
  const over = Math.min(4, len * 0.05);
  const a = [ax - ux * rnd(0, over), ay - uy * rnd(0, over)];
  const b = [bx + ux * rnd(0, over), by + uy * rnd(0, over)];
  const bow = rnd(-1, 1) * Math.min(3.5, len * 0.012);
  pen([a, [(ax + bx) / 2 - uy * bow, (ay + by) / 2 + ux * bow], b], o);
}

function spline(pts, o = O(), closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    for (let t = 0; t < 1; t += 1 / 14) {
      const t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) =>
        0.5 * (2 * P[i][k] + (P[i + 1][k] - P[i - 1][k]) * t +
          (2 * P[i - 1][k] - 5 * P[i][k] + 4 * P[i + 1][k] - P[i + 2][k]) * t2 +
          (3 * P[i][k] - P[i - 1][k] - 3 * P[i + 1][k] + P[i + 2][k]) * t3)));
    }
  }
  out.push(P[P.length - 2]);
  pen(out, o);
}

const ellipsePts = (cx, cy, rx, ry, from = -2, sweep = 6.283 + 0.28) => {
  const pts = [];
  const n = Math.ceil(Math.max(rx, ry) * 0.7) + 14;
  for (let i = 0; i <= n; i++) {
    const t = from + (sweep * i) / n, drift = 1 + (0.02 * i) / n;
    pts.push([cx + Math.cos(t) * rx * drift, cy + Math.sin(t) * ry * drift]);
  }
  return pts;
};
const ellipse = (cx, cy, rx, ry, o = O(), from, sweep) => {
  const r = Math.max(rx, ry); // small circles need a finer step and less wobble, or they turn angular
  pen(ellipsePts(cx, cy, rx, ry, from, sweep), { ...o, amp: Math.min(o.amp, r * 0.04) }, Math.min(7, Math.max(1.2, r * 0.3)));
};

function box(x0, y0, x1, y1, o = O()) {
  line(x0, y0, x1, y0, o); line(x1, y0, x1, y1, o); line(x1, y1, x0, y1, o); line(x0, y1, x0, y0, o);
}

function roundBox(x0, y0, x1, y1, r, o = O()) {
  const pts = [];
  const arc = (cx, cy, from) => { for (let i = 0; i <= 8; i++) { const t = from + (i / 8) * (Math.PI / 2); pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } };
  arc(x1 - r, y0 + r, -Math.PI / 2); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI);
  pts.push(pts[0], pts[1], pts[2]);
  pen(pts, o);
}

// a body standing on the ground: rounded shoulders, open at the bottom
function torso(x0, y0, x1, ground, r, o = O()) {
  const pts = [[x0, ground]];
  for (let i = 0; i <= 8; i++) { const t = Math.PI + (i / 8) * (Math.PI / 2); pts.push([x0 + r + Math.cos(t) * r, y0 + r + Math.sin(t) * r]); }
  for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push([x1 - r + Math.cos(t) * r, y0 + r + Math.sin(t) * r]); }
  pts.push([x1, ground]);
  pen(pts, o);
}

function hatch(poly, deg, gap, o = H()) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const rot = poly.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
  const ys = rot.map((p) => p[1]);
  for (let y = Math.min(...ys) + gap / 2; y < Math.max(...ys); y += gap * rnd(0.82, 1.18)) {
    const hits = [];
    rot.forEach((p, i) => {
      const q = rot[(i + 1) % rot.length];
      if ((p[1] <= y) !== (q[1] <= y)) hits.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
    });
    hits.sort((m, n) => m - n);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const x0 = hits[i] + rnd(0, 7), x1 = hits[i + 1] - rnd(0, 7);
      if (x1 - x0 < 6) continue;
      line(x0 * c - y * s, x0 * s + y * c, x1 * c - y * s, x1 * s + y * c, o);
    }
  }
}

// a line of handwriting, drawn as word-length dashes
function words(x, y, len, o = D()) {
  let at = x, yy = y;
  while (at < x + len - 12) {
    const w = Math.min(rnd(26, 66), x + len - at);
    line(at, yy, at + w, yy + rnd(-1.4, 1.4), o);
    at += w + rnd(10, 15);
    yy += rnd(-0.8, 0.8);
  }
}

function dashed(pts, dash, gap, o = D()) {
  const r = resample(pts, 3);
  let i = 0;
  while (i < r.length - 1) {
    const end = Math.min(r.length - 1, i + Math.round(rnd(dash * 0.8, dash * 1.2) / 3));
    if (end > i + 1) pen(r.slice(i, end + 1), o);
    i = end + Math.round(rnd(gap * 0.8, gap * 1.2) / 3);
  }
}

function arrowHead(x, y, deg, size, o = O()) {
  const a = (deg * Math.PI) / 180;
  [2.55, -2.55].forEach((d) => line(x, y, x + Math.cos(a + d) * size, y + Math.sin(a + d) * size, o));
}

// draw(fn) rotated by deg around a point, for anything that shouldn't sit square
const tilted = (deg, cx, cy, fn) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  withTransform(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c], fn);
};

// a sheet of paper with a folded top-right corner
function page(x0, y0, x1, y1, fold, c = MARK) {
  const o = O(c);
  line(x0, y0, x1 - fold, y0, o);
  line(x1 - fold, y0, x1, y0 + fold, o);
  line(x1, y0 + fold, x1, y1, o);
  line(x1, y1, x0, y1, o);
  line(x0, y1, x0, y0, o);
  line(x1 - fold, y0, x1 - fold + 2, y0 + fold, D(c));
  line(x1 - fold + 2, y0 + fold, x1, y0 + fold, D(c));
}

// Each figure seeds from its own name, so editing one drawing leaves the others untouched.
function figure(name, w, h, draw) {
  strokes = [];
  seed = [...name].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) | 0, 7);
  draw();
  return [name, { w, h, scale: 1, colors: ["#211d1e", "#ff4f12"], strokes }];
}

export { rnd, resample, pen, line, spline, ellipsePts, ellipse, box, roundBox, torso, hatch, words, dashed, arrowHead, page, figure, withTransform, tilted, INK, MARK, OUTLINE, DETAIL, HATCH, O, D, H };
