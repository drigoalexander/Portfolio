/**
 * A spring in Apple's designer terms: `response` (seconds — how quickly it
 * reaches the target) and `damping` (1 settles without overshoot, below 1
 * bounces). Springs carry velocity, so a new target mid-flight bends the
 * motion instead of restarting it. Integrated semi-implicitly in steps of at
 * most 1/240 s so a dropped frame can't blow it up.
 */
export interface Spring {
  x: number;
  v: number;
  target: number;
  step(dt: number): void;
  /** at rest on its target (within `eps`, position and velocity) */
  idle(eps?: number): boolean;
}

export function createSpring(response: number, damping: number): Spring {
  const k = Math.pow((2 * Math.PI) / response, 2);
  const c = 2 * damping * Math.sqrt(k);
  return {
    x: 0,
    v: 0,
    target: 0,
    step(dt) {
      for (let left = dt; left > 0; left -= 1 / 240) {
        const h = Math.min(left, 1 / 240);
        this.v += (-k * (this.x - this.target) - c * this.v) * h;
        this.x += this.v * h;
      }
    },
    idle(eps = 0.04) {
      return Math.abs(this.x - this.target) < eps && Math.abs(this.v) < eps * 2;
    },
  };
}
