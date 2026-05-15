"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  ExternalLink,
  Lightbulb,
  StickyNote,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { cn, shuffle } from "@/lib/utils";
import {
  DIFFICULTY_COLOR,
  DOMAIN_RING,
  DOMAIN_SHORT,
  type Domain,
  type Difficulty,
} from "@/lib/domains";
import type { ApiQuestion, GradeResult } from "@/types";

interface QuestionCardProps {
  question: ApiQuestion;
  mode: "practice" | "exam" | "review";
  index?: number;
  total?: number;
  // exam-mode controlled state
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  // review-mode preloaded grade
  reviewResult?: Pick<GradeResult, "correctOptionIds" | "selectedOptionIds" | "optionRationales">;
  // callbacks
  onBookmarkToggle?: (newState: boolean) => void;
  onNoteSave?: (body: string) => void;
}

export function QuestionCard({
  question,
  mode,
  index,
  total,
  selectedIds: controlledSelection,
  onSelectionChange,
  reviewResult,
  onBookmarkToggle,
  onNoteSave,
}: QuestionCardProps) {
  const [localSelection, setLocalSelection] = React.useState<string[]>([]);
  const selected = controlledSelection ?? localSelection;

  const [submitting, setSubmitting] = React.useState(false);
  const [graded, setGraded] = React.useState<GradeResult | null>(
    reviewResult
      ? {
          isCorrect: false,
          correctOptionIds: reviewResult.correctOptionIds,
          selectedOptionIds: reviewResult.selectedOptionIds,
          explanation: question.explanation ?? "",
          reference: question.reference ?? null,
          optionRationales: reviewResult.optionRationales,
        }
      : null
  );
  const [showHint, setShowHint] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(!!question.bookmarked);
  const [showNote, setShowNote] = React.useState(false);
  const [noteText, setNoteText] = React.useState(question.note ?? "");

  // In review mode, preserve the original (stored) order so users can correlate
  // their results with what they saw during the exam. Otherwise, shuffle options
  // each time the question becomes active so position doesn't leak the answer.
  const displayOptions = React.useMemo(
    () => (mode === "review" ? question.options : shuffle(question.options)),
    [question.id, mode] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // reset state when question changes
  React.useEffect(() => {
    setLocalSelection([]);
    setGraded(
      reviewResult
        ? {
            isCorrect: false,
            correctOptionIds: reviewResult.correctOptionIds,
            selectedOptionIds: reviewResult.selectedOptionIds,
            explanation: question.explanation ?? "",
            reference: question.reference ?? null,
            optionRationales: reviewResult.optionRationales,
          }
        : null
    );
    setShowHint(false);
    setBookmarked(!!question.bookmarked);
    setNoteText(question.note ?? "");
  }, [question.id, question.bookmarked, question.note, question.explanation, question.reference, reviewResult]);

  const isLocked = mode === "review" || graded !== null;

  function toggleOption(optionId: string) {
    if (isLocked) return;
    let next: string[];
    if (question.type === "single") {
      next = [optionId];
    } else {
      next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
    }
    if (controlledSelection !== undefined && onSelectionChange) onSelectionChange(next);
    else setLocalSelection(next);
  }

  async function submit() {
    if (selected.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedOptionIds: selected,
        }),
      });
      const data: GradeResult = await res.json();
      setGraded(data);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBookmark() {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id }),
    });
    const data = await res.json();
    setBookmarked(data.bookmarked);
    onBookmarkToggle?.(data.bookmarked);
  }

  async function saveNote() {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, body: noteText }),
    });
    onNoteSave?.(noteText);
  }

  const correctIds = graded?.correctOptionIds ?? [];

  function optionState(optionId: string): "default" | "selected" | "correct" | "incorrect" | "missed" {
    const isSelected = selected.includes(optionId);
    if (!graded && mode !== "review") return isSelected ? "selected" : "default";
    const isCorrect = correctIds.includes(optionId);
    if (isSelected && isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    if (!isSelected && isCorrect) return "missed";
    return "default";
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                DOMAIN_RING[question.domain as Domain]
              )}
            >
              {DOMAIN_SHORT[question.domain as Domain]}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
                DIFFICULTY_COLOR[question.difficulty as Difficulty]
              )}
            >
              {question.difficulty}
            </span>
            <Badge variant="outline">{question.topic}</Badge>
            {question.type === "multi" && <Badge variant="secondary">Multi-select</Badge>}
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              {typeof index === "number" && typeof total === "number" && (
                <span>
                  Question {index + 1} / {total}
                </span>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleBookmark}
                aria-label="Bookmark question"
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-amber-500" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold leading-snug mt-3 whitespace-pre-line">
            {question.prompt}
          </h2>

          {question.code && (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm">
              <code className={`language-${question.codeLanguage ?? "text"}`}>{question.code}</code>
            </pre>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {question.type === "multi" && (
            <p className="text-xs text-muted-foreground">
              Select all that apply. {question.type === "multi" ? "You must select every correct option to get credit." : ""}
            </p>
          )}

          <div className="grid gap-2">
            {displayOptions.map((option, idx) => {
              const state = optionState(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  disabled={isLocked}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    state === "default" && !isLocked && "border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer",
                    state === "default" && isLocked && "border-border opacity-70",
                    state === "selected" && "border-primary/60 bg-primary/5",
                    state === "correct" && "border-emerald-500/60 bg-emerald-500/10",
                    state === "incorrect" && "border-rose-500/60 bg-rose-500/10",
                    state === "missed" && "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      state === "default" && "border-border bg-background text-muted-foreground",
                      state === "selected" && "border-primary bg-primary text-primary-foreground",
                      state === "correct" && "border-emerald-500 bg-emerald-500 text-white",
                      state === "incorrect" && "border-rose-500 bg-rose-500 text-white",
                      state === "missed" && "border-emerald-500 bg-background text-emerald-600"
                    )}
                  >
                    {state === "correct" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : state === "incorrect" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-relaxed">{option.text}</div>
                    {isLocked && option.rationale && (state === "correct" || state === "incorrect" || state === "missed") && (
                      <div
                        className={cn(
                          "mt-2 text-xs leading-relaxed",
                          state === "incorrect" ? "text-rose-600 dark:text-rose-300" : "text-muted-foreground"
                        )}
                      >
                        {option.rationale}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {mode === "practice" && !graded && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button onClick={submit} disabled={selected.length === 0 || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                  </>
                ) : (
                  "Check answer"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowHint((s) => !s)}>
                {showHint ? (
                  <>
                    <EyeOff className="h-4 w-4" /> Hide hint
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" /> Hint
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowNote((s) => !s)}>
                <StickyNote className="h-4 w-4" /> Notes
              </Button>
            </div>
          )}

          <AnimatePresence>
            {showHint && !graded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                  <strong className="text-amber-700 dark:text-amber-400">Hint:</strong> The topic
                  is <em>{question.topic}</em>. The correct option count is{" "}
                  {question.type === "single" ? "1" : "2 or more"}. Use the domain knowledge for{" "}
                  {DOMAIN_SHORT[question.domain as Domain]} to reason from first principles.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {graded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    "mt-3 rounded-xl border p-4",
                    graded.isCorrect || mode === "review"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  )}
                >
                  {mode !== "review" && (
                    <div className="flex items-center gap-2 mb-2">
                      {graded.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Correct
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-rose-600" />
                          <span className="font-semibold text-rose-700 dark:text-rose-400">
                            Not quite
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed text-foreground/90">
                    {graded.explanation}
                  </div>
                  {graded.reference && (
                    <a
                      href={graded.reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Microsoft Learn reference
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <Textarea
                    placeholder="Add a personal note for this question..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNote}>
                      Save note
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNoteText("");
                        saveNote();
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function QuestionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-12 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-6 w-2/3 bg-muted rounded animate-pulse mt-3" />
        <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
        ))}
      </CardContent>
    </Card>
  );
}

