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

  @Column({ default: false })
  isDone: boolean;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.tasks, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'assign_id' })
  assign: User;

  @CreateDateColumn()
  createdAt: Date;
}
