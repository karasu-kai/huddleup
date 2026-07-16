"use client";

import { cn } from "@/lib/utils";
import type { Tab } from "@/lib/types";

export function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onAddTab,
}: {
  tabs: Tab[];
  activeTabId: string;
  onSelect: (tabId: string) => void;
  onAddTab: () => void;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
        <TabPill
          name="All"
          active={activeTabId === "all"}
          onClick={() => onSelect("all")}
        />
        {tabs.map((tab) => (
          <TabPill
            key={tab.id}
            name={tab.name}
            active={activeTabId === tab.id}
            onClick={() => onSelect(tab.id)}
          />
        ))}
        <button
          onClick={onAddTab}
          className="flex h-9 shrink-0 items-center justify-center rounded-full px-3 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          + Section
        </button>
      </div>
    </div>
  );
}

function TabPill({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-muted",
      )}
    >
      {name}
      {active && (
        <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-neon" />
      )}
    </button>
  );
}
