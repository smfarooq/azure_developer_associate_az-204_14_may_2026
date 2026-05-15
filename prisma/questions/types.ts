export type Domain = "compute" | "storage" | "security" | "monitor" | "connect";
export type Difficulty = "easy" | "medium" | "hard";

export interface SeedOption {
  text: string;
  isCorrect: boolean;
  rationale?: string;
}

export interface SeedQuestion {
  externalId: string;
  domain: Domain;
  topic: string;
  difficulty: Difficulty;
  type: "single" | "multi";
  prompt: string;
  code?: string;
  codeLanguage?: string;
  explanation: string;
  reference?: string;
  tags: string[];
  options: SeedOption[];
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  compute: "Develop Azure compute solutions",
  storage: "Develop for Azure storage",
  security: "Implement Azure security",
  monitor: "Monitor, troubleshoot, and optimize Azure solutions",
  connect: "Connect to and consume Azure services and third-party services",
};

export const DOMAIN_WEIGHT: Record<Domain, string> = {
  compute: "25-30%",
  storage: "15-20%",
  security: "20-25%",
  monitor: "15-20%",
  connect: "15-20%",
};
