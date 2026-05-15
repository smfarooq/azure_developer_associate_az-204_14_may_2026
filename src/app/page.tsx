"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Timer,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DOMAINS,
  DOMAIN_LABELS,
  DOMAIN_SHORT,
  DOMAIN_WEIGHT,
  DOMAIN_COLOR,
} from "@/lib/domains";
import { cn } from "@/lib/utils";
import type { StatsSummary } from "@/types";

export default function DashboardPage() {
  const { data: stats } = useQuery<StatsSummary>({
    queryKey: ["stats"],
    queryFn: async () => (await fetch("/api/stats")).json(),
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          <Zap className="h-3 w-3" /> Microsoft Azure Developer Associate
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Master the AZ-204 exam
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          Practice with {stats?.totalQuestions ?? "100+"} hand-written questions covering every
          exam domain. Get immediate feedback with detailed explanations and Microsoft Learn
          references. Simulate the real exam under time pressure.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/practice">
              <BookOpen className="h-4 w-4" /> Start practicing
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/exam">
              <Timer className="h-4 w-4" /> Take a mock exam
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/flashcards">
              <Sparkles className="h-4 w-4" /> Flashcards
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Readiness score"
          value={stats ? `${stats.readinessScore}` : "—"}
          suffix={stats ? "/100" : ""}
          subtitle={stats ? readinessLabel(stats.readinessScore) : "Take a few questions to see"}
          icon={<Target className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Questions attempted"
          value={stats ? `${stats.uniqueQuestionsAttempted}` : "—"}
          suffix={stats ? ` / ${stats.totalQuestions}` : ""}
          subtitle="Unique questions tried"
          icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Overall accuracy"
          value={stats ? `${Math.round(stats.correctRate * 100)}%` : "—"}
          subtitle={stats ? `${stats.totalAttempts} total attempts` : "Across all attempts"}
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Question bank"
          value={stats ? `${stats.totalQuestions}` : "—"}
          subtitle="Across 5 exam domains"
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Exam domains</h2>
            <p className="text-sm text-muted-foreground">
              Coverage by exam objective. Click to practice a single domain.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/stats">
              View full analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d) => {
            const stat = stats?.byDomain.find((x) => x.domain === d);
            const pct = stat && stat.attempted > 0 ? Math.round(stat.accuracy * 100) : null;
            const coverage = stat && stat.total > 0 ? (stat.attempted / stat.total) * 100 : 0;
            return (
              <Link key={d} href={`/practice?domain=${d}`}>
                <Card className="group hover:border-primary/40 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className={cn(
                            "inline-block text-transparent bg-clip-text bg-gradient-to-r font-bold text-xs uppercase tracking-wider",
                            DOMAIN_COLOR[d]
                          )}
                        >
                          {DOMAIN_SHORT[d]}
                        </div>
                        <CardTitle className="text-base mt-1">{DOMAIN_LABELS[d]}</CardTitle>
                      </div>
                      <Badge variant="outline">{DOMAIN_WEIGHT[d]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Coverage</span>
                          <span>
                            {stat?.attempted ?? 0} / {stat?.total ?? 0}
                          </span>
                        </div>
                        <Progress
                          value={coverage}
                          indicatorClassName={cn("bg-gradient-to-r", DOMAIN_COLOR[d])}
                        />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                        <span className="text-2xl font-bold">
                          {pct !== null ? `${pct}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {stats && stats.recentSessions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent sessions</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {stats.recentSessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-medium capitalize">{s.mode} session</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(s.startedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {s.totalCorrect}/{s.totalAnswered}
                      </div>
                      {s.score !== null && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round(s.score)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function readinessLabel(score: number) {
  if (score >= 80) return "Likely ready";
  if (score >= 60) return "Almost there";
  if (score >= 40) return "Solid progress";
  if (score >= 20) return "Keep practicing";
  return "Just getting started";
}

function StatCard({
  title,
  value,
  suffix,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  suffix?: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value}
          {suffix && <span className="text-base font-normal text-muted-foreground">{suffix}</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}
