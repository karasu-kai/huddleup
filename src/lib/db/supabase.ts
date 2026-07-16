import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Comment,
  Item,
  Project,
  ProjectMember,
  ProjectWithMeta,
  Tab,
  Vote,
} from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/types";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    overallBudget: row.overall_budget != null ? Number(row.overall_budget) : null,
    inviteCode: row.invite_code as string,
    createdAt: row.created_at as string,
  };
}

function mapTab(row: Record<string, unknown>): Tab {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
  };
}

function mapItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    tabId: row.tab_id as string,
    name: row.name as string,
    done: row.done as boolean,
    cost: row.cost != null ? Number(row.cost) : null,
    budget: row.budget != null ? Number(row.budget) : null,
    url: row.url as string | null,
    imageUrl: row.image_url as string | null,
    notes: row.notes as string | null,
    createdBy: row.created_by as string | null,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  };
}

function mapVote(row: Record<string, unknown>): Vote {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    memberId: row.user_id as string,
    vote: row.vote as 1 | -1,
  };
}

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    memberId: row.user_id as string,
    memberName: row.member_name as string,
    text: row.text as string,
    createdAt: row.created_at as string,
  };
}

function mapMember(row: Record<string, unknown>): ProjectMember {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    memberId: row.user_id as string,
    displayName: row.display_name as string,
    color: row.color as string,
    joinedAt: row.joined_at as string,
  };
}

async function ensureProfile(userId: string, email: string | undefined, displayName: string, color?: string) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: userId,
      email,
      display_name: displayName,
      avatar_color: color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
  }
}

export async function listProjectsForUser(userId: string): Promise<ProjectWithMeta[]> {
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId);

  if (!memberships?.length) return [];

  const projectIds = memberships.map((m) => m.project_id);
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds)
    .order("created_at", { ascending: false });

  if (!projects?.length) return [];

  const { data: items } = await supabase
    .from("items")
    .select("project_id, done, cost")
    .in("project_id", projectIds);

  return projects.map((p) => {
    const projectItems = (items || []).filter((i) => i.project_id === p.id);
    const totalSpent = projectItems
      .filter((i) => i.done && i.cost != null)
      .reduce((sum, i) => sum + Number(i.cost), 0);
    return {
      ...mapProject(p),
      itemCount: projectItems.length,
      doneCount: projectItems.filter((i) => i.done).length,
      totalSpent,
    };
  });
}

export async function createProject(input: {
  name: string;
  overallBudget: number | null;
  userId: string;
  displayName: string;
  color: string;
}) {
  const supabase = createAdminClient();
  await ensureProfile(input.userId, undefined, input.displayName, input.color);

  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: input.name.trim(),
      overall_budget: input.overallBudget,
      invite_code: inviteCode,
      owner_id: input.userId,
    })
    .select()
    .single();

  if (projectError || !project) throw new Error(projectError?.message || "Failed to create project");

  const { data: tab, error: tabError } = await supabase
    .from("tabs")
    .insert({
      project_id: project.id,
      name: "General",
      sort_order: 0,
    })
    .select()
    .single();

  if (tabError || !tab) throw new Error(tabError?.message || "Failed to create section");

  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: input.userId,
    display_name: input.displayName.trim(),
    color: input.color,
    role: "owner",
  });

  return { project: mapProject(project), tab: mapTab(tab) };
}

export async function joinProject(input: {
  inviteCode: string;
  userId: string;
  displayName: string;
  color: string;
}) {
  const supabase = createAdminClient();
  await ensureProfile(input.userId, undefined, input.displayName, input.color);

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("invite_code", input.inviteCode.trim().toUpperCase())
    .maybeSingle();

  if (error || !project) return null;

  const { data: existing } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", project.id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: input.userId,
      display_name: input.displayName.trim(),
      color: input.color,
      role: "member",
    });
  }

  return mapProject(project);
}

export async function getProjectBundle(projectId: string) {
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const [{ data: tabs }, { data: items }, { data: members }] = await Promise.all([
    supabase.from("tabs").select("*").eq("project_id", projectId).order("sort_order"),
    supabase.from("items").select("*").eq("project_id", projectId).order("sort_order"),
    supabase.from("project_members").select("*").eq("project_id", projectId),
  ]);

  const itemIds = (items || []).map((i) => i.id);
  let votes: Vote[] = [];
  let comments: Comment[] = [];

  if (itemIds.length) {
    const [{ data: voteRows }, { data: commentRows }] = await Promise.all([
      supabase.from("votes").select("*").in("item_id", itemIds),
      supabase.from("comments").select("*").in("item_id", itemIds).order("created_at"),
    ]);
    votes = (voteRows || []).map(mapVote);
    comments = (commentRows || []).map(mapComment);
  }

  const mappedItems = (items || []).map(mapItem);
  const totalSpent = mappedItems
    .filter((i) => i.done && i.cost != null)
    .reduce((sum, i) => sum + (i.cost ?? 0), 0);
  const totalBudgeted = mappedItems.reduce((sum, i) => sum + (i.budget ?? 0), 0);

  return {
    project: mapProject(project),
    tabs: (tabs || []).map(mapTab),
    items: mappedItems,
    votes,
    comments,
    members: (members || []).map(mapMember),
    totalSpent,
    totalBudgeted,
  };
}

export async function updateProject(
  projectId: string,
  patch: { name?: string; overallBudget?: number | null },
) {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.overallBudget !== undefined) updates.overall_budget = patch.overallBudget;

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Update failed");
  return mapProject(data);
}

