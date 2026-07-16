"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectWithMeta } from "@/lib/types";
import { createMember } from "@/lib/member";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { api, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";

export default function HomePage() {
  const router = useRouter();
  const { member, loading: authLoading, signOut } = useAuth();
  const [nameInput, setNameInput] = useState("");
  const [localMember, setLocalMember] = useState(member);
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const activeMember = isSupabaseConfigured() ? member : localMember;

  useEffect(() => {
    setLocalMember(member);
  }, [member]);

  useEffect(() => {
    if (authLoading) return;
    if (activeMember) loadProjects(activeMember.id);
    else setLoading(false);
  }, [activeMember, authLoading]);

  async function loadProjects(memberId: string) {
    setLoading(true);
    try {
      const data = await api<ProjectWithMeta[]>(
        `/api/projects?memberId=${memberId}`,
      );
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  function handleSetName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const m = createMember(nameInput);
    setLocalMember(m);
    loadProjects(m.id);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-full items-center justify-center text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!activeMember && !isSupabaseConfigured()) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Logo />
          <p className="mt-3 text-text-secondary">
            Shared lists for anything you&apos;re planning together.
          </p>
          <form onSubmit={handleSetName} className="mt-8 space-y-3 text-left">
            <Label>Your name</Label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Alex"
              autoFocus
              required
            />
            <Button type="submit" className="w-full" size="lg">
              Get started
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (!activeMember) {
    return null;
  }

  return (
    <div className="mx-auto min-h-full max-w-lg">
      <header className="sticky top-0 z-10 border-b border-border bg-canvas/95 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Logo compact />
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{activeMember.displayName}</span>
            {isSupabaseConfigured() && (
              <button
                onClick={() => signOut()}
                className="text-xs text-text-tertiary hover:text-text-primary"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="mb-6 flex gap-2">
          <Button className="flex-1" onClick={() => setShowCreate(true)}>
            New project
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setShowJoin(true)}>
            Join code
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-text-secondary">Loading...</p>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="mt-1 text-text-secondary">
              Create one or join with an invite code.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className="w-full text-left"
              >
                <Card className="transition-transform active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{project.name}</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        {project.doneCount}/{project.itemCount} done
                        {project.overallBudget != null &&
                          ` · ${formatCurrency(project.totalSpent)} spent`}
                      </p>
                    </div>
                    {project.overallBudget != null && (
                      <div className="text-right">
                        <p className="tabular-nums text-sm font-medium">
                          {formatCurrency(project.totalSpent)}
                        </p>
                        <p className="tabular-nums text-xs text-text-tertiary">
                          of {formatCurrency(project.overallBudget)}
                        </p>
                      </div>
                    )}
                  </div>
                  {project.overallBudget != null && project.overallBudget > 0 && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-neon"
                        style={{
                          width: `${Math.min(
                            (project.totalSpent / project.overallBudget) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>

      <CreateProjectSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        member={activeMember}
        onCreated={(id) => {
          loadProjects(activeMember.id);
          router.push(`/project/${id}`);
        }}
      />
      <JoinProjectSheet
        open={showJoin}
        onClose={() => setShowJoin(false)}
        member={activeMember}
        onJoined={(id) => {
          loadProjects(activeMember.id);
          router.push(`/project/${id}`);
        }}
      />
    </div>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <h1 className={compact ? "text-xl font-bold tracking-tight" : "text-3xl font-bold tracking-tight"}>
      Huddle<span className="text-neon">Up</span>
    </h1>
  );
}

function CreateProjectSheet({
  open,
  onClose,
  member,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  member: { id: string; displayName: string; color: string };
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { project } = await api<{ project: { id: string } }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          overallBudget: budget ? Number(budget) : null,
          memberId: member.id,
          displayName: member.displayName,
          color: member.color,
        }),
      });
      onCreated(project.id);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Project name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New flat, Japan trip, Housewarming..."
            autoFocus
            required
          />
        </div>
        <div>
          <Label>Overall budget (optional)</Label>
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="4000"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create project"}
        </Button>
      </form>
    </Sheet>
  );
}

function JoinProjectSheet({
  open,
  onClose,
  member,
  onJoined,
}: {
  open: boolean;
  onClose: () => void;
  member: { id: string; displayName: string; color: string };
  onJoined: (id: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { project } = await api<{ project: { id: string } }>(
        "/api/projects/join",
        {
          method: "POST",
          body: JSON.stringify({
            inviteCode: code,
            memberId: member.id,
            displayName: member.displayName,
            color: member.color,
          }),
        },
      );
      onJoined(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Join project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Invite code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="text-center text-lg tracking-widest uppercase"
            maxLength={6}
            autoFocus
            required
          />
        </div>
        {error && <p className="text-sm text-warning">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Joining..." : "Join project"}
        </Button>
      </form>
    </Sheet>
  );
}
