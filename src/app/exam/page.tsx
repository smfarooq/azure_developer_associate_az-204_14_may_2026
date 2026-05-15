"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOMAINS, DOMAIN_LABELS } from "@/lib/domains";

export default function ExamConfigPage() {
  const router = useRouter();
  const [count, setCount] = React.useState("30");
  const [duration, setDuration] = React.useState("3600");
  const [domain, setDomain] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");
  const [creating, setCreating] = React.useState(false);

  async function start() {
    setCreating(true);
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "exam",
          count: Number(count),
          durationSec: Number(duration),
          domain: domain === "all" ? undefined : domain,
          difficulty: difficulty === "all" ? undefined : difficulty,
        }),
      });
      const data = await res.json();
      if (data.sessionId) router.push(`/exam/${data.sessionId}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Timer className="h-7 w-7 text-primary" /> Exam simulator
        </h1>
        <p className="text-muted-foreground">
          Configure your mock exam. The real AZ-204 is 40-60 questions in 100 minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam configuration</CardTitle>
          <CardDescription>
            You'll see one question at a time with a navigator on the side. Mark questions for
            review and finish whenever you're ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Number of questions</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (quick)</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30 (recommended)</SelectItem>
                  <SelectItem value="50">50 (full simulator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="900">15 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="6000">100 minutes (real exam)</SelectItem>
                  <SelectItem value="0">Untimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mixed</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
            During the exam, answers are NOT graded until the end. You can mark questions for
            review and navigate freely between them.
          </div>
          <Button size="lg" onClick={start} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Building your exam…
              </>
            ) : (
              <>
                <Timer className="h-4 w-4" /> Start exam
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
