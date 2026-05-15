"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DOMAINS,
  DOMAIN_LABELS,
  DIFFICULTY_COLOR,
  DOMAIN_RING,
  DOMAIN_SHORT,
} from "@/lib/domains";
import { cn } from "@/lib/utils";
import type { ApiQuestion } from "@/types";

interface OptionDraft {
  text: string;
  isCorrect: boolean;
  rationale: string;
}

export default function AdminPage() {
  const qc = useQueryClient();
  const [domainFilter, setDomainFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const params = new URLSearchParams({ include: "answers" });
  if (domainFilter !== "all") params.set("domain", domainFilter);
  if (search) params.set("q", search);

  const { data, isLoading } = useQuery<{ items: ApiQuestion[]; total: number }>({
    queryKey: ["admin-questions", params.toString()],
    queryFn: async () => (await fetch(`/api/questions?${params.toString()}`)).json(),
  });

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin · Question bank</h1>
          <p className="text-muted-foreground">
            Add new questions or curate the existing bank. Changes are persisted to SQLite.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New question
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompt or topic…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{data?.total ?? 0} questions</CardTitle>
          <CardDescription>Hover a row to edit or delete.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No questions match.</div>
          ) : (
            <div className="divide-y divide-border">
              {data.items.map((q) => (
                <div key={q.id} className="px-6 py-3 hover:bg-accent/40 transition-colors flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                          DOMAIN_RING[q.domain]
                        )}
                      >
                        {DOMAIN_SHORT[q.domain]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
                          DIFFICULTY_COLOR[q.difficulty]
                        )}
                      >
                        {q.difficulty}
                      </span>
                      <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                      {q.externalId && (
                        <code className="text-xs text-muted-foreground">{q.externalId}</code>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{q.prompt}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteQuestion(q.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateQuestionDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => qc.invalidateQueries({ queryKey: ["admin-questions"] })}
      />
    </div>
  );
}

function CreateQuestionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [domain, setDomain] = React.useState("compute");
  const [topic, setTopic] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("medium");
  const [type, setType] = React.useState<"single" | "multi">("single");
  const [prompt, setPrompt] = React.useState("");
  const [explanation, setExplanation] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [options, setOptions] = React.useState<OptionDraft[]>([
    { text: "", isCorrect: false, rationale: "" },
    { text: "", isCorrect: false, rationale: "" },
    { text: "", isCorrect: false, rationale: "" },
    { text: "", isCorrect: false, rationale: "" },
  ]);
  const [saving, setSaving] = React.useState(false);

  function reset() {
    setTopic("");
    setPrompt("");
    setExplanation("");
    setReference("");
    setTags("");
    setOptions([
      { text: "", isCorrect: false, rationale: "" },
      { text: "", isCorrect: false, rationale: "" },
      { text: "", isCorrect: false, rationale: "" },
      { text: "", isCorrect: false, rationale: "" },
    ]);
  }

  async function save() {
    if (!prompt || !topic || !explanation) {
      alert("Prompt, topic, and explanation are required.");
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      alert("Mark at least one option as correct.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          topic,
          difficulty,
          type,
          prompt,
          explanation,
          reference: reference || undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          options: options.filter((o) => o.text.trim() !== ""),
        }),
      });
      if (res.ok) {
        reset();
        onOpenChange(false);
        onCreated();
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to save question");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New question</DialogTitle>
          <DialogDescription>Add a question to your bank.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DOMAIN_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. App Service" />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "single" | "multi")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single answer</SelectItem>
                  <SelectItem value="multi">Multi-select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="The full question text…"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((o, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={o.isCorrect}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = { ...next[i], isCorrect: e.target.checked };
                      setOptions(next);
                    }}
                    className="mt-2 h-4 w-4"
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={o.text}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = { ...next[i], text: e.target.value };
                        setOptions(next);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                    <Input
                      value={o.rationale}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = { ...next[i], rationale: e.target.value };
                        setOptions(next);
                      }}
                      placeholder="Why this is correct/incorrect (optional)"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOptions([...options, { text: "", isCorrect: false, rationale: "" }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add option
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Explanation</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why the correct answer is right; what concepts to learn…"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Reference URL</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="https://learn.microsoft.com/…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="app-service, slots"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
