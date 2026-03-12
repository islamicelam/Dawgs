import { Board } from 'src/boards/boards.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { STATUS_CATEGORIES, StatusCategory } from './status-category';
import { Task } from 'src/tasks/tasks.entity';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Board, (board) => board.statuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  board?: Board;

  @Column({
    type: 'enum',
    enum: Object.values(STATUS_CATEGORIES),
  })
  category: StatusCategory;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
