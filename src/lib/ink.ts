/**
 * Pen ink for the Tree of Growth, computed at build time: every uniform
 * vector stroke becomes a filled outline whose width follows a hand —
 * weight where the nib lands, a thinning flick where it lifts, a little
 * wobble along the way. The outline is made of offset cubics (one per input
 * segment, each side), so it stays about twice the size of the stroke it
 * replaces instead of ballooning into a polyline.
 */

export type Pt = [number, number];
export type Cubic = [Pt, Pt, Pt, Pt];

/**
 * how the width travels along the stroke:
 * - `pen`   tree lines: touch-down weight, flick at the end
 * - `line`  scenery: tapers at both ends
 * - `grass` a blade: thick at the root, sharp at the tip
 */
export type InkProfile = "pen" | "line" | "grass";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** width multiplier at `u` (0..1 along the stroke) */
export function profileAt(kind: InkProfile, u: number): number {
  if (kind === "grass") return 1.2 * Math.pow(1 - u, 0.8) + 0.06;
  if (kind === "pen") return (0.64 + 0.36 * smooth(0, 0.14, u)) * (1 - 0.8 * smooth(0.55, 1, u));
  return 0.3 + 0.7 * Math.pow(Math.sin(Math.PI * u), 0.55);
}

/**
 * Pure: parses path data into subpaths of absolute cubics. Supports the
 * commands the scene uses (M L H V C Z, absolute and relative); lines become
 * cubics with thirds for control points. Anything else throws, so a new
 * command in the artwork fails the build instead of rendering wrong.
 */
export function parsePath(d: string): Cubic[][] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const subpaths: Cubic[][] = [];
  let cur: Cubic[] = [];
  let x = 0, y = 0, sx = 0, sy = 0, cmd = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const line = (nx: number, ny: number) => {
    cur.push([[x, y], [x + (nx - x) / 3, y + (ny - y) / 3], [x + ((nx - x) * 2) / 3, y + ((ny - y) * 2) / 3], [nx, ny]]);
    x = nx; y = ny;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) cmd = tokens[i++]!;
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M": {
        if (cur.length) subpaths.push(cur);
        cur = [];
        x = ox + num(); y = oy + num();
        sx = x; sy = y;
        cmd = rel ? "l" : "L"; // extra pairs after M are lines
        break;
      }
      case "L": line(ox + num(), oy + num()); break;
      case "H": line(ox + num(), y); break;
      case "V": line(x, oy + num()); break;
      case "C": {
        const p1: Pt = [ox + num(), oy + num()];
        const p2: Pt = [ox + num(), oy + num()];
        const p3: Pt = [ox + num(), oy + num()];
        cur.push([[x, y], p1, p2, p3]);
        [x, y] = p3;
        break;
      }
      case "Z": {
        if (x !== sx || y !== sy) line(sx, sy);
        break;
      }
      default:
        throw new Error(`ink: unsupported path command "${cmd}" in "${d}"`);
    }
  }
  if (cur.length) subpaths.push(cur);
  return subpaths;
}

const bez = (c: Cubic, t: number): Pt => {
  const m = 1 - t;
  const a = m * m * m, b = 3 * m * m * t, e = 3 * m * t * t, f = t * t * t;
  return [a * c[0][0] + b * c[1][0] + e * c[2][0] + f * c[3][0], a * c[0][1] + b * c[1][1] + e * c[2][1] + f * c[3][1]];
};
const arcLength = (c: Cubic) => {
  let len = 0, prev = c[0];
  for (let k = 1; k <= 16; k++) {
    const p = bez(c, k / 16);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return len;
};
const dir = (a: Pt, ...bs: Pt[]): Pt => {
  for (const b of bs) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    if (l > 1e-6) return [dx / l, dy / l];
  }
  return [1, 0];
};

/**
 * Pure: the filled outline of stroke `d` drawn with a pen of nominal
 * `width`. `seed` varies the wobble so no two lines breathe alike.
 */
export function inkOutline(d: string, width: number, kind: InkProfile = "pen", seed = 0): string {
  const F = (v: number) => (Math.round(v * 10) / 10).toString();
  const P = (p: Pt) => `${F(p[0])} ${F(p[1])}`;
  let out = "";
  for (const segs of parsePath(d)) {
    const lens = segs.map(arcLength);
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const half = (u: number) => {
      const s = u * total;
      const wobble = 1 + 0.09 * Math.sin(s * 0.045 + seed) + 0.05 * Math.sin(s * 0.17 + seed * 2.3);
      return (width * profileAt(kind, u) * wobble) / 2;
    };
    const left: Pt[][] = [], right: Pt[][] = [];
    let acc = 0;
    segs.forEach((c, i) => {
      const u0 = acc / total, u1 = (acc + lens[i]!) / total;
      acc += lens[i]!;
      const t0 = dir(c[0], c[1], c[2], c[3]);
      const back = dir(c[3], c[2], c[1], c[0]); // points from the end back along the curve
      const n0: Pt = [-t0[1], t0[0]], n3: Pt = [back[1], -back[0]];
      const hs = [0, 1 / 3, 2 / 3, 1].map((k) => half(u0 + (u1 - u0) * k));
      const ns = [n0, n0, n3, n3];
      left.push(c.map((p, k) => [p[0] + ns[k]![0] * hs[k]!, p[1] + ns[k]![1] * hs[k]!] as Pt));
      right.push(c.map((p, k) => [p[0] - ns[k]![0] * hs[k]!, p[1] - ns[k]![1] * hs[k]!] as Pt));
    });
    out += `M${P(left[0]![0])}`;
    left.forEach((c, i) => {
      if (i) out += `L${P(c[0])}`;
      out += `C${P(c[1])} ${P(c[2])} ${P(c[3])}`;
    });
    for (let i = right.length - 1; i >= 0; i--) {
      const c = right[i]!;
      out += `L${P(c[3])}C${P(c[2])} ${P(c[1])} ${P(c[0])}`;
    }
    // a round cap where the nib touched down (a blade's root sits in the soil)
    const r = F(half(0));
    out += kind === "grass" ? "Z" : `A${r} ${r} 0 0 0 ${P(left[0]![0])}Z`;
  }
  return out;
}
