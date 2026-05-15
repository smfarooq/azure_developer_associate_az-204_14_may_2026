import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const bookmarks = await prisma.bookmark.findMany({
    include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    bookmarks.map((b) => ({
      questionId: b.questionId,
      createdAt: b.createdAt,
      question: {
        id: b.question.id,
        domain: b.question.domain,
        topic: b.question.topic,
        difficulty: b.question.difficulty,
        prompt: b.question.prompt,
      },
    }))
  );
}

export async function POST(req: NextRequest) {
  const { questionId } = await req.json();
  if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });
  const existing = await prisma.bookmark.findUnique({ where: { questionId } });
  if (existing) {
    await prisma.bookmark.delete({ where: { questionId } });
    return NextResponse.json({ bookmarked: false });
  }
  await prisma.bookmark.create({ data: { questionId } });
  return NextResponse.json({ bookmarked: true });
}
