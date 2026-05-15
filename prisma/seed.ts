import { PrismaClient } from "@prisma/client";
import { allQuestions } from "./questions";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${allQuestions.length} questions...`);

  for (const q of allQuestions) {
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (q.type === "single" && correctCount !== 1) {
      console.warn(`  ⚠ ${q.externalId}: type=single but ${correctCount} correct options`);
    }
    if (q.type === "multi" && correctCount < 2) {
      console.warn(`  ⚠ ${q.externalId}: type=multi but only ${correctCount} correct options`);
    }

    await prisma.question.upsert({
      where: { externalId: q.externalId },
      update: {
        domain: q.domain,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        prompt: q.prompt,
        code: q.code ?? null,
        codeLanguage: q.codeLanguage ?? null,
        explanation: q.explanation,
        reference: q.reference ?? null,
        tags: q.tags.join(","),
        options: {
          deleteMany: {},
          create: q.options.map((o, idx) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            rationale: o.rationale ?? null,
            order: idx,
          })),
        },
      },
      create: {
        externalId: q.externalId,
        domain: q.domain,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        prompt: q.prompt,
        code: q.code ?? null,
        codeLanguage: q.codeLanguage ?? null,
        explanation: q.explanation,
        reference: q.reference ?? null,
        tags: q.tags.join(","),
        options: {
          create: q.options.map((o, idx) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            rationale: o.rationale ?? null,
            order: idx,
          })),
        },
      },
    });
  }

  const total = await prisma.question.count();
  console.log(`✔ Seed complete. Total questions in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