export async function deleteProject(projectId: string) {
  const supabase = createAdminClient();
  await supabase.from("projects").delete().eq("id", projectId);
}

export async function createTab(projectId: string, name: string) {
  const supabase = createAdminClient();
  const { data: tabs } = await supabase
    .from("tabs")
    .select("sort_order")
    .eq("project_id", projectId);

  const maxOrder = (tabs || []).reduce((max, t) => Math.max(max, t.sort_order), -1);

  const { data, error } = await supabase
    .from("tabs")
    .insert({ project_id: projectId, name: name.trim(), sort_order: maxOrder + 1 })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create section");
  return mapTab(data);
}

export async function updateTab(tabId: string, patch: { name?: string; sortOrder?: number }) {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.sortOrder !== undefined) updates.sort_order = patch.sortOrder;

  const { data, error } = await supabase
    .from("tabs")
    .update(updates)
    .eq("id", tabId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Update failed");
  return mapTab(data);
}

export async function deleteTab(tabId: string) {
  const supabase = createAdminClient();

  const { data: tab } = await supabase.from("tabs").select("*").eq("id", tabId).maybeSingle();
  if (!tab) throw new Error("Tab not found");

  const { data: projectTabs } = await supabase
    .from("tabs")
    .select("id")
    .eq("project_id", tab.project_id);

  if (!projectTabs || projectTabs.length <= 1) {
    throw new Error("Cannot delete the last section");
  }

  const fallbackTab = projectTabs.find((t) => t.id !== tabId);
  if (fallbackTab) {
    await supabase.from("items").update({ tab_id: fallbackTab.id }).eq("tab_id", tabId);
  }

  await supabase.from("tabs").delete().eq("id", tabId);
}

export async function createItem(
  projectId: string,
  input: {
    name: string;
    tabId?: string;
    cost: number | null;
    budget: number | null;
    url: string | null;
    imageUrl: string | null;
    notes: string | null;
    createdBy: string | null;
  },
) {
  const supabase = createAdminClient();

  let tabId = input.tabId;
  if (!tabId) {
    const { data: firstTab } = await supabase
      .from("tabs")
      .select("id")
      .eq("project_id", projectId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    tabId = firstTab?.id;
  }

  if (!tabId) throw new Error("No section found");

  const { data: items } = await supabase
    .from("items")
    .select("sort_order")
    .eq("project_id", projectId);

  const maxOrder = (items || []).reduce((max, i) => Math.max(max, i.sort_order), -1);

  const { data, error } = await supabase
    .from("items")
    .insert({
      project_id: projectId,
      tab_id: tabId,
      name: input.name.trim() || "Untitled",
      cost: input.cost,
      budget: input.budget,
      url: input.url,
      image_url: input.imageUrl,
      notes: input.notes,
      created_by: input.createdBy,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create item");
  return mapItem(data);
}

export async function updateItem(
  itemId: string,
  patch: Partial<{
    name: string;
    done: boolean;
    cost: number | null;
    budget: number | null;
    url: string | null;
    imageUrl: string | null;
    notes: string | null;
    tabId: string;
  }>,
) {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.done !== undefined) updates.done = patch.done;
  if (patch.cost !== undefined) updates.cost = patch.cost;
  if (patch.budget !== undefined) updates.budget = patch.budget;
  if (patch.url !== undefined) updates.url = patch.url;
  if (patch.imageUrl !== undefined) updates.image_url = patch.imageUrl;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.tabId !== undefined) updates.tab_id = patch.tabId;

  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Update failed");
  return mapItem(data);
}

export async function deleteItem(itemId: string) {
  const supabase = createAdminClient();
  await supabase.from("items").delete().eq("id", itemId);
}

export async function upsertVote(itemId: string, userId: string, vote: 1 | -1 | 0) {
  const supabase = createAdminClient();

  if (vote === 0) {
    await supabase.from("votes").delete().eq("item_id", itemId).eq("user_id", userId);
  } else {
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("votes").update({ vote }).eq("id", existing.id);
    } else {
      await supabase.from("votes").insert({ item_id: itemId, user_id: userId, vote });
    }
  }

  const { data: voteRows } = await supabase.from("votes").select("*").eq("item_id", itemId);
  const itemVotes = (voteRows || []).map(mapVote);
  return {
    votes: itemVotes,
    up: itemVotes.filter((v) => v.vote === 1).length,
    down: itemVotes.filter((v) => v.vote === -1).length,
  };
}

export async function addComment(
  itemId: string,
  userId: string,
  memberName: string,
  text: string,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      item_id: itemId,
      user_id: userId,
      member_name: memberName,
      text: text.trim(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to add comment");
  return mapComment(data);
}

export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function getProfile(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    displayName: data.display_name as string,
    color: data.avatar_color as string,
    email: data.email as string | null,
  };
}

export async function updateProfile(
  userId: string,
  patch: { displayName?: string; avatarColor?: string },
) {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (patch.displayName !== undefined) updates.display_name = patch.displayName.trim();
  if (patch.avatarColor !== undefined) updates.avatar_color = patch.avatarColor;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Update failed");
  return {
    id: data.id as string,
    displayName: data.display_name as string,
    color: data.avatar_color as string,
    email: data.email as string | null,
  };
}

export async function uploadPhoto(userId: string, file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("item-photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
  return data.publicUrl;
}
