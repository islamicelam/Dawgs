export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  boards: Board[];
  members?: User[];
}

export interface Board {
  id: number;
  name: string;
  createdAt: string;
}

export interface Status {
  id: number;
  name: string;
  category: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SearchResult {
  id: number;
  score: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  type: 'TASK' | 'USER_STORY' | 'EPIC';
  projectId: number;
  boardId: number;
  status?: string;
  highlight?: {
    title?: string[];
    description?: string[];
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  order: number;
  type: 'TASK' | 'USER_STORY' | 'EPIC';
  priority: TaskPriority;
  dueDate?: string | null;
  comments: {
    id: string;
    text: string;
    createdAt: string;
    createdById: number;
    createdByName: string;
    mentions: string[];
  }[];
  history: {
    id: string;
    action: string;
    createdAt: string;
    createdById: number;
    createdByName: string;
  }[];
  subtasks: { id: string; text: string; done: boolean }[];
  linkedTaskIds: number[];
  descriptionMentions: string[];
  status?: Status;
  assign?: User;
  createdAt: string;
  parentEpic?: Task;
  parentStory?: Task;
}
