export type Domain = "compute" | "storage" | "security" | "monitor" | "connect";
export type Difficulty = "easy" | "medium" | "hard";

export const DOMAINS: Domain[] = ["compute", "storage", "security", "monitor", "connect"];

export const DOMAIN_LABELS: Record<Domain, string> = {
  compute: "Develop Azure compute solutions",
  storage: "Develop for Azure storage",
  security: "Implement Azure security",
  monitor: "Monitor, troubleshoot, and optimize Azure solutions",
  connect: "Connect to and consume Azure services and third-party services",
};

export const DOMAIN_SHORT: Record<Domain, string> = {
  compute: "Compute",
  storage: "Storage",
  security: "Security",
  monitor: "Monitor",
  connect: "Connect",
};

export const DOMAIN_WEIGHT: Record<Domain, string> = {
  compute: "25-30%",
  storage: "15-20%",
  security: "20-25%",
  monitor: "15-20%",
  connect: "15-20%",
};

export const DOMAIN_COLOR: Record<Domain, string> = {
  compute: "from-blue-500 to-indigo-500",
  storage: "from-emerald-500 to-teal-500",
  security: "from-rose-500 to-orange-500",
  monitor: "from-amber-500 to-yellow-500",
  connect: "from-purple-500 to-fuchsia-500",
};

export const DOMAIN_RING: Record<Domain, string> = {
  compute: "ring-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  storage: "ring-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  security: "ring-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  monitor: "ring-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  connect: "ring-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/30",
};

export function isDomain(value: string): value is Domain {
  return (DOMAINS as string[]).includes(value);
}
