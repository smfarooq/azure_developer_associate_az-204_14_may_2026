import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiQuestion } from "@/types";
import type { Domain, Difficulty } from "@/lib/domains";
import { isDomain } from "@/lib/domains";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("q");
  const includeAnswers = searchParams.get("include") === "answers";
  const limit = Number(searchParams.get("limit") ?? "0") || undefined;
  const offset = Number(searchParams.get("offset") ?? "0") || 0;

  const where: Record<string, unknown> = {};
  if (domain && isDomain(domain)) where.domain = domain;
  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { prompt: { contains: search } },
      { topic: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const [items, total, bookmarks, notes] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { options: { orderBy: { order: "asc" } } },
      orderBy: { externalId: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.question.count({ where }),
    prisma.bookmark.findMany(),
    prisma.note.findMany(),
  ]);

  const bookmarkSet = new Set(bookmarks.map((b) => b.questionId));
  const noteMap = new Map(notes.map((n) => [n.questionId, n.body]));

  const data: ApiQuestion[] = items.map((q) => ({
    id: q.id,
    externalId: q.externalId,
    domain: q.domain as Domain,
    topic: q.topic,
    difficulty: q.difficulty as Difficulty,
    type: q.type as "single" | "multi",
    prompt: q.prompt,
    code: q.code,
    codeLanguage: q.codeLanguage,
    tags: q.tags ? q.tags.split(",").filter(Boolean) : [],
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      order: o.order,
      ...(includeAnswers ? { isCorrect: o.isCorrect, rationale: o.rationale } : {}),
    })),
    ...(includeAnswers
      ? { explanation: q.explanation, reference: q.reference }
      : {}),
    bookmarked: bookmarkSet.has(q.id),
    note: noteMap.get(q.id) ?? null,
  }));

  return NextResponse.json({ items: data, total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    externalId,
    domain,
    topic,
    difficulty,
    type,
    prompt,
    code,
    codeLanguage,
    explanation,
    reference,
    tags,
    options,
  } = body;

  if (!domain || !topic || !difficulty || !type || !prompt || !explanation || !Array.isArray(options)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await prisma.question.create({
    data: {
      externalId: externalId || `custom-${Date.now()}`,
      domain,
      topic,
      difficulty,
      type,
      prompt,
      code: code ?? null,
      codeLanguage: codeLanguage ?? null,
      explanation,
      reference: reference ?? null,
      tags: Array.isArray(tags) ? tags.join(",") : "",
      options: {
        create: options.map((o: { text: string; isCorrect: boolean; rationale?: string }, idx: number) => ({
          text: o.text,
          isCorrect: !!o.isCorrect,
          rationale: o.rationale ?? null,
          order: idx,
        })),
      },
    },
    include: { options: true },
  });

  return NextResponse.json(created, { status: 201 });
}
