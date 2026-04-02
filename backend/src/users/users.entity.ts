import { Task } from 'src/tasks/tasks.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../auth/roles';
import { Exclude } from 'class-transformer';
import { Project } from 'src/projects/projects.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @Column({
    type: 'varchar',
    default: 'USER',
  })
  role: UserRole;

  @OneToMany(() => Task, (task: Task) => task.assign)
  tasks: Task[];

  @ManyToMany(() => Project, (project) => project.members)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;
}
