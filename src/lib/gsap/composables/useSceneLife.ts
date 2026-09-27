import { registerGsap, ScrollTrigger } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { createSpring, type Spring } from "../../spring";
import { toHandle, type AnimHandle } from "./types";

type Placed = { el: Element; x: number; y: number; r: number; s: number; s2: Spring };

const num = (m: RegExpExecArray | null, i: number, fallback = 0) => (m ? Number(m[i]) : fallback);

/** "translate(x y) rotate(r) scale(s)" — the authored placement of a leaf/apple */
function placement(el: Element): Omit<Placed, "el" | "s2"> {
  const t = el.getAttribute("transform") ?? "";
  const tr = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(t);
  return {
    x: num(tr, 1),
    y: num(tr, 2),
    r: num(/rotate\(([-\d.]+)\)/.exec(t), 1),
    s: num(/scale\(([-\d.]+)\)/.exec(t), 1, 1),
  };
}

/**
 * The scene answers the hand (fine pointers, motion allowed):
 * - the pointer brushes the near grass apart, flutters leaves on their stems
 *   and swings apples — one spring each, integrated only while it moves
 * - scroll velocity is the wind: the crown leans and the grass rows bend,
 *   then rock back to rest (the one under-damped motion, because the
 *   reader's momentum drives it)
 * - the crown breathes once it exists, the chimney smokes, the birds flap
 *
 * `svg` is the tree's own svg; its siblings (the depth planes) are searched
 * too. `onFrame` gets the wind (-1..1) each frame and `onTouch` a strength
 * when an apple is struck — for the ambience.
 */
