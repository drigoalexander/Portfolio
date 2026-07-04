/**
 * The single source of copy for the landing page — the real journey:
 * Sari Tirta (the first job, the mentor) → NexLaw AI (the remote grind,
 * Australia → SF) → Mazecare (Hong Kong, the human lesson) → Tesserac AI
 * (now). The through-line is GROWING — an own-made path with its ups and
 * downs — and the belief that software should be built like art: not just
 * functioning, but an experience people want to use.
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
  /** small meta line, e.g. "Mazecare · Hong Kong" */
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
  email: "drigosihombinga@gmail.com",
  socials: [
    { label: "GitHub", href: "https://github.com/drigoalexander" },
    { label: "LinkedIn", href: "#" },
    { label: "X", href: "#" },
  ],
  heroMeta: ["JAKARTA, INDONESIA", "PORTFOLIO · VOL. 01", "NOW · TESSERAC AI"],
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
      "A first job at Sari Tirta Indonesia — and a mentor who gave me more " +
      "than a craft. She taught me how to build software and how to be a " +
      "person while building it. Everything after grew from her lessons.",
    meta: "Sari Tirta Indonesia · Jakarta",
    tone: "dark",
    ground: "#1f1d17",
  },
  {
    id: "craft",
    num: "02",
    eyebrow: "The grind",
    title: "THE PROVING GROUND.",
    body:
      "NexLaw AI, my first remote company — an ocean away in Australia. The " +
      "pressure was heavy; the growth was heavier. I ground it out, proved " +
      "my place, and earned the trust to bring my own team through the " +
      "door. Then the company moved to the SF Bay Area — and the world got " +
      "wider.",
    meta: "NexLaw AI · Australia → SF Bay Area",
    tone: "dark",
    ground: "#26241d",
  },
  {
    id: "knowing",
    num: "03",
    eyebrow: "The turn inward",
    title: "KNOWING WHAT MATTERS.",
    body:
      "Mazecare, Hong Kong. My CEO taught me what no framework could: treat " +
      "people as people. He guarded our evenings like they were his own, " +
      "and showed me that respect is an engineering practice too. Leaving " +
      "wasn't the plan — but even hard goodbyes become roots.",
    meta: "Mazecare · Hong Kong",
    tone: "dark",
    ground: "#323026",
  },
  {
    id: "leap",
    num: "04",
    eyebrow: "The decision",
    title: "THE LEAP.",
    body:
      "Growth kept asking the same question: stay safe, or stay true? I " +
      "kept choosing my own path — out of the local, out of the " +
      "comfortable, through downs that made the ups mean something. The " +
      "risk was the point; the stretch was the reward.",
    meta: "Ups, downs, onward",
    tone: "dark",
    ground: "#3f3b2f",
  },
  {
    id: "now",
    num: "05",
    eyebrow: "Now",
    title: "THE WIDER WORLD.",
    body:
      "Tesserac AI — Wyoming, USA. The same person from the small room, " +
      "still growing on purpose: building products that carry real value " +
      "to the team and to the people who use them.",
    meta: "Present · Tesserac AI · USA",
    tone: "sand",
    ground: "#a69374",
  },
  {
    id: "ethos",
    num: "06",
    eyebrow: "How I work",
    title: "SOFTWARE, LIKE ART.",
    body:
      "I don't build software that merely works. I build software people " +
      "want to use — where the experience is the feature: considered, " +
      "felt, cared for. Function is the floor. The art is everything " +
      "above it.",
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
