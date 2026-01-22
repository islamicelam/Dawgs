import { Project } from 'src/projects/projects.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Project, (project: Project) => project.boards, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'board' })
  board: Board;
}

