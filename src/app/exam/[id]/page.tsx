"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionCard, QuestionCardSkeleton } from "@/components/question-card";
import { cn, formatDuration } from "@/lib/utils";

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
}

export default function ExamRunnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const { data, isLoading } = useQuery<ExamData>({
    queryKey: ["exam-session", sessionId],
    queryFn: async () => (await fetch(`/api/exam/${sessionId}`)).json(),
  });

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [selections, setSelections] = React.useState<Record<string, string[]>>({});
  const [marked, setMarked] = React.useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null);
  const [confirmFinish, setConfirmFinish] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Init timer
  React.useEffect(() => {
    if (!data) return;
    if (data.session.durationSec <= 0) {
      setSecondsLeft(null);
      return;
    }
    const start = new Date(data.session.startedAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = data.session.durationSec - elapsed;
      setSecondsLeft(Math.max(0, remaining));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data]);

  // Auto-finish when time runs out
  React.useEffect(() => {
    if (secondsLeft === 0 && data && !data.session.completedAt) {
      finalize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (isLoading || !data) {
    return <QuestionCardSkeleton />;
  }

  const questions = data.questions;
  const current = questions[currentIdx];
  const currentSelection = selections[current.id] ?? [];

  function setCurrentSelection(ids: string[]) {
    setSelections((prev) => ({ ...prev, [current.id]: ids }));
  }

  function toggleMark() {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  async function finalize() {
    setSubmitting(true);
    try {
      for (const q of questions) {
        const sel = selections[q.id] ?? [];
        if (sel.length === 0) continue;
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: q.id,
            selectedOptionIds: sel,
            sessionId,
            markedForReview: marked.has(q.id),
          }),
        });
      }
      await fetch(`/api/exam/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete: true }),
      });
      router.push(`/exam/${sessionId}/results`);
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount = Object.values(selections).filter((s) => s.length > 0).length;

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Exam mode</Badge>
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          {secondsLeft !== null && (
            <div
              className={cn(
                "flex items-center gap-2 font-mono text-lg font-semibold rounded-lg px-3 py-1.5 ring-1 ring-inset",
                secondsLeft < 60
                  ? "ring-rose-500/40 bg-rose-500/10 text-rose-600 animate-pulse"
                  : secondsLeft < 300
                  ? "ring-amber-500/40 bg-amber-500/10 text-amber-600"
                  : "ring-border bg-muted"
              )}
            >
              {formatDuration(secondsLeft)}
            </div>
          )}
        </div>

        <QuestionCard
          question={{
            id: current.id,
            externalId: null,
            domain: current.domain as never,
            topic: current.topic,
            difficulty: current.difficulty as never,
            type: current.type,
            prompt: current.prompt,
            code: current.code,
            codeLanguage: current.codeLanguage,
            tags: current.tags,
            options: current.options.map((o) => ({
              id: o.id,
              text: o.text,
              order: o.order,
            })),
          }}
          mode="exam"
          index={currentIdx}
          total={questions.length}
          selectedIds={currentSelection}
          onSelectionChange={setCurrentSelection}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant={marked.has(current.id) ? "default" : "outline"}
            onClick={toggleMark}
            className={marked.has(current.id) ? "" : ""}
          >
            <Flag className="h-4 w-4" />
            {marked.has(current.id) ? "Marked for review" : "Mark for review"}
          </Button>
          <div className="flex-1" />
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="success" onClick={() => setConfirmFinish(true)}>
              <CheckCircle2 className="h-4 w-4" /> Finish exam
            </Button>
          )}
        </div>
      </div>

      <aside className="space-y-3">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Question navigator
            </div>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const answered = (selections[q.id] ?? []).length > 0;
                const isMarked = marked.has(q.id);
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(i)}
                    className={cn(
                      "relative h-9 rounded-md text-xs font-medium ring-1 ring-inset transition-colors",
                      isCurrent && "ring-2 ring-primary",
                      !isCurrent && answered && "bg-primary/10 ring-primary/40 text-primary",
                      !isCurrent && !answered && "ring-border text-muted-foreground hover:bg-accent"
                    )}
                    title={`Question ${i + 1}${answered ? " (answered)" : ""}${isMarked ? " (marked)" : ""}`}
                  >
                    {i + 1}
                    {isMarked && (
                      <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground flex flex-col gap-1 pt-2">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary/20 ring-1 ring-primary/40" /> Answered
              </span>
              <span className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-amber-500 fill-amber-500" /> Marked for review
              </span>
            </div>
          </CardContent>
        </Card>
        <Button
          variant="success"
          className="w-full"
          onClick={() => setConfirmFinish(true)}
          disabled={submitting}
        >
          <CheckCircle2 className="h-4 w-4" /> Submit exam
        </Button>
      </aside>

      <Dialog open={confirmFinish} onOpenChange={setConfirmFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Submit your exam?
            </DialogTitle>
            <DialogDescription>
              You answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  {questions.length - answeredCount} question(s) left unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinish(false)}>
              Keep going
            </Button>
            <Button onClick={finalize} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit final answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
