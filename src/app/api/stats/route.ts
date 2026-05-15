import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DOMAINS } from "@/lib/domains";
import type { Domain, Difficulty } from "@/lib/domains";
import type { StatsSummary } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalQuestions, attempts, sessions, questions] = await Promise.all([
    prisma.question.count(),
    prisma.attempt.findMany({
      include: { question: { select: { domain: true, difficulty: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.examSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.question.findMany({ select: { id: true, domain: true, difficulty: true } }),
  ]);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const correctRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
  const uniqueQuestionsAttempted = new Set(attempts.map((a) => a.questionId)).size;

  const byDomain = DOMAINS.map((d) => {
    const dqs = questions.filter((q) => q.domain === d);
    // Use most recent attempt per question for accuracy
    const latestPerQuestion = new Map<string, boolean>();
    for (const a of attempts) {
      if (a.question.domain !== d) continue;
      if (!latestPerQuestion.has(a.questionId)) latestPerQuestion.set(a.questionId, a.isCorrect);
    }
    const attempted = latestPerQuestion.size;
    const correct = [...latestPerQuestion.values()].filter(Boolean).length;
    return {
      domain: d as Domain,
      total: dqs.length,
      attempted,
      correct,
      accuracy: attempted > 0 ? correct / attempted : 0,
    };
  });

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const byDifficulty = difficulties.map((diff) => {
    const dattempts = attempts.filter((a) => a.question.difficulty === diff);
    const correct = dattempts.filter((a) => a.isCorrect).length;
    return {
      difficulty: diff,
      total: dattempts.length,
      correct,
      accuracy: dattempts.length > 0 ? correct / dattempts.length : 0,
    };
  });

  // Readiness: weighted by domain coverage * accuracy
  // Each domain contributes max 100 weighted; missing coverage caps the contribution.
  let readinessScore = 0;
  for (const d of byDomain) {
    if (d.total === 0) continue;
    const coverage = Math.min(1, d.attempted / Math.max(d.total, 1));
    const acc = d.accuracy;
    readinessScore += coverage * acc * 20; // 5 domains × 20 = 100
  }
  readinessScore = Math.round(readinessScore);

  const summary: StatsSummary = {
    totalQuestions,
    totalAttempts,
    uniqueQuestionsAttempted,
    correctRate,
    byDomain,
    byDifficulty,
    readinessScore,
    recentSessions: sessions.map((s) => ({
      id: s.id,
      mode: s.mode,
      score: s.score,
      totalAnswered: s.totalAnswered,
      totalCorrect: s.totalCorrect,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
    })),
  };

  return NextResponse.json(summary);
}
