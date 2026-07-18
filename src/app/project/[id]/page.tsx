"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  Comment,
  Item,
  MemberIdentity,
  Project,
  ProjectMember,
  Tab,
  Vote,
} from "@/lib/types";
import { fetchSession } from "@/lib/member";
import { api } from "@/lib/utils";
import { TabBar } from "@/components/TabBar";
import { ItemCard } from "@/components/ItemCard";
import { BudgetBar } from "@/components/BudgetBar";
import { AddItemSheet, type ItemFormData } from "@/components/AddItemSheet";
import { AvatarStack } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Label, Select } from "@/components/ui/Input";
import { CURRENCIES, normalizeCurrency } from "@/lib/currency";

type ProjectData = {
  project: Project;
  tabs: Tab[];
  items: Item[];
  votes: Vote[];
  comments: Comment[];
  members: ProjectMember[];
  totalSpent: number;
  totalBudgeted: number;
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [member, setMember] = useState<MemberIdentity | null>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [activeTabId, setActiveTabId] = useState("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTab, setShowAddTab] = useState(false);
  const [editItem, setEditItem] = useState<(ItemFormData & { id: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const result = await api<ProjectData>(`/api/projects/${projectId}`);
    setData(result);
  }, [projectId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    fetchSession().then((m) => {
      if (!m) {
        router.replace("/");
        return;
      }
      setMember(m);
      load();
      interval = setInterval(load, 3000);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [load, router]);

  if (!member || !data) {
    return (
      <div className="flex min-h-full items-center justify-center text-text-secondary">
        Loading...
      </div>
    );
  }

  const { project, tabs, items, votes, comments, members, totalSpent } = data;
  const currency = normalizeCurrency(project.currency);

  const filteredItems =
    activeTabId === "all"
      ? items
      : items.filter((i) => i.tabId === activeTabId);

  const activeItems = filteredItems.filter((i) => !i.done);
  const doneItems = filteredItems.filter((i) => i.done);

  const defaultTabId =
    activeTabId === "all" ? tabs[0]?.id ?? "" : activeTabId;

  async function handleAddItem(form: ItemFormData) {
    await api(`/api/projects/${projectId}/items`, {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        tabId: form.tabId,
        cost: form.cost ? Number(form.cost) : null,
        budget: form.budget ? Number(form.budget) : null,
        url: form.url,
        notes: form.notes,
        imageUrl: form.imageUrl || null,
      }),
    });
    await load();
  }

  async function handleEditItem(form: ItemFormData) {
    if (!editItem) return;
    await api(`/api/items/${editItem.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.name,
        tabId: form.tabId,
        cost: form.cost ? Number(form.cost) : null,
        budget: form.budget ? Number(form.budget) : null,
        url: form.url,
        notes: form.notes,
        imageUrl: form.imageUrl || null,
      }),
    });
    setEditItem(null);
    await load();
  }

  async function toggleItem(item: Item) {
    await api(`/api/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: !item.done }),
    });
    await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await api(`/api/items/${id}`, { method: "DELETE" });
    await load();
  }

  async function voteItem(itemId: string, vote: 1 | -1 | 0) {
    await api(`/api/items/${itemId}/votes`, {
      method: "POST",
      body: JSON.stringify({ vote }),
    });
    await load();
  }

  async function addComment(itemId: string, text: string) {
    await api(`/api/items/${itemId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    await load();
  }

  async function addTab(name: string) {
    await api(`/api/projects/${projectId}/tabs`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await load();
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(project.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-canvas/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted"
            aria-label="Back"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">{project.name}</h1>
            <button
              onClick={copyInviteCode}
              className="neon-pill mt-1 inline-flex px-2.5 py-1 text-[11px] uppercase"
            >
              {project.inviteCode}
              {copied ? " · copied" : " · tap to copy"}
            </button>
          </div>
          <AvatarStack
            members={members.map((m) => ({
              displayName: m.displayName,
              color: m.color,
            }))}
          />
          <button
            onClick={() => setShowSettings(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelect={setActiveTabId}
          onAddTab={() => setShowAddTab(true)}
        />
      </header>

      <main className="flex-1 space-y-3 px-4 py-4 pb-24">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-text-primary">Nothing here yet</p>
            <p className="mt-1 text-sm text-text-secondary">Dream big.</p>
          </div>
        ) : (
          <>
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currency={currency}
                votes={votes.filter((v) => v.itemId === item.id)}
                comments={comments}
                members={members}
                memberId={member.id}
                onToggle={() => toggleItem(item)}
                onVote={(v) => voteItem(item.id, v)}
                onAddComment={(text) => addComment(item.id, text)}
                onEdit={() =>
                  setEditItem({
                    id: item.id,
                    name: item.name,
                    tabId: item.tabId,
                    cost: item.cost?.toString() ?? "",
                    budget: item.budget?.toString() ?? "",
                    url: item.url ?? "",
                    notes: item.notes ?? "",
                    imageUrl: item.imageUrl ?? "",
                  })
                }
                onDelete={() => deleteItem(item.id)}
              />
            ))}

            {doneItems.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Done ({doneItems.length})
                </p>
                <div className="space-y-3">
                  {doneItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      votes={votes.filter((v) => v.itemId === item.id)}
                      comments={comments}
                      members={members}
                      memberId={member.id}
                      onToggle={() => toggleItem(item)}
                      onVote={(v) => voteItem(item.id, v)}
                      onAddComment={(text) => addComment(item.id, text)}
                      onEdit={() =>
                        setEditItem({
                          id: item.id,
                          name: item.name,
                          tabId: item.tabId,
                          cost: item.cost?.toString() ?? "",
                          budget: item.budget?.toString() ?? "",
                          url: item.url ?? "",
                          notes: item.notes ?? "",
                          imageUrl: item.imageUrl ?? "",
                        })
                      }
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-lg">
        <BudgetBar
          spent={totalSpent}
          budget={project.overallBudget}
          currency={currency}
        />
      </div>

      <button
        onClick={() => setShowAddItem(true)}
        className="fixed bottom-[calc(5rem+var(--safe-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-neon text-3xl font-light leading-none text-text-primary shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-transform active:scale-95"
        aria-label="Add item"
      >
        +
      </button>

      <AddItemSheet
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        tabs={tabs}
        defaultTabId={defaultTabId}
        onSubmit={handleAddItem}
      />

      <AddItemSheet
        open={!!editItem}
        onClose={() => setEditItem(null)}
        tabs={tabs}
        defaultTabId={defaultTabId}
        editItem={editItem ?? undefined}
        onSubmit={handleEditItem}
      />

      <AddTabSheet
        open={showAddTab}
        onClose={() => setShowAddTab(false)}
        onSubmit={addTab}
      />

      <ProjectSettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        project={project}
        tabs={tabs}
        onUpdate={load}
        onDelete={async () => {
          await api(`/api/projects/${projectId}`, { method: "DELETE" });
          router.push("/");
        }}
      />
    </div>
  );
}

function AddTabSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name);
      setName("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New section">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Section name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kitchen, Week 1, Gear..."
            autoFocus
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add section"}
        </Button>
      </form>
    </Sheet>
  );
}

function ProjectSettingsSheet({
  open,
  onClose,
  project,
  tabs,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  tabs: Tab[];
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(project.name);
  const [budget, setBudget] = useState(project.overallBudget?.toString() ?? "");
  const [currency, setCurrency] = useState(normalizeCurrency(project.currency));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setBudget(project.overallBudget?.toString() ?? "");
      setCurrency(normalizeCurrency(project.currency));
    }
  }, [open, project]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          overallBudget: budget ? Number(budget) : null,
          currency,
        }),
      });
      await onUpdate();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function renameTab(tab: Tab) {
    const newName = prompt("Section name", tab.name);
    if (!newName?.trim()) return;
    await api(`/api/tabs/${tab.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName.trim() }),
    });
    await onUpdate();
  }

  async function deleteTab(tab: Tab) {
    if (!confirm(`Delete section "${tab.name}"? Items will move to another section.`)) return;
    await api(`/api/tabs/${tab.id}`, { method: "DELETE" });
    await onUpdate();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Project settings">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Project name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
          <Label>Overall budget</Label>
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Save changes
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <Label>Sections</Label>
        <div className="mt-2 space-y-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2"
            >
              <span className="text-sm font-medium">{tab.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => renameTab(tab)}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Rename
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={() => deleteTab(tab)}
                    className="text-xs text-warning"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <Button
          variant="danger"
          className="w-full"
          onClick={async () => {
            if (confirm("Delete this entire project? This cannot be undone.")) {
              await onDelete();
            }
          }}
        >
          Delete project
        </Button>
      </div>
    </Sheet>
  );
}
