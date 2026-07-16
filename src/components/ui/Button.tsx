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
        "inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "h-9 px-3 text-sm rounded-lg",
        size === "md" && "h-11 px-4 text-sm rounded-xl",
        size === "lg" && "h-12 px-6 text-base rounded-xl",
        variant === "primary" && "bg-neon text-text-primary hover:bg-neon-pressed",
        variant === "secondary" &&
          "bg-surface border border-border text-text-primary hover:bg-surface-muted",
        variant === "ghost" && "text-text-secondary hover:text-text-primary hover:bg-surface-muted/80",
        variant === "danger" && "bg-warning text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