export function useSceneLife(
  svg: SVGSVGElement | string,
  opts: { onFrame?: (dt: number, wind: number, night: number) => void; onTouch?: (strength: number) => void } = {},
): AnimHandle {
  const gsap = registerGsap();
  const root = typeof svg === "string" ? document.querySelector<SVGSVGElement>(svg) : svg;
  let cleanup = () => {};

  const ctx = gsap.context(() => {
    if (!root || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const scene = root.parentElement ?? root;
    const artStyle = (scene as HTMLElement).style;

    const crown = scene.querySelector("[data-tree-sway]");
    const rows = Array.from(scene.querySelectorAll("[data-wind]")).map((g) => ({ g, near: g.getAttribute("data-wind") === "near" }));
    // brushing stays in the crisp focal plane — moving blades in a blurred
    // plane would re-blur it every frame
    const blades = Array.from(root.querySelectorAll<SVGPathElement>("path.grass")).map((el) => {
      const m = /M\s*([-\d.]+)\s+([-\d.]+)/.exec(el.getAttribute("d") ?? "");
      return { el, x: num(m, 1), y: num(m, 2), s2: createSpring(0.6, 0.34) };
    });
    const leaves: Placed[] = Array.from(root.querySelectorAll("[data-leaf]")).map((el, i) => ({
      el, ...placement(el), s2: createSpring(0.55 + (i % 7) * 0.04, 0.3),
    }));
    const apples: Placed[] = Array.from(root.querySelectorAll("[data-apple]")).map((el) => ({
      el, ...placement(el), s2: createSpring(1.25, 0.14),
    }));
    const smoke = Array.from(root.querySelectorAll("[data-smoke]"));
    const birds = Array.from(root.querySelectorAll("[data-bird]")).map((el, i) => {
      const m = /M\s*([-\d.]+)\s+([-\d.]+)/.exec(el.previousElementSibling?.querySelector("path")?.getAttribute("d") ?? "");
      return { el, x: num(m, 1) + 18, y: num(m, 2), ph: i * 2.1 };
    });
    const hidden = (el: Element) => (el.firstElementChild as SVGElement | null)?.style.visibility === "hidden";

    const leafTransform = (l: Placed, a: number) =>
      `translate(${l.x} ${l.y}) rotate(${(l.r + a).toFixed(2)})${l.s !== 1 ? ` scale(${l.s})` : ""}`;
    const appleTransform = (a: Placed, deg: number) =>
      `translate(${a.x} ${a.y}) scale(${a.s})${deg ? ` rotate(${deg.toFixed(2)} 0 -14)` : ""}`;

    const activeBlades = new Set<(typeof blades)[number]>();
    const activeLeaves = new Set<Placed>();
    const activeApples = new Set<Placed>();

    // the pointer, in scene units
    const ptr = { x: 0, y: 0, vx: 0, t: 0, seen: false };
    const onMove = (e: PointerEvent) => {
      const m = root.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const now = performance.now();
      if (ptr.seen) ptr.vx += ((p.x - ptr.x) / Math.max((now - ptr.t) / 1000, 1 / 240) - ptr.vx) * 0.5;
      Object.assign(ptr, { x: p.x, y: p.y, t: now, seen: true });
      const vx = Math.max(-2400, Math.min(2400, ptr.vx));

      for (const b of blades) {
        const dx = b.x - p.x;
        if (Math.abs(dx) > 70 || p.y < b.y - 80 || p.y > b.y + 26) continue;
        // lean away from the hand and take its momentum
        b.s2.v += (vx * 0.05 + Math.sign(dx || 1) * 40) * (1 - Math.abs(dx) / 70);
        activeBlades.add(b);
      }
      for (const l of leaves) {
        const d = Math.hypot(l.x - p.x, l.y - p.y);
        if (d > 36 || hidden(l.el)) continue;
        l.s2.v += (vx * 0.09 + ((l.x * 7) % 11) - 5) * (1 - d / 36);
        activeLeaves.add(l);
      }
      for (const a of apples) {
        if (Math.hypot(a.x - p.x, a.y + 4 * a.s - p.y) > 16 * a.s || hidden(a.el)) continue;
        a.s2.v += vx * 0.12;
        activeApples.add(a);
        if (Math.abs(vx) > 200) opts.onTouch?.(Math.min(Math.abs(vx) / 1600, 1));
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // the crown only breathes once it has been drawn
    let crownAwake = false;
    ScrollTrigger.create({
      trigger: "#now",
      start: "top 62%",
      onEnter: () => (crownAwake = true),
      onLeaveBack: () => (crownAwake = false),
    });

    const wind = { v: 0, lastY: window.scrollY, crown: createSpring(1.1, 0.75), near: createSpring(0.45, 0.7), far: createSpring(0.6, 0.7), calm: true };
    let clock = 0;
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 20);
      if (!dt) return;
      clock += dt;

      // wind: the reader's scroll velocity, smoothed, blowing east
      const y = window.scrollY;
      wind.v += ((y - wind.lastY) / dt - wind.v) * (1 - Math.exp(-dt / 0.08));
      wind.lastY = y;
      const w = Math.max(-1, Math.min(1, wind.v / 2400));
      wind.crown.target = w * 1.6;
      wind.near.target = w * 6;
      wind.far.target = w * 4;
      wind.crown.step(dt); wind.near.step(dt); wind.far.step(dt);

      const breathe = crownAwake ? 0.9 * Math.sin((clock * 2 * Math.PI) / 14) : 0;
      const lean = wind.crown.x + breathe;
      if (crown) {
        if (crownAwake || !wind.crown.idle(0.005)) crown.setAttribute("transform", `rotate(${lean.toFixed(3)} 497 600)`);
        else crown.removeAttribute("transform");
      }
      // rows only repaint while the wind is actually moving them
      const calm = wind.near.idle(0.01) && wind.far.idle(0.01);
      if (!calm || !wind.calm) {
        for (const r of rows) {
          const k = r.near ? wind.near.x : wind.far.x;
          if (calm) r.g.removeAttribute("transform");
          else r.g.setAttribute("transform", `translate(0 1058) skewX(${(-k).toFixed(3)}) translate(0 -1058)`);
        }
        wind.calm = calm;
      }

      for (const b of activeBlades) {
        b.s2.step(dt);
        if (b.s2.idle()) { b.el.removeAttribute("transform"); activeBlades.delete(b); }
        else b.el.setAttribute("transform", `rotate(${b.s2.x.toFixed(2)} ${b.x} ${b.y})`);
      }
      for (const l of activeLeaves) {
        l.s2.step(dt);
        const done = l.s2.idle();
        l.el.setAttribute("transform", leafTransform(l, done ? 0 : l.s2.x));
        if (done) activeLeaves.delete(l);
      }
      for (const a of activeApples) {
        a.s2.step(dt);
        const done = a.s2.idle();
        a.el.setAttribute("transform", appleTransform(a, done ? 0 : a.s2.x));
        if (done) activeApples.delete(a);
      }

      // chimney smoke curls up and leans with the wind
      smoke.forEach((s, i) => {
        const p = (clock / 5.5 + i * 0.5) % 1;
        s.setAttribute("transform", `translate(${(p * 14 + w * p * 40).toFixed(2)} ${(-p * 46).toFixed(2)}) rotate(${(p * 8).toFixed(2)} 307 930)`);
        (s as SVGElement).style.opacity = (Math.sin(Math.PI * p) * 1.1).toFixed(3);
      });
      if (crownAwake) {
        for (const b of birds) {
          const f = 0.6 + 0.4 * Math.cos(clock * 7 + b.ph);
          b.el.setAttribute("transform", `translate(${b.x} ${b.y}) scale(1 ${f.toFixed(3)}) translate(${-b.x} ${-b.y})`);
        }
      }

      const day = Number.parseFloat(artStyle.getPropertyValue("--day")) || 0;
      opts.onFrame?.(dt, w, 1 - day);
    };
    gsap.ticker.add(tick);
    cleanup = () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
    };
  });

  const handle = toHandle(ctx);
  return {
    ctx,
    kill: () => {
      cleanup();
      handle.kill();
    },
  };
}
