"use client";

import { useState } from "react";
import type { Comment, Item, ProjectMember, Vote } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Avatar } from "./Avatar";

type ItemCardProps = {
  item: Item;
  votes: Vote[];
  comments: Comment[];
  members: ProjectMember[];
  memberId: string;
  onToggle: () => void;
  onVote: (vote: 1 | -1 | 0) => void;
  onAddComment: (text: string) => void;
  onEdit: () => void;
  onDelete: () => void;
};

function formatUrlLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ItemCard({
  item,
  votes,
  comments,
  members,
  memberId,
  onToggle,
  onVote,
  onAddComment,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const up = votes.filter((v) => v.vote === 1).length;
  const down = votes.filter((v) => v.vote === -1).length;
  const myVote = votes.find((v) => v.memberId === memberId)?.vote;
  const creator = members.find((m) => m.memberId === item.createdBy);
  const itemComments = comments.filter((c) => c.itemId === item.id);
  const commentCount = itemComments.length + (item.notes ? 1 : 0);

  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const href = item.url
    ? item.url.startsWith("http")
      ? item.url
      : `https://${item.url}`
    : null;

  return (
    <Card muted={item.done} className={cn("group overflow-hidden", expanded ? "p-4" : "px-3 py-2.5")}>
      <div className="flex min-w-0 gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors",
            expanded ? "mt-0.5" : "mt-0",
            item.done
              ? "border-neon bg-neon text-text-primary"
              : "border-border bg-surface hover:border-text-tertiary",
          )}
          aria-label={item.done ? "Mark incomplete" : "Mark complete"}
        >
          {item.done && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex w-full min-w-0 items-center gap-2 text-left"
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate font-medium",
                  item.done && "text-text-secondary line-through",
                )}
              >
                {item.name}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
                {item.cost != null && (
                  <span className="tabular-nums">{formatCurrency(item.cost)}</span>
                )}
                {href && <span aria-hidden>🔗</span>}
                {item.imageUrl && <span aria-hidden>📷</span>}
                {commentCount > 0 && (
                  <span className="tabular-nums">💬{commentCount}</span>
                )}
                {(up > 0 || down > 0) && (
                  <span className="tabular-nums">
                    👍{up}
                    {down > 0 ? ` 👎${down}` : ""}
                  </span>
                )}
              </span>
            </button>
          ) : (
            <>
              <div className="flex min-w-0 items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p
                    className={cn(
                      "truncate font-medium leading-snug",
                      item.done && "text-text-secondary line-through",
                    )}
                  >
                    {item.name}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={onEdit}
                    className="rounded-lg px-2 py-1 text-xs text-text-tertiary hover:bg-surface-muted hover:text-text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="rounded-lg px-2 py-1 text-xs text-text-tertiary hover:bg-surface-muted hover:text-warning"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="rounded-lg px-2 py-1 text-xs text-text-tertiary hover:bg-surface-muted hover:text-text-primary"
                    aria-label="Collapse"
                  >
                    −
                  </button>
                </div>
              </div>

              {(item.cost != null || item.budget != null) && (
                <p className="mt-1 tabular-nums text-sm text-text-secondary">
                  {item.cost != null && formatCurrency(item.cost)}
                  {item.cost != null && item.budget != null && " · "}
                  {item.budget != null && `budget ${formatCurrency(item.budget)}`}
                </p>
              )}

              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1.5 block min-w-0 max-w-full truncate text-sm text-text-secondary underline decoration-border underline-offset-2 hover:text-text-primary"
                  title={formatUrlLabel(item.url!)}
                >
                  {formatUrlLabel(item.url!)}
                </a>
              )}

              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="mt-3 max-h-40 w-full rounded-xl object-cover"
                />
              )}

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <VoteButton
                    active={myVote === 1}
                    onClick={() => onVote(myVote === 1 ? 0 : 1)}
                    label="Upvote"
                  >
                    👍 {up > 0 && <span className="tabular-nums text-xs">{up}</span>}
                  </VoteButton>
                  <VoteButton
                    active={myVote === -1}
                    onClick={() => onVote(myVote === -1 ? 0 : -1)}
                    label="Downvote"
                  >
                    👎 {down > 0 && <span className="tabular-nums text-xs">{down}</span>}
                  </VoteButton>
                  <button
                    type="button"
                    onClick={() => setCommentsOpen((open) => !open)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors",
                      commentsOpen
                        ? "bg-neon/25 ring-1 ring-neon text-text-primary"
                        : "text-text-secondary hover:bg-surface-muted",
                    )}
                    aria-expanded={commentsOpen}
                    aria-label="Toggle comments"
                  >
                    💬
                    {commentCount > 0 && (
                      <span className="tabular-nums text-xs">{commentCount}</span>
                    )}
                  </button>
                </div>
                {creator && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <Avatar name={creator.displayName} color={creator.color} />
                  </div>
                )}
              </div>

              {commentsOpen && (
                <div className="mt-3 min-w-0 rounded-xl border border-border bg-surface-muted/60 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Comments
                  </p>

                  {item.notes && (
                    <div className="mb-3 min-w-0 rounded-lg bg-surface px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                        Note
                      </p>
                      <p className="mt-1 break-words text-sm text-text-secondary">{item.notes}</p>
                    </div>
                  )}

                  {itemComments.length > 0 ? (
                    <div className="space-y-2">
                      {itemComments.map((c) => (
                        <div key={c.id} className="min-w-0 rounded-lg bg-surface px-3 py-2">
                          <p className="text-xs font-medium text-text-primary">{c.memberName}</p>
                          <p className="mt-0.5 break-words text-sm text-text-secondary">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !item.notes && (
                      <p className="mb-2 text-sm text-text-tertiary">No comments yet.</p>
                    )
                  )}

                  <CommentInput onSubmit={onAddComment} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function VoteButton({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors",
        active
          ? "bg-neon/25 ring-1 ring-neon text-text-primary"
          : "text-text-secondary hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}

function CommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <form
      className="mt-3 min-w-0"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("comment") as HTMLInputElement;
        if (input.value.trim()) {
          onSubmit(input.value.trim());
          input.value = "";
        }
      }}
    >
      <input
        name="comment"
        placeholder="Add a comment..."
        className="h-9 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary focus:outline-none"
      />
    </form>
  );
}
