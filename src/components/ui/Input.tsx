"use client";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-3 text-text-primary placeholder:text-text-tertiary focus:border-text-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[80px] w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-text-primary placeholder:text-text-tertiary focus:border-text-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
      {children}
    </label>
  );
}
