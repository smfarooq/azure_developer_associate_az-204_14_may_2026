"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, Shuffle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionCard, QuestionCardSkeleton } from "@/components/question-card";
import {
  DOMAINS,
  DOMAIN_LABELS,
} from "@/lib/domains";
import { shuffle } from "@/lib/utils";
import type { ApiQuestion } from "@/types";

export default function PracticePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [domain, setDomain] = React.useState<string>(sp.get("domain") ?? "all");
  const [difficulty, setDifficulty] = React.useState<string>(sp.get("difficulty") ?? "all");
  const [search, setSearch] = React.useState<string>(sp.get("q") ?? "");

  const queryString = React.useMemo(() => {
    const p = new URLSearchParams({ include: "answers" });
    if (domain !== "all") p.set("domain", domain);
    if (difficulty !== "all") p.set("difficulty", difficulty);
    if (search) p.set("q", search);
    return p.toString();
  }, [domain, difficulty, search]);

  const { data, isLoading } = useQuery<{ items: ApiQuestion[]; total: number }>({
    queryKey: ["practice", queryString],
    queryFn: async () => (await fetch(`/api/questions?${queryString}`)).json(),
  });

  const [order, setOrder] = React.useState<string[]>([]);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (!data) return;
    setOrder(shuffle(data.items.map((q) => q.id)));
    setIdx(0);
  }, [data]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (search) params.set("q", search);
    const qs = params.toString();
    router.replace(qs ? `/practice?${qs}` : "/practice", { scroll: false });
  }, [domain, difficulty, search, router]);

  const current = data?.items.find((q) => q.id === order[idx]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Practice mode</h1>
        <p className="text-muted-foreground">
          Answer one question at a time and get immediate feedback. Bookmark tricky ones or add
          notes for later review.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompt, topic, or tag…"
                className="pl-9"
              />
            </div>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger>
                <SelectValue placeholder="All domains" />
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
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data ? `${data.total} questions match` : "Loading…"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOrder((prev) => shuffle(prev));
                setIdx(0);
              }}
              disabled={!data}
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading || !data ? (
        <QuestionCardSkeleton />
      ) : data.items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No questions match these filters.
          </CardContent>
        </Card>
      ) : current ? (
        <>
          <QuestionCard
            question={current}
            mode="practice"
            index={idx}
            total={order.length}
          />
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {idx + 1} of {order.length}
            </span>
            <Button
              onClick={() => setIdx((i) => Math.min(order.length - 1, i + 1))}
              disabled={idx >= order.length - 1}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
