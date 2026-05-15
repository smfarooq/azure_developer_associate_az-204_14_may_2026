"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookmarkX, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DIFFICULTY_COLOR,
  DOMAIN_RING,
  DOMAIN_SHORT,
  type Difficulty,
  type Domain,
} from "@/lib/domains";
import { cn } from "@/lib/utils";

interface BookmarkRow {
  questionId: string;
  createdAt: string;
  question: {
    id: string;
    domain: Domain;
    topic: string;
    difficulty: Difficulty;
    prompt: string;
  };
}

export default function BookmarksPage() {
  const { data, isLoading, refetch } = useQuery<BookmarkRow[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => (await fetch("/api/bookmarks")).json(),
  });

  async function remove(id: string) {
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: id }),
    });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Bookmarked questions</h1>
        <p className="text-muted-foreground">
          Questions you've flagged for review. Practice them one at a time below.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <p className="text-muted-foreground">
              No bookmarks yet. Tap the bookmark icon on any question to add it here.
            </p>
            <Button asChild>
              <Link href="/practice">
                <BookOpen className="h-4 w-4" /> Start practicing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((b) => (
            <Card key={b.questionId} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                        DOMAIN_RING[b.question.domain]
                      )}
                    >
                      {DOMAIN_SHORT[b.question.domain]}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
                        DIFFICULTY_COLOR[b.question.difficulty]
                      )}
                    >
                      {b.question.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{b.question.topic}</span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-2">{b.question.prompt}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(b.questionId)}
                  aria-label="Remove bookmark"
                >
                  <BookmarkX className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
