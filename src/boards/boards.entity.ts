import { Project } from 'src/projects/projects.entity';
import { Status } from 'src/statuses/status.entity';
import { Task } from 'src/tasks/tasks.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Status, (status) => status.board)
  statuses: Status[];

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];

  @ManyToOne(() => Project, (project) => project.boards, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}
