"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DOMAIN_SHORT } from "@/lib/domains";
import type { StatsSummary } from "@/types";

export default function StatsPage() {
  const { data } = useQuery<StatsSummary>({
    queryKey: ["stats"],
    queryFn: async () => (await fetch("/api/stats")).json(),
  });

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Loading…</div>;
  }

  const radarData = data.byDomain.map((d) => ({
    domain: DOMAIN_SHORT[d.domain],
    accuracy: Math.round(d.accuracy * 100),
    coverage: Math.round((d.attempted / Math.max(d.total, 1)) * 100),
  }));

  const difficultyData = data.byDifficulty.map((d) => ({
    name: d.difficulty,
    accuracy: Math.round(d.accuracy * 100),
    attempts: d.total,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Your analytics</h1>
        <p className="text-muted-foreground">
          Identify weak spots and track readiness for the AZ-204 exam.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.readinessScore}/100</div>
            <Progress value={data.readinessScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(data.correctRate * 100)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.totalAttempts} attempts total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.uniqueQuestionsAttempted}/{data.totalQuestions}
            </div>
            <Progress
              value={(data.uniqueQuestionsAttempted / Math.max(data.totalQuestions, 1)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.recentSessions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.recentSessions.filter((s) => s.completedAt).length} completed
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Domain accuracy</CardTitle>
            <CardDescription>How you score in each AZ-204 area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar
                    name="Accuracy"
                    dataKey="accuracy"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Coverage"
                    dataKey="coverage"
                    stroke="hsl(142 71% 45%)"
                    fill="hsl(142 71% 45%)"
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-primary/60" /> Accuracy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500/60" /> Coverage
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By difficulty</CardTitle>
            <CardDescription>Are you ready for hard scenario questions?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Per-domain breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.byDomain.map((d) => (
            <div key={d.domain}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{DOMAIN_SHORT[d.domain]}</span>
                <span className="text-muted-foreground">
                  {d.correct}/{d.attempted} correct · {d.attempted}/{d.total} tried
                </span>
              </div>
              <Progress value={Math.round(d.accuracy * 100)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="divide-y divide-border -m-6">
              {data.recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <Badge variant="secondary" className="capitalize">
                      {s.mode}
                    </Badge>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {new Date(s.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {s.totalCorrect}/{s.totalAnswered}
                    {s.score !== null && (
                      <span className="ml-2 text-muted-foreground">
                        ({Math.round(s.score)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
