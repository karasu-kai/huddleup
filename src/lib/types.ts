export type User = {
  id: string;
  displayName: string;
  color: string;
  userCode: string;
  createdAt: string;
};

export type Session = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type Project = {
  id: string;
  name: string;
  overallBudget: number | null;
  inviteCode: string;
  createdAt: string;
};

export type Tab = {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
};

export type Item = {
  id: string;
  projectId: string;
  tabId: string;
  name: string;
  done: boolean;
  cost: number | null;
  budget: number | null;
  url: string | null;
  imageUrl: string | null;
  notes: string | null;
  createdBy: string | null;
  sortOrder: number;
  createdAt: string;
};

export type Vote = {
  id: string;
  itemId: string;
  memberId: string;
  vote: 1 | -1;
};

export type Comment = {
  id: string;
  itemId: string;
  memberId: string;
  memberName: string;
  text: string;
  createdAt: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  memberId: string;
  displayName: string;
  color: string;
  joinedAt: string;
};

export type Database = {
  users: User[];
  sessions: Session[];
  projects: Project[];
  tabs: Tab[];
  items: Item[];
  votes: Vote[];
  comments: Comment[];
  projectMembers: ProjectMember[];
};

export type MemberIdentity = {
  id: string;
  displayName: string;
  color: string;
  userCode: string;
};

export type ProjectWithMeta = Project & {
  itemCount: number;
  doneCount: number;
  totalSpent: number;
};

export const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];
