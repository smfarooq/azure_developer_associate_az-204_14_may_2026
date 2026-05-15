import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { arraysEqual } from "@/lib/utils";
import type { GradeResult } from "@/types";

export const dynamic = "force-dynamic";

interface AttemptBody {
  questionId: string;
  selectedOptionIds: string[];
  sessionId?: string;
  confidence?: number;
  timeSpentMs?: number;
  markedForReview?: boolean;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AttemptBody;
  const { questionId, selectedOptionIds, sessionId, confidence, timeSpentMs, markedForReview } = body;

  if (!questionId || !Array.isArray(selectedOptionIds)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
  const isCorrect = arraysEqual(correctIds, selectedOptionIds);

  await prisma.attempt.create({
    data: {
      questionId,
      sessionId: sessionId ?? null,
      selectedIds: JSON.stringify(selectedOptionIds),
      isCorrect,
      confidence: confidence ?? null,
      timeSpentMs: timeSpentMs ?? 0,
      markedForReview: !!markedForReview,
    },
  });

  if (sessionId) {
    await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        totalAnswered: { increment: 1 },
        totalCorrect: { increment: isCorrect ? 1 : 0 },
      },
    });
  }

  const optionRationales: Record<string, string | null> = {};
  for (const opt of question.options) optionRationales[opt.id] = opt.rationale;

  const result: GradeResult = {
    isCorrect,
    correctOptionIds: correctIds,
    selectedOptionIds,
    explanation: question.explanation,
    reference: question.reference,
    optionRationales,
  };

  return NextResponse.json(result);
}
