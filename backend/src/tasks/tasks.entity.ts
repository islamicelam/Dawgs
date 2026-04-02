import { Board } from 'src/boards/boards.entity';
import { Status } from 'src/statuses/statuses.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TaskType = 'TASK' | 'USER_STORY' | 'EPIC';

export interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
  createdById: number;
  createdByName: string;
  mentions: string[];
}

export interface TaskHistoryEntry {
  id: string;
  action: string;
  createdAt: string;
  createdById: number;
  createdByName: string;
}

export interface TaskSubtask {
  id: string;
  text: string;
  done: boolean;
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Status, (status) => status.tasks, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'statusId' })
  status?: Status;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'varchar', default: 'TASK' })
  type: TaskType;

  @Column({ type: 'jsonb', default: [] })
  comments: TaskComment[];

  @Column({ type: 'jsonb', default: [] })
  history: TaskHistoryEntry[];

  @Column({ type: 'jsonb', default: [] })
  subtasks: TaskSubtask[];

  @Column({ type: 'jsonb', default: [] })
  linkedTaskIds: number[];

  @Column({ type: 'jsonb', default: [] })
  descriptionMentions: string[];

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @ManyToOne(() => User, (user) => user.tasks, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'assign_id' })
  assign: User;

  @CreateDateColumn()
  createdAt: Date;
}
