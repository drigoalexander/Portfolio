/**
 * The single source of copy for the landing page. The real journey:
 * Sari Tirta (the first job, the mentor) → NexLaw AI (SF Bay Area, a team
 * across Malaysia and Germany) → Mazecare (Hong Kong, the human lesson) →
 * Tesserac AI (now, Wyoming office, remote). The through-line: a local boy
 * from Indonesia breaks through a ceiling to build with the world, and it
 * costs him to get there. Every caption carries one real detail and one
 * line about what the tree is doing.
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
    eyebrow: "Software Engineer · Indonesia",
    title: "DRIGO ALEXANDER",
    body:
      "A local boy from Indonesia, now building with talented people " +
      "across the world. This tree is how I got here, and what it cost.",
    tone: "dark",
    ground: "#14110b",
  },
  {
    id: "origin",
    num: "01",
    eyebrow: "Sprout",
    title: "THE FIRST TWO LEAVES.",
    body:
      "My first job was a local one, at Sari Tirta Indonesia in " +
      "Jakarta. My mentor there taught me how to build software, and who " +
      "to be while I built it. Those are the first two leaves on this " +
      "tree. Back then, the world felt very far away.",
    meta: "Sari Tirta Indonesia · Jakarta",
    tone: "dark",
    ground: "#1f1d17",
  },
  {
    id: "craft",
    num: "02",
    eyebrow: "Sapling",
    title: "THE PROVING GROUND.",
    body:
      "NexLaw AI was my first global team, run out of the San Francisco " +
      "Bay Area. I was the local developer from Jakarta, and I felt I had " +
      "to prove I belonged there. So I worked San Francisco's hours on " +
      "top of my own. It was heavy, and it paid off. They trusted me " +
      "enough to bring in my own team.",
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
      "At Mazecare, a healthcare AI company in Hong Kong, I met a CEO who " +
      "treated people as people. After all those late nights, he " +
      "protected our evenings as if they were his own. I didn't plan to " +
      "leave, and it hurt when I did. This is where the roots went down. " +
      "The rest of the tree stands on them.",
    meta: "Mazecare · Hong Kong",
    tone: "dark",
    ground: "#323026",
  },
  {
    id: "leap",
    num: "04",
    eyebrow: "Branch",
    title: "I BLED FOR IT.",
    body:
      "As a local Indonesian developer, the best teams in the world felt " +
      "out of reach. There was a ceiling, and I could feel it. Getting " +
      "through it cost me late nights, doubt, and a goodbye I didn't " +
      "plan. I kept going anyway, even when it hurt. This branch is the " +
      "part that broke through.",
    meta: "Between Hong Kong and Wyoming",
    tone: "dark",
    ground: "#3f3b2f",
  },
  {
    id: "now",
    num: "05",
    eyebrow: "Canopy",
    title: "THE WIDER WORLD.",
    body:
      "Today I build crafted software for enterprise companies at " +
      "Tesserac AI, with talented people from across the world. I'm still " +
      "the local boy from Indonesia. The canopy just grew through the " +
      "ceiling.",
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
      "tell me about it. If you're a local developer staring at the same " +
      "ceiling, write to me too.",
    meta: "Grown in Jakarta",
    tone: "sand",
    ground: "#c3ab80",
  },
];
