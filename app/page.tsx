"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Untitled List" }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      router.push(`/p/${data.project.inviteCode}`);
    } catch {
      setError("Could not create list. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function joinProject(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("Invite code must be 6 characters.");
      return;
    }
    router.push(`/p/${trimmed}`);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8">
      <header className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-bold text-white shadow-lg">
          HU
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Huddle Up</h1>
        <p className="mt-2 text-sm text-slate-600">
          Shared lists for trips, events, and group projects.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Create a list</h2>
        <form onSubmit={createProject} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Japan Trip, Wedding, Apartment"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base"
            maxLength={80}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create & get invite code"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Join with invite code</h2>
        <form onSubmit={joinProject} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="6-char code"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-xl tracking-[0.3em]"
            maxLength={6}
            autoCapitalize="characters"
          />
          <button
            type="submit"
            className="w-full rounded-xl border border-brand-500 px-4 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Join list
          </button>
        </form>
      </section>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      <footer className="mt-auto pt-10 text-center text-xs text-slate-400">
        huddleup.wtf · share the 6-char code with your group
      </footer>
    </main>
  );
}
