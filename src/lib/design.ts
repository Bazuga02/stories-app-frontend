import designFile from "../../design.json";

export const design = designFile.designSystem;

/** CSS variable names aligned with globals.css / design.json */
export const cssVar = {
  dark: "var(--color-dark)",
  accent: "var(--color-accent)",
  background: "var(--color-background)",
  surface: "var(--color-surface)",
  white: "var(--color-white)",
} as const;

/** Tailwind-friendly class bundles strictly from the design system */
export const ds = {
  page: "min-h-screen bg-background text-dark",
  surface: "bg-surface",
  card: "rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[var(--motion-default)] ease-[var(--motion-ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
  cardInner: "rounded-[var(--radius-lg)] bg-white p-8 shadow-[var(--shadow-card)]",
  input:
    "w-full rounded-[var(--radius-md)] border-[1.5px] border-dark/15 bg-white px-4 py-3 text-[1rem] text-dark placeholder:text-dark/40 outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] focus:border-dark focus:ring-2 focus:ring-dark/10",
  navBar: "bg-surface border-b border-dark/5",
} as const;
