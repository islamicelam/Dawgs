import { Board } from "src/boards/boards.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { STATUS_CATEGORIES, StatusCategory } from "./status-category";

@Entity('statuses')
export class Status {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Board, (board) => board.statuses)
    @JoinColumn({ name: 'boardId' })
    board?: Board;

    @Column({
        type: 'enum',
        enum: Object.values(STATUS_CATEGORIES),
    })
    category: StatusCategory;

    @CreateDateColumn()
    createdAt: Date;
}
