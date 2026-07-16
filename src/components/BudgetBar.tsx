"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BudgetBar({
  spent,
  budget,
  label = "Budget",
}: {
  spent: number;
  budget: number | null;
  label?: string;
}) {
  if (budget == null || budget === 0) {
    return (
      <div className="border-t border-border bg-surface px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="tabular-nums font-semibold">{formatCurrency(spent)} spent</span>
        </div>
      </div>
    );
  }

  const pct = Math.min((spent / budget) * 100, 100);
  const over = spent > budget;

  return (
    <div className="border-t border-border bg-surface px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={cn("tabular-nums font-semibold", over && "text-warning")}>
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            over ? "bg-warning" : "bg-neon",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="mt-1.5 text-xs text-warning">
          {formatCurrency(spent - budget)} over budget
        </p>
      )}
    </div>
  );
}
