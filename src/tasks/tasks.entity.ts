import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    assign: User;

    @ManyToOne(() => User, (user) => (user.tasks), {eager: false, onDelete: 'CASCADE'})
    user: User
}