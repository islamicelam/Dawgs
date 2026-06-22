import { Project } from 'src/projects/projects.entity';
import { Task } from 'src/tasks/tasks.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Project, (project) => project.labels)
  project: Project;

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[];
}
