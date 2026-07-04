import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { registerEases, EASES } from "./eases";

let registered = false;

/**
 * Registers every GSAP plugin exactly once and applies global defaults.
 * SSR-safe: no-ops on the server. Returns the configured `gsap` instance.
 */
export function registerGsap(): typeof gsap {
  if (registered || typeof window === "undefined") return gsap;

  gsap.registerPlugin(
    ScrollTrigger,
    Observer,
    Flip,
    SplitText,
    Draggable,
    InertiaPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
    ScrollToPlugin,
  );
  registerEases();

  gsap.defaults({ ease: EASES.sweep, duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger, Observer, Flip, SplitText, Draggable };
