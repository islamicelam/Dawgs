import { Task } from 'src/tasks/tasks.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../auth/roles';

@Entity()
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

  @OneToMany(() => Task, (task: Task) => task.assign)
  tasks: Task[];
}
