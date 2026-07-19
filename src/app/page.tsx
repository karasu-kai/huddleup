"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectWithMeta } from "@/lib/types";
import type { MemberIdentity } from "@/lib/types";
import {
  fetchSession,
  loginWithEmail,
  logoutSession,
  registerAccount,
} from "@/lib/member";
import { api, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Logo } from "@/components/Logo";
import { DEFAULT_CURRENCY, CURRENCIES } from "@/lib/currency";

type OnboardingMode = "welcome" | "login" | "register";

export default function HomePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberIdentity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>("welcome");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim() || !passwordInput) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { member: m } = await registerAccount(
        emailInput,
        passwordInput,
        nameInput,
      );
      setMember(m);
      loadProjects();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { member: m } = await loginWithEmail(emailInput, passwordInput);
      setMember(m);
      loadProjects();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await logoutSession();
    setMember(null);
    setProjects([]);
    setOnboardingMode("welcome");
    setNameInput("");
    setEmailInput("");
    setPasswordInput("");
    setLoading(false);
  }

  if (!member) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-md text-center">
          <Logo centered />
          <p className="mx-auto mt-5 max-w-xs text-base leading-relaxed text-text-secondary sm:mt-6 sm:max-w-sm sm:text-lg">
            Shared lists for anything you&apos;re planning together. Sign in with your email
            to keep your projects.
          </p>

          {onboardingMode === "welcome" && (
            <div className="mx-auto mt-10 max-w-sm space-y-3 sm:mt-12">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setOnboardingMode("login");
                  setAuthError("");
                }}
              >
                Sign in
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => {
                  setOnboardingMode("register");
                  setAuthError("");
                }}
              >
                Create account
              </Button>
            </div>
          )}

          {onboardingMode === "login" && (
            <form
              onSubmit={handleLogin}
              className="mx-auto mt-10 max-w-sm space-y-4 text-left sm:mt-12"
            >
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
              </div>
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

          {onboardingMode === "register" && (
            <form
              onSubmit={handleRegister}
              className="mx-auto mt-10 max-w-sm space-y-4 text-left sm:mt-12"
            >
              <div>
                <Label>Your name</Label>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Alex"
                  autoComplete="name"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {authError && <p className="text-sm text-warning">{authError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={authLoading}>
                {authLoading ? "Creating..." : "Create account"}
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
            <div className="min-w-0 max-w-[10rem] truncate text-right sm:max-w-[12rem]">
              <p className="truncate text-xs font-medium text-text-primary">
                {member.displayName}
              </p>
              <p className="truncate text-[10px] text-text-tertiary sm:text-xs">
                {member.email}
              </p>
            </div>
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
