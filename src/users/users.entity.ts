import { Task } from 'src/tasks/tasks.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../auth/roles';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'USER',
  })
  role: UserRole;

  @OneToMany(() => Task, (task: Task) => task.assignee)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
