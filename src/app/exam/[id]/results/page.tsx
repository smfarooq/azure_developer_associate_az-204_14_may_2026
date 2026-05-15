"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, BookOpen, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/question-card";
import { DOMAIN_SHORT, DOMAINS, DOMAIN_COLOR } from "@/lib/domains";
import { cn } from "@/lib/utils";
import type { Domain } from "@/lib/domains";

interface ExamData {
  session: {
    id: string;
    mode: string;
    durationSec: number;
    startedAt: string;
    completedAt: string | null;
    score: number | null;
    totalAnswered: number;
    totalCorrect: number;
  };
  questions: Array<{
    id: string;
    domain: string;
    topic: string;
    difficulty: string;
    type: "single" | "multi";
    prompt: string;
    code: string | null;
    codeLanguage: string | null;
    tags: string[];
    explanation: string;
    reference: string | null;
    options: Array<{
      id: string;
      text: string;
      order: number;
      isCorrect: boolean;
      rationale: string | null;
    }>;
  }>;
  attempts: Array<{
    id: string;
    questionId: string;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    isCorrect: boolean;
    markedForReview: boolean;
  }>;
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<ExamData>({
    queryKey: ["exam-session", params.id],
    queryFn: async () => (await fetch(`/api/exam/${params.id}`)).json(),
  });

  if (isLoading || !data) {
    return <div className="text-center py-20 text-muted-foreground">Loading your results…</div>;
  }

  const total = data.questions.length;
  const score = data.session.score ?? 0;
  const passed = score >= 70;

  const domainStats = DOMAINS.map((d) => {
    const qids = new Set(data.questions.filter((q) => q.domain === d).map((q) => q.id));
    const total = qids.size;
    const dattempts = data.attempts.filter((a) => qids.has(a.questionId));
    const correct = dattempts.filter((a) => a.isCorrect).length;
    return { domain: d as Domain, total, attempted: dattempts.length, correct };
  }).filter((d) => d.total > 0);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div
            className={cn(
              "p-8 text-center text-white",
              passed
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-amber-500 to-rose-500"
            )}
          >
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <div className="text-sm uppercase tracking-wide opacity-90">Final score</div>
            <div className="text-6xl font-black tabular-nums mt-1">{Math.round(score)}%</div>
            <div className="mt-2 text-lg opacity-90">
              {data.session.totalCorrect} out of {total} correct
            </div>
            <Badge variant="outline" className="mt-4 bg-white/20 text-white border-white/40">
              {passed ? "Passing mark" : "Keep practicing — passing is ~70%"}
            </Badge>
          </div>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domainStats.map((d) => {
            const pct = d.attempted > 0 ? (d.correct / d.attempted) * 100 : 0;
            return (
              <div key={d.domain}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{DOMAIN_SHORT[d.domain]}</span>
                  <span className="text-muted-foreground">
                    {d.correct}/{d.total} ({Math.round(pct)}%)
                  </span>
                </div>
                <Progress
                  value={pct}
                  indicatorClassName={cn("bg-gradient-to-r", DOMAIN_COLOR[d.domain])}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/exam">
            <RotateCw className="h-4 w-4" /> Take another exam
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice">
            <BookOpen className="h-4 w-4" /> Practice weak areas
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/stats">View overall stats</Link>
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Review every question</h2>
        {data.questions.map((q, idx) => {
          const attempt = data.attempts.find((a) => a.questionId === q.id);
          const rationales: Record<string, string | null> = {};
          for (const o of q.options) rationales[o.id] = o.rationale;
          return (
            <QuestionCard
              key={q.id}
              index={idx}
              total={total}
              question={{
                id: q.id,
                externalId: null,
                domain: q.domain as Domain,
                topic: q.topic,
                difficulty: q.difficulty as never,
                type: q.type,
                prompt: q.prompt,
                code: q.code,
                codeLanguage: q.codeLanguage,
                tags: q.tags,
                explanation: q.explanation,
                reference: q.reference,
                options: q.options.map((o) => ({
                  id: o.id,
                  text: o.text,
                  order: o.order,
                })),
              }}
              mode="review"
              reviewResult={{
                correctOptionIds: q.options.filter((o) => o.isCorrect).map((o) => o.id),
                selectedOptionIds: attempt?.selectedOptionIds ?? [],
                optionRationales: rationales,
              }}
            />
          );
        })}
      </section>
    </div>
  );
}
