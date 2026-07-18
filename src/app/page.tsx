"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectWithMeta } from "@/lib/types";
import type { MemberIdentity } from "@/lib/types";
import {
  createSession,
  fetchSession,
  loginWithCode,
  logoutSession,
} from "@/lib/member";
import { api, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Logo } from "@/components/Logo";
import { DEFAULT_CURRENCY, CURRENCIES } from "@/lib/currency";

type OnboardingMode = "welcome" | "new" | "returning";

export default function HomePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberIdentity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>("welcome");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showSaveCode, setShowSaveCode] = useState(false);
  const [newUserCode, setNewUserCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchSession().then((m) => {
      setMember(m);
      if (m) loadProjects();
      else setLoading(false);
    });
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await api<ProjectWithMeta[]>("/api/projects");
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { member: m, isNew } = await createSession(nameInput);
      setMember(m);
      if (isNew && m.userCode) {
        setNewUserCode(m.userCode);
        setShowSaveCode(true);
      }
      loadProjects();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLoginWithCode(e: React.FormEvent) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { member: m } = await loginWithCode(codeInput);
      setMember(m);
      loadProjects();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleSignOut() {
    await logoutSession();
    setMember(null);
    setProjects([]);
    setOnboardingMode("welcome");
    setNameInput("");
    setCodeInput("");
    setLoading(false);
  }

  if (!member) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-md text-center">
          <Logo centered />
          <p className="mx-auto mt-5 max-w-xs text-base leading-relaxed text-text-secondary sm:mt-6 sm:max-w-sm sm:text-lg">
            Shared lists for anything you&apos;re planning together.
          </p>

          {onboardingMode === "welcome" && (
            <div className="mx-auto mt-10 max-w-sm space-y-3 sm:mt-12">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setOnboardingMode("new");
                  setAuthError("");
                }}
              >
                Get started
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => {
                  setOnboardingMode("returning");
                  setAuthError("");
                }}
              >
                I have a personal code
              </Button>
            </div>
          )}

          {onboardingMode === "new" && (
            <form
              onSubmit={handleCreateAccount}
              className="mx-auto mt-10 max-w-sm space-y-4 text-left sm:mt-12"
            >
              <Label>Your name</Label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Alex"
                autoFocus
                required
              />
              {authError && <p className="text-sm text-warning">{authError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={authLoading}>
                {authLoading ? "Creating..." : "Continue"}
              </Button>
              <button
                type="button"
                onClick={() => setOnboardingMode("welcome")}
                className="w-full text-sm text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
            </form>
          )}

          {onboardingMode === "returning" && (
            <form
              onSubmit={handleLoginWithCode}
              className="mx-auto mt-10 max-w-sm space-y-4 text-left sm:mt-12"
            >
              <div>
                <Label>Personal code</Label>
                <p className="mt-1 text-xs text-text-tertiary">
                  Your 8-character code from when you first signed up.
                </p>
              </div>
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="AB12CD34"
                className="text-center text-lg tracking-widest uppercase"
                maxLength={8}
                autoFocus
                required
              />
              {authError && <p className="text-sm text-warning">{authError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={authLoading}>
                {authLoading ? "Signing in..." : "Sign in"}
              </Button>
              <button
                type="button"
                onClick={() => setOnboardingMode("welcome")}
                className="w-full text-sm text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-lg bg-canvas">
      <header className="sticky top-0 z-10 border-b border-border bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div />
          <Logo compact centered />
          <div className="flex min-w-0 items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handleCopyCode(member.userCode)}
              className="flex min-w-0 max-w-[9rem] items-center gap-1 rounded-full bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted sm:max-w-none sm:px-3"
              title="Copy your personal code"
            >
              <span className="truncate">{member.displayName}</span>
              <span className="shrink-0 tabular-nums tracking-wider text-text-tertiary">
                {member.userCode}
              </span>
              {copied ? (
                <span className="shrink-0 text-text-primary">✓</span>
              ) : (
                <span className="shrink-0 text-text-tertiary">⎘</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="shrink-0 text-xs text-text-tertiary hover:text-text-secondary"
            >
              Out
            </button>
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
            <p className="text-lg font-semibold text-text-primary">No projects yet</p>
            <p className="mt-1 text-sm text-text-secondary">
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
                          ` · ${formatCurrency(project.totalSpent, project.currency)} spent`}
                      </p>
                    </div>
                    {project.overallBudget != null && (
                      <div className="text-right">
                        <p className="tabular-nums text-sm font-medium">
                          {formatCurrency(project.totalSpent, project.currency)}
                        </p>
                        <p className="tabular-nums text-xs text-text-tertiary">
                          of {formatCurrency(project.overallBudget, project.currency)}
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

      <Sheet
        open={showSaveCode}
        onClose={() => setShowSaveCode(false)}
        title="Save your personal code"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This is your permanent identity in Huddle Up. Save it somewhere safe — you&apos;ll
            need it if you switch browsers or your session expires.
          </p>
          <div className="rounded-2xl bg-surface-muted px-4 py-5 text-center">
            <p className="text-2xl font-semibold tracking-[0.2em] text-text-primary">
              {newUserCode}
            </p>
          </div>
          <Button className="w-full" onClick={() => handleCopyCode(newUserCode)}>
            {copied ? "Copied!" : "Copy code"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowSaveCode(false)}
          >
            I&apos;ve saved it
          </Button>
        </div>
      </Sheet>

      <CreateProjectSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => {
          loadProjects();
          router.push(`/project/${id}`);
        }}
      />
      <JoinProjectSheet
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={(id) => {
          loadProjects();
          router.push(`/project/${id}`);
        }}
      />
    </div>
  );
}

function CreateProjectSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
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
          currency,
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
          <Label>Currency</Label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
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
  onJoined,
}: {
  open: boolean;
  onClose: () => void;
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
