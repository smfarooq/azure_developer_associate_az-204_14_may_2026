"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, RotateCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOMAINS, DOMAIN_LABELS, DOMAIN_SHORT, DIFFICULTY_COLOR, DOMAIN_RING } from "@/lib/domains";
import { cn, shuffle } from "@/lib/utils";
import type { ApiQuestion, Difficulty } from "@/types";

export default function FlashcardsPage() {
  const [domain, setDomain] = React.useState("all");
  const [order, setOrder] = React.useState<string[]>([]);
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  const params = new URLSearchParams({ include: "answers" });
  if (domain !== "all") params.set("domain", domain);

  const { data } = useQuery<{ items: ApiQuestion[]; total: number }>({
    queryKey: ["flashcards", domain],
    queryFn: async () => (await fetch(`/api/questions?${params.toString()}`)).json(),
  });

  React.useEffect(() => {
    if (!data) return;
    setOrder(shuffle(data.items.map((q) => q.id)));
    setIdx(0);
    setFlipped(false);
  }, [data]);

  const current = data?.items.find((q) => q.id === order[idx]);
  const correctOptions = current?.options.filter((o) => o.isCorrect) ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground">
          Quick recall mode. Click the card to flip between prompt and explanation.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {DOMAINS.map((d) => (
              <SelectItem key={d} value={d}>
                {DOMAIN_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setOrder((prev) => shuffle(prev));
            setIdx(0);
            setFlipped(false);
          }}
        >
          <Shuffle className="h-4 w-4" /> Reshuffle
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {data ? `${idx + 1} / ${order.length}` : "Loading…"}
        </div>
      </div>

      {current && (
        <div
          className="relative cursor-pointer select-none"
          style={{ perspective: 1200 }}
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            className="relative w-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card
              className="w-full min-h-[400px] backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      DOMAIN_RING[current.domain]
                    )}
                  >
                    {DOMAIN_SHORT[current.domain]}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
                      DIFFICULTY_COLOR[current.difficulty as Difficulty]
                    )}
                  >
                    {current.difficulty}
                  </span>
                  <Badge variant="outline">{current.topic}</Badge>
                </div>
                <p className="text-lg leading-relaxed whitespace-pre-line">{current.prompt}</p>
                {current.code && (
                  <pre className="rounded-lg border border-border bg-muted/60 p-4 text-sm overflow-x-auto">
                    <code>{current.code}</code>
                  </pre>
                )}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
                  Click card to reveal answer
                </div>
              </CardContent>
            </Card>
            <Card
              className="w-full min-h-[400px] absolute inset-0"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <CardContent className="p-8 space-y-4">
                <Badge variant="success">Answer</Badge>
                <ul className="space-y-2">
                  {correctOptions.map((o) => (
                    <li key={o.id} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                        ✓
                      </span>
                      <span className="text-sm leading-relaxed">{o.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 text-sm leading-relaxed text-foreground/90">
                  {current.explanation}
                </div>
                {current.reference && (
                  <a
                    href={current.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block text-xs text-primary hover:underline"
                  >
                    Microsoft Learn ↗
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setIdx((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          disabled={idx === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="ghost" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="h-4 w-4" /> Flip
        </Button>
        <Button
          onClick={() => {
            setIdx((i) => Math.min(order.length - 1, i + 1));
            setFlipped(false);
          }}
          disabled={idx >= order.length - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
