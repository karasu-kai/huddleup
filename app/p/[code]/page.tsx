"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { ListItem, Project, Section } from "@/lib/types";

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function parseMoney(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

export default function ProjectPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params.code || "").toUpperCase();

  const [project, setProject] = useState<Project | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const persist = useCallback(
    async (next: Project) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/projects/${code}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: next.name,
            sections: next.sections,
            items: next.items,
          }),
        });
        if (!res.ok) throw new Error("save failed");
        const data = await res.json();
        setProject(data.project);
      } catch {
        setError("Could not save changes.");
      } finally {
        setSaving(false);
      }
    },
    [code],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/projects/${code}`);
        if (!res.ok) {
          setError("List not found. Check the invite code.");
          setProject(null);
          return;
        }
        const data = await res.json();
        setProject(data.project);
        const firstSection = data.project.sections.slice().sort((a: Section, b: Section) => a.order - b.order)[0];
        setActiveSectionId(firstSection?.id || "");
      } catch {
        setError("Failed to load list.");
      } finally {
        setLoading(false);
      }
    }
    if (code) load();
  }, [code]);

  const sortedSections = useMemo(
    () => (project ? [...project.sections].sort((a, b) => a.order - b.order) : []),
    [project],
  );

  const sectionItems = useMemo(() => {
    if (!project) return [];
    return project.items
      .filter((item) => item.sectionId === activeSectionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [project, activeSectionId]);

  const totals = useMemo(() => {
    if (!project) return { cost: 0, budget: 0 };
    return project.items.reduce(
      (acc, item) => ({
        cost: acc.cost + (item.cost ?? 0),
        budget: acc.budget + (item.budget ?? 0),
      }),
      { cost: 0, budget: 0 },
    );
  }, [project]);

  function updateProject(updater: (prev: Project) => Project) {
    if (!project) return;
    const next = updater(project);
    setProject(next);
    void persist(next);
  }

  function addSection() {
    const name = prompt("Section name");
    if (!name?.trim()) return;
    updateProject((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: uuidv4(), name: name.trim(), order: prev.sections.length },
      ],
    }));
  }

  function renameSection(sectionId: string) {
    const section = project?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const name = prompt("Rename section", section.name);
    if (!name?.trim()) return;
    updateProject((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, name: name.trim() } : s)),
    }));
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeSectionId) return;
    const now = new Date().toISOString();
    const item: ListItem = {
      id: uuidv4(),
      sectionId: activeSectionId,
      title: newItemTitle.trim(),
      checked: false,
      cost: null,
      budget: null,
      url: "",
      photo: "",
      comments: [],
      thumbs: 0,
      createdAt: now,
      updatedAt: now,
    };
    updateProject((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItemTitle("");
  }

  function updateItem(itemId: string, patch: Partial<ListItem>) {
    updateProject((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  }

  function deleteItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    updateProject((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  }

  function addComment(itemId: string) {
    const text = prompt("Add a comment");
    if (!text?.trim()) return;
    const item = project?.items.find((i) => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { comments: [...item.comments, text.trim()] });
  }

  async function handlePhoto(itemId: string, file: File | null) {
    if (!file) return;
    if (file.size > 2_000_000) {
      alert("Photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateItem(itemId, { photo: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-slate-500">
        Loading list…
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-red-600">{error || "List not found."}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white"
        >
          Back home
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button onClick={() => router.push("/")} className="text-xs text-brand-600">
              ← Home
            </button>
            <input
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              onBlur={() => persist(project)}
              className="mt-1 w-full truncate bg-transparent text-xl font-bold"
            />
          </div>
          <button
            onClick={copyCode}
            className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 font-mono text-sm font-bold text-brand-700"
          >
            {copied ? "Copied!" : code}
          </button>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          <span>Cost: ${formatMoney(totals.cost)}</span>
          <span>Budget: ${formatMoney(totals.budget)}</span>
          {saving && <span className="text-brand-600">Saving…</span>}
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-2 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              onDoubleClick={() => renameSection(section.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeSectionId === section.id
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {section.name}
            </button>
          ))}
          <button
            onClick={addSection}
            className="shrink-0 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500"
          >
            + Tab
          </button>
        </div>
      </div>

      <section className="space-y-3 px-4 py-4">
        {sectionItems.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No items yet. Add one below.
          </p>
        )}

        {sectionItems.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
              item.checked ? "border-brand-200 opacity-75" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => updateItem(item.id, { checked: e.target.checked })}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-500"
              />
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
                  className={`block w-full text-left text-base font-medium ${
                    item.checked ? "line-through text-slate-500" : "text-slate-900"
                  }`}
                >
                  {item.title}
                </button>

                {editingItemId === item.id && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <input
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Cost"
                        value={item.cost ?? ""}
                        onChange={(e) => updateItem(item.id, { cost: parseMoney(e.target.value) })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Budget"
                        value={item.budget ?? ""}
                        onChange={(e) => updateItem(item.id, { budget: parseMoney(e.target.value) })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="URL"
                      value={item.url}
                      onChange={(e) => updateItem(item.id, { url: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-brand-600"
                      >
                        Open link ↗
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                        {item.photo ? "Change photo" : "Add photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhoto(item.id, e.target.files?.[0] ?? null)}
                        />
                      </label>
                      <button
                        onClick={() => updateItem(item.id, { thumbs: item.thumbs + 1 })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        👍 {item.thumbs}
                      </button>
                      <button
                        onClick={() => addComment(item.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        💬 {item.comments.length}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="ml-auto rounded-lg px-2 py-2 text-xs text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                    {item.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photo} alt="" className="max-h-40 rounded-lg object-cover" />
                    )}
                    {item.comments.length > 0 && (
                      <ul className="space-y-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                        {item.comments.map((comment, idx) => (
                          <li key={idx}>• {comment}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!editingItemId && (
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    {item.cost !== null && <span>${formatMoney(item.cost)}</span>}
                    {item.budget !== null && <span>budget ${formatMoney(item.budget)}</span>}
                    {item.thumbs > 0 && <span>👍 {item.thumbs}</span>}
                    {item.comments.length > 0 && <span>💬 {item.comments.length}</span>}
                    {item.url && <span className="text-brand-600">link</span>}
                    {item.photo && <span>📷</span>}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <form
        onSubmit={addItem}
        className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur safe-bottom"
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <input
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Add item…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-base"
          />
          <button
            type="submit"
            disabled={!newItemTitle.trim()}
            className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {error && (
        <p className="fixed left-4 right-4 top-20 z-30 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}
    </main>
  );
}
