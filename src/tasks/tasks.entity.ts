import { Board } from 'src/boards/boards.entity';
import { Status } from 'src/statuses/status.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Status, (status) => status.tasks, {
    nullable: true, 
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'statusId' })
  status?: Status 

  @Column({ nullable: true })
  description?: string;

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
