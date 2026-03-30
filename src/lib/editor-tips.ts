/** Hero image for the floating editor tip card (shared across tips). */
export const EDITOR_TIP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDRwf2vuWjVGMnzgAbLEfIcRJ0vEVbWjPVTBKsCmL3y73P4EJVMwE3c_6gLREGhiFCxAscDx-1RSwMJxbQ9YNGzl58aK9aneq4FlgZDguXte1mtl3RRw4PCw7XO19g_SEMlg9SANg9qu7qqb09ZcgBDpvT7NPYOR9QG44z6-9SqHYHohSvk1bGqpvtW5tesDUbTF_r50x02vIVof4En5--Wm1m-P_KO_WAvZn7n4CUrVfS2DoJJtGKDFy5H0v_nG6QC3m2L4--H0zU";

export type EditorTip = {
  imageAlt: string;
  body: string;
};

export const EDITOR_TIPS: readonly EditorTip[] = [
  {
    imageAlt: "Fountain pen on paper",
    body: "Let the white space breathe. Great stories need room to grow between the lines.",
  },
  {
    imageAlt: "Notebook and soft light",
    body: "Write the first draft for yourself; rewrite with the reader clearly in mind.",
  },
  {
    imageAlt: "Marked-up manuscript",
    body: "If you love your opening paragraph too much, try cutting it—often it’s only throat-clearing.",
  },
  {
    imageAlt: "Typewriter keys close-up",
    body: "One lived-in scene beats three paragraphs of summary. Show the moment, don’t report it.",
  },
  {
    imageAlt: "Coffee and open journal",
    body: "Read dialogue aloud. If you stumble, your characters will too—smooth the rhythm.",
  },
  {
    imageAlt: "Stack of handwritten pages",
    body: "End a scene one beat earlier than feels comfortable; that’s where tension lingers.",
  },
  {
    imageAlt: "Vintage desk with inkwell",
    body: "Prefer the specific—a chipped mug, rain on one window—to vague words like beautiful or sad.",
  },
  {
    imageAlt: "Writer pausing at keyboard",
    body: "Stuck? Skip ahead and write a later beat; bridges are easier to build from both banks.",
  },
  {
    imageAlt: "Blank page in morning light",
    body: "Silence on the page is a tool. Not every gap needs exposition—trust the reader.",
  },
  {
    imageAlt: "Closed laptop beside notebook",
    body: "Pick the title last; the draft usually knows what the story is really about.",
  },
] as const;

export function pickRandomEditorTip(): EditorTip {
  const i = Math.floor(Math.random() * EDITOR_TIPS.length);
  return EDITOR_TIPS[i]!;
}
