import gsap from "gsap";

export type Target = string | Element | Element[];

/** The object returned by gsap.context() — scoped selectors + revert(). */
export type AnimContext = ReturnType<typeof gsap.context>;

/** Uniform return contract for every composable (ISP). */
export interface AnimHandle {
  ctx: AnimContext;
  kill: () => void;
}

/** Builds a handle from a context, wiring kill() to full revert. */
export function toHandle(ctx: AnimContext): AnimHandle {
  return { ctx, kill: () => ctx.revert() };
}
