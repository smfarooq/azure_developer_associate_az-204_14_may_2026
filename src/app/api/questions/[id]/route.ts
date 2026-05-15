import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await prisma.question.findUnique({
    where: { id },
    include: { options: { orderBy: { order: "asc" } } },
  });
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [bookmark, note] = await Promise.all([
    prisma.bookmark.findUnique({ where: { questionId: q.id } }),
    prisma.note.findUnique({ where: { questionId: q.id } }),
  ]);

  return NextResponse.json({
    id: q.id,
    externalId: q.externalId,
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
    bookmarked: !!bookmark,
    note: note?.body ?? null,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["domain", "topic", "difficulty", "type", "prompt", "code", "codeLanguage", "explanation", "reference"]) {
    if (k in body) data[k] = body[k];
  }
  if ("tags" in body) data.tags = Array.isArray(body.tags) ? body.tags.join(",") : body.tags;

  const updated = await prisma.question.update({
    where: { id },
    data,
    include: { options: true },
  });

  if (Array.isArray(body.options)) {
    await prisma.option.deleteMany({ where: { questionId: id } });
    await prisma.option.createMany({
      data: body.options.map((o: { text: string; isCorrect: boolean; rationale?: string }, idx: number) => ({
        questionId: id,
        text: o.text,
        isCorrect: !!o.isCorrect,
        rationale: o.rationale ?? null,
        order: idx,
      })),
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
