/**
 * The single source of copy for the landing page. Everything here is
 * PLACEHOLDER — structure and motion are the deliverable; real words swap in
 * later without touching any section layout.
 */

export interface ChapterStat {
  value: number;
  suffix?: string;
  label: string;
}

export interface ChapterImage {
  /** path under /public, e.g. "/story/01-origin.jpg" */
  src: string;
  alt: string;
}

export interface Chapter {
  /** stable slug, also used as the section element id */
  id: string;
  /** two-digit chapter number, e.g. "03" */
  num: string;
  /** short tracked-uppercase label (chapter indicator + eyebrow) */
  eyebrow: string;
  /** display title — arrives scrambled, resolves to this */
  title: string;
  body?: string;
  /** small meta line, e.g. "2018 · Jakarta, Indonesia" */
  meta?: string;
  /** ground the scene sits on */
  tone: "dark" | "sand";
  /**
   * The chapter's ground color — one stop on the page-long sunrise gradient
   * (night at the hero, morning gold at the epilogue). Neighbouring stops
   * blend across every section boundary, so no color change is ever hard.
   */
  ground: string;
  stats?: ChapterStat[];
  /**
   * Generated artwork (drop files into /public/story/, then fill this in).
   * Sections render a graded placeholder panel until the image exists.
   */
  image?: ChapterImage;
}

export const site = {
  name: "Drigo Alexander",
  role: "Software Engineer",
  wordmark: "DRIGO ALEXANDER",
  email: "hello@drigo.example",
  socials: [
    { label: "GitHub", href: "https://github.com/drigoalexander" },
    { label: "LinkedIn", href: "#" },
    { label: "X", href: "#" },
  ],
  heroMeta: ["EST. 2018 · JAKARTA", "PORTFOLIO · VOL. 01", "PRESENT · UNITED STATES"],
  /** copy ring for the rotating hero badge */
  badgeWords: "GROWING · KNOWING · BUILDING · GROWING · KNOWING · BUILDING · ",
} as const;

export const chapters: Chapter[] = [
  {
    id: "hero",
    num: "00",
    eyebrow: "Software Engineer",
    title: "DRIGO ALEXANDER",
    body: "A story about growing — from a small room to the wider world.",
    tone: "dark",
    ground: "#14110b",
  },
  {
    id: "origin",
    num: "01",
    eyebrow: "Origin",
    title: "IT STARTED SMALL.",
    body:
      "A first real role at a small company in Indonesia. Wearing every hat, " +
      "fixing what broke, learning by shipping — the whole world fit inside " +
      "one room, and that was enough to begin.",
    meta: "2018 · Jakarta, Indonesia",
    tone: "dark",
    ground: "#1f1d17",
  },
  {
    id: "craft",
    num: "02",
    eyebrow: "Craft",
    title: "LEARNING THE CRAFT.",
    body:
      "Discipline over inspiration. Fundamentals, code review, shipping under " +
      "constraints — the slow, deliberate practice that turns a job into a " +
      "craft and a beginner into an engineer.",
    meta: "The deliberate years",
    tone: "dark",
    ground: "#26241d",
    stats: [
      { value: 6, label: "Years shipping" },
      { value: 24, suffix: "+", label: "Projects delivered" },
    ],
  },
  {
    id: "knowing",
    num: "03",
    eyebrow: "The turn inward",
    title: "KNOWING MYSELF.",
    body:
      "Somewhere between the deadlines, a quieter question: what is this " +
      "actually for? Understanding what drives the work — clarity, care, the " +
      "long game — mattered more than any framework. The noise resolved into " +
      "a signal, and the signal had a direction.",
    meta: "The quiet chapter",
    tone: "dark",
    ground: "#323026",
  },
  {
    id: "leap",
    num: "04",
    eyebrow: "The decision",
    title: "THE LEAP.",
    body:
      "Choosing to reach beyond the local. Not to leave something behind — " +
      "to test whether the growth was real. The risk was the point; the " +
      "stretch was the reward.",
    meta: "The stretch",
    tone: "dark",
    ground: "#3f3b2f",
  },
  {
    id: "now",
    num: "05",
    eyebrow: "Now",
    title: "THE WIDER WORLD.",
    body:
      "An AI company in the United States. The same person from the small " +
      "room — with a bigger canvas, sharper tools, and the clarity to use " +
      "them well.",
    meta: "Present · United States",
    tone: "sand",
    ground: "#a69374",
    stats: [
      { value: 12, label: "Time zones shipped across" },
      { value: 3, suffix: "M+", label: "People touched by the work" },
    ],
  },
  {
    id: "ethos",
    num: "06",
    eyebrow: "How I work",
    title: "CRAFT. OWNERSHIP. CLARITY.",
    body:
      "Build it like you'll maintain it forever. Own the outcome, not the " +
      "ticket. Say the simple thing plainly.",
    tone: "sand",
    ground: "#b09e7f",
  },
  {
    id: "contact",
    num: "07",
    eyebrow: "Epilogue",
    title: "LET'S BUILD SOMETHING.",
    body:
      "Look up — the apples haven't fallen yet. This is only the beginning " +
      "of the journey; the harvest is still ahead.",
    meta: "Anywhere · Anytime",
    tone: "sand",
    ground: "#c3ab80",
  },
];
