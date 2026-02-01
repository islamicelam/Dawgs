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

  @Column({ select: false })
  password: string;

  @Column({
    type: 'varchar',
    default: 'USER',
  })
  role: UserRole;

  @OneToMany(() => Task, (task: Task) => task.assign)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
