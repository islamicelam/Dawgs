import { Task } from "src/tasks/tasks.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type UserRole = 'user' | 'admin';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string; 

    @Column()
    password: string; 

    @Column({default: 'user'})
    role: UserRole;

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];
}