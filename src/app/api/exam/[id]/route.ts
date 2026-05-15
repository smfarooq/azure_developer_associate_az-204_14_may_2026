import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { arraysEqual } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.examSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
      },
    },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const questionIds: string[] = JSON.parse(session.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: { orderBy: { order: "asc" } } },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const orderedQuestions = questionIds
    .map((qid) => byId.get(qid))
    .filter((q): q is NonNullable<typeof q> => !!q);

  return NextResponse.json({
    session: {
      id: session.id,
      mode: session.mode,
      durationSec: session.durationSec,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      score: session.score,
      totalAnswered: session.totalAnswered,
      totalCorrect: session.totalCorrect,
      domain: session.domain,
      difficulty: session.difficulty,
    },
    questions: orderedQuestions.map((q) => ({
      id: q.id,
      domain: q.domain,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      prompt: q.prompt,
      code: q.code,
      codeLanguage: q.codeLanguage,
      tags: q.tags ? q.tags.split(",").filter(Boolean) : [],
      explanation: q.explanation,
      reference: q.reference,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        order: o.order,
        isCorrect: o.isCorrect,
        rationale: o.rationale,
      })),
    })),
    attempts: session.attempts.map((a) => {
      const selected: string[] = JSON.parse(a.selectedIds);
      const correctIds = a.question.options.filter((o) => o.isCorrect).map((o) => o.id);
      return {
        id: a.id,
        questionId: a.questionId,
        selectedOptionIds: selected,
        correctOptionIds: correctIds,
        isCorrect: arraysEqual(selected, correctIds),
        confidence: a.confidence,
        timeSpentMs: a.timeSpentMs,
        markedForReview: a.markedForReview,
      };
    }),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const session = await prisma.examSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.complete === true) {
    const questionIds: string[] = JSON.parse(session.questionIds);
    const total = questionIds.length;
    const score = total > 0 ? (session.totalCorrect / total) * 100 : 0;
    const updated = await prisma.examSession.update({
      where: { id },
      data: { completedAt: new Date(), score },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(session);
}
