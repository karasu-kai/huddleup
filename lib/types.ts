export interface Section {
  id: string;
  name: string;
  order: number;
}

export interface ListItem {
  id: string;
  sectionId: string;
  title: string;
  checked: boolean;
  cost: number | null;
  budget: number | null;
  url: string;
  photo: string;
  comments: string[];
  thumbs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  inviteCode: string;
  name: string;
  sections: Section[];
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  projects: Record<string, Project>;
}

export type ProjectUpdate = Partial<Pick<Project, "name" | "sections" | "items">>;
