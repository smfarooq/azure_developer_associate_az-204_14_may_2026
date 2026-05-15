import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shuffle } from "@/lib/utils";
import { isDomain } from "@/lib/domains";

export const dynamic = "force-dynamic";

interface CreateExamBody {
  mode: "exam" | "practice" | "flashcards";
  count?: number;
  domain?: string;
  difficulty?: string;
  durationSec?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateExamBody;
  const { mode, count = 30, durationSec = 60 * 60 } = body;

  const where: Record<string, unknown> = {};
  if (body.domain && isDomain(body.domain)) where.domain = body.domain;
  if (body.difficulty && ["easy", "medium", "hard"].includes(body.difficulty))
    where.difficulty = body.difficulty;

  const candidates = await prisma.question.findMany({
    where,
    select: { id: true },
  });

  if (candidates.length === 0) {
    return NextResponse.json({ error: "No questions match these filters" }, { status: 400 });
  }

  const picked = shuffle(candidates).slice(0, Math.min(count, candidates.length));
  const ids = picked.map((p) => p.id);

  const session = await prisma.examSession.create({
    data: {
      mode,
      domain: body.domain ?? null,
      difficulty: body.difficulty ?? null,
      questionIds: JSON.stringify(ids),
      durationSec,
    },
  });

  return NextResponse.json({
    sessionId: session.id,
    mode,
    questionIds: ids,
    durationSec,
    startedAt: session.startedAt,
  });
}
