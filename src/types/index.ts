export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  boards: Board[];
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

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  assign?: User;
  createdAt: string;
}
