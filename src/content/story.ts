/**
 * The single source of copy for the landing page. The real journey:
 * Sari Tirta (the first job, the mentor) → NexLaw AI (SF Bay Area, a team
 * across Malaysia and Germany) → Mazecare (Hong Kong, the human lesson) →
 * Tesserac AI (now, Wyoming office, remote). The through-line: a tree never
 * leaves where it was planted, it grows until it reaches. Every caption
 * carries one real detail and one line about what the tree is doing.
 * House rules: no em-dashes, no "not X, it's Y", no proverb endings.
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
} as const;

export const chapters: Chapter[] = [
  {
    id: "hero",
    num: "00",
    eyebrow: "Software Engineer · Jakarta",
    title: "DRIGO ALEXANDER",
    body:
      "I've built software with teams on three continents. " +
      "All of it from Jakarta.",
    tone: "dark",
    ground: "#14110b",
  },
  {
    id: "origin",
    num: "01",
    eyebrow: "Sprout",
    title: "THE FIRST TWO LEAVES.",
    body:
      "My first job was at Sari Tirta Indonesia, in Jakarta. My mentor " +
      "there taught me how to build software. She also taught me who to " +
      "be while I built it. Those are the first two leaves on this tree. " +
      "Everything after grew from them.",
    meta: "Sari Tirta Indonesia · Jakarta",
    tone: "dark",
    ground: "#1f1d17",
  },
  {
    id: "craft",
    num: "02",
    eyebrow: "Sapling",
    title: "FOUR TIME ZONES.",
    body:
      "NexLaw AI was my first remote job. The CEO was in San Francisco, " +
      "my backend lead was in Germany, most of the team was in Malaysia, " +
      "and I was in Jakarta. Days went to Malaysia, evenings to Germany, " +
      "late nights to San Francisco. I kept showing up, and it paid off. " +
      "They trusted me enough to bring in my own team.",
    meta: "NexLaw AI · San Francisco Bay Area",
    tone: "dark",
    ground: "#26241d",
  },
  {
    id: "knowing",
    num: "03",
    eyebrow: "Roots",
    title: "HE GUARDED OUR EVENINGS.",
    body:
      "Mazecare, out of Hong Kong, builds an AI platform for clinics, " +
      "hospitals and health insurers. Our CEO taught me to treat people " +
      "as people. He protected our evenings as if they were his own. I " +
      "didn't plan to leave, and it hurt when I did. This is where the " +
      "roots went down. The rest of the tree stands on them.",
    meta: "Mazecare · Hong Kong",
    tone: "dark",
    ground: "#323026",
  },
  {
    id: "leap",
    num: "04",
    eyebrow: "Branch",
    title: "THE LEAP.",
    body:
      "After that first job, every step came down to the same choice. " +
      "Take the safe job close to home, or reach for a team in another " +
      "time zone. I reached every time. Not every reach held, and a few " +
      "of them I'd rather not put on a website. This branch grew out of " +
      "the ones that did.",
    meta: "Between Hong Kong and Wyoming",
    tone: "dark",
    ground: "#3f3b2f",
  },
  {
    id: "now",
    num: "05",
    eyebrow: "Canopy",
    title: "OFFICE IN WYOMING.",
    body:
      "At Tesserac AI, my team builds crafted software for enterprise " +
      "companies. The team is from Serbia, Germany, Spain and Malaysia, " +
      "and I'm still in Jakarta. The canopy is just wider now.",
    meta: "Tesserac AI · Wyoming, USA · Now",
    tone: "sand",
    ground: "#a69374",
  },
  {
    id: "ethos",
    num: "06",
    eyebrow: "Apples",
    title: "SOFTWARE, LIKE ART.",
    body:
      "Software that works is the minimum. I care about the part people " +
      "feel. How fast it answers. Whether the next step is obvious. " +
      "Whether they open it again tomorrow. Those are the apples. I could " +
      "have made this portfolio a list of jobs. I drew a tree.",
    tone: "sand",
    ground: "#b09e7f",
  },
  {
    id: "contact",
    num: "07",
    eyebrow: "Whole tree",
    title: "WHAT GROWS NEXT?",
    body:
      "Look up. None of the apples have fallen, and the tree isn't " +
      "finished. If you're building something people should love to use, " +
      "tell me about it. Email is the fastest way to reach me.",
    meta: "Grown in Jakarta",
    tone: "sand",
    ground: "#c3ab80",
  },
];
