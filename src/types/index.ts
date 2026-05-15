import type { Domain, Difficulty } from "@/lib/domains";

export type { Domain, Difficulty };

export interface ApiOption {
  id: string;
  text: string;
  order: number;
  // Server omits isCorrect/rationale during exams; included for practice/learn mode and after grading
  isCorrect?: boolean;
  rationale?: string | null;
}

export interface ApiQuestion {
  id: string;
  externalId: string | null;
  domain: Domain;
  topic: string;
  difficulty: Difficulty;
  type: "single" | "multi";
  prompt: string;
  code: string | null;
  codeLanguage: string | null;
  tags: string[];
  options: ApiOption[];
  // Only present in learn/practice mode or after grading
  explanation?: string;
  reference?: string | null;
  bookmarked?: boolean;
  note?: string | null;
}

export interface GradeResult {
  isCorrect: boolean;
  correctOptionIds: string[];
  selectedOptionIds: string[];
  explanation: string;
  reference: string | null;
  optionRationales: Record<string, string | null>;
}

export interface StatsSummary {
  totalQuestions: number;
  totalAttempts: number;
  uniqueQuestionsAttempted: number;
  correctRate: number;
  byDomain: {
    domain: Domain;
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  }[];
  byDifficulty: { difficulty: Difficulty; total: number; correct: number; accuracy: number }[];
  recentSessions: {
    id: string;
    mode: string;
    score: number | null;
    totalAnswered: number;
    totalCorrect: number;
    startedAt: string;
    completedAt: string | null;
  }[];
  readinessScore: number;
}
