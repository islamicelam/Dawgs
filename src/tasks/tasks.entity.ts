import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
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
  assignee: User;
}
