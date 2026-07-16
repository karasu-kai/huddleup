"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-9 rounded-lg px-3 text-sm",
        size === "md" && "h-11 rounded-xl px-4 text-sm",
        size === "lg" && "h-12 rounded-xl px-6 text-base",
        variant === "primary" &&
          "bg-neon text-text-primary shadow-[0_1px_0_rgba(0,0,0,0.06)] hover:bg-neon-pressed",
        variant === "secondary" &&
          "border border-border bg-surface text-text-primary hover:bg-surface-muted",
        variant === "ghost" &&
          "text-text-secondary hover:bg-surface-muted/80 hover:text-text-primary",
        variant === "danger" && "bg-warning text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
