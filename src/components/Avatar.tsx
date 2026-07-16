"use client";

import { getInitials } from "@/lib/member";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "sm" && "h-6 w-6 text-[10px]",
        size === "md" && "h-8 w-8 text-xs",
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarStack({
  members,
  max = 4,
}: {
  members: { displayName: string; color: string }[];
  max?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <div key={i} className="ring-2 ring-surface rounded-full">
          <Avatar name={m.displayName} color={m.color} />
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[10px] font-medium text-text-secondary ring-2 ring-surface">
          +{extra}
        </div>
      )}
    </div>
  );
}
