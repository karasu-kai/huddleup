"use client";

import { useState } from "react";
import type { Tab } from "@/lib/types";
import { Button } from "./ui/Button";
import { Input, Label, Textarea, Select } from "./ui/Input";
import { Sheet } from "./ui/Sheet";

type ItemFormData = {
  name: string;
  tabId: string;
  cost: string;
  budget: string;
  url: string;
  notes: string;
  imageUrl: string;
};

export function AddItemSheet({
  open,
  onClose,
  tabs,
  defaultTabId,
  onSubmit,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  tabs: Tab[];
  defaultTabId: string;
  onSubmit: (data: ItemFormData) => Promise<void>;
  editItem?: ItemFormData & { id: string };
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ItemFormData>(() => ({
    name: editItem?.name ?? "",
    tabId: editItem?.tabId ?? defaultTabId,
    cost: editItem?.cost ?? "",
    budget: editItem?.budget ?? "",
    url: editItem?.url ?? "",
    notes: editItem?.notes ?? "",
    imageUrl: editItem?.imageUrl ?? "",
  }));

  const update = (key: keyof ItemFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (res.ok) {
      const { url } = await res.json();
      update("imageUrl", url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
      setForm({
        name: "",
        tabId: defaultTabId,
        cost: "",
        budget: "",
        url: "",
        notes: "",
        imageUrl: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editItem ? "Edit item" : "Add item"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Standing desk, flights, party supplies..."
            autoFocus
            required
          />
        </div>

        <div>
          <Label>Section</Label>
          <Select
            value={form.tabId}
            onChange={(e) => update("tabId", e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Cost</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={form.cost}
              onChange={(e) => update("cost", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Budget</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label>Link</Label>
          <Input
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://..."
            inputMode="url"
          />
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Size, color, timing, who to ask..."
          />
          <p className="mt-1 text-xs text-text-tertiary">
            Shown in the Comments section on the item card.
          </p>
        </div>

        <div>
          <Label>Photo</Label>
          {form.imageUrl ? (
            <div className="relative">
              <img
                src={form.imageUrl}
                alt=""
                className="h-32 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => update("imageUrl", "")}
                className="absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-1 text-xs"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-muted text-sm text-text-secondary hover:border-text-tertiary">
              Tap to upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : editItem ? "Save changes" : "Add item"}
        </Button>
      </form>
    </Sheet>
  );
}

export type { ItemFormData };
