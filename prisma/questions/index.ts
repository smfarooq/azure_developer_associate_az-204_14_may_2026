import { computeQuestions } from "./compute";
import { storageQuestions } from "./storage";
import { securityQuestions } from "./security";
import { monitorQuestions } from "./monitor";
import { connectQuestions } from "./connect";
import type { SeedQuestion } from "./types";

export const allQuestions: SeedQuestion[] = [
  ...computeQuestions,
  ...storageQuestions,
  ...securityQuestions,
  ...monitorQuestions,
  ...connectQuestions,
];

export { computeQuestions, storageQuestions, securityQuestions, monitorQuestions, connectQuestions };
export * from "./types";
