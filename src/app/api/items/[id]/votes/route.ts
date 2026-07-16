import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import type { Vote } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { memberId, vote } = body;

  if (!memberId || (vote !== 1 && vote !== -1 && vote !== 0)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const db = await readDb();
  const item = db.items.find((i) => i.id === id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const existingIndex = db.votes.findIndex(
    (v) => v.itemId === id && v.memberId === memberId,
  );

  if (vote === 0) {
    if (existingIndex !== -1) db.votes.splice(existingIndex, 1);
  } else if (existingIndex !== -1) {
    db.votes[existingIndex].vote = vote;
  } else {
    const newVote: Vote = {
      id: crypto.randomUUID(),
      itemId: id,
      memberId,
      vote,
    };
    db.votes.push(newVote);
  }

  await writeDb(db);

  const itemVotes = db.votes.filter((v) => v.itemId === id);
  return NextResponse.json({
    votes: itemVotes,
    up: itemVotes.filter((v) => v.vote === 1).length,
    down: itemVotes.filter((v) => v.vote === -1).length,
  });
}
