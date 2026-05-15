import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { questionId, body } = await req.json();
  if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });

  if (!body || body.trim() === "") {
    await prisma.note.deleteMany({ where: { questionId } });
    return NextResponse.json({ ok: true, note: null });
  }

  const note = await prisma.note.upsert({
    where: { questionId },
    update: { body },
    create: { questionId, body },
  });
  return NextResponse.json({ ok: true, note });
}
