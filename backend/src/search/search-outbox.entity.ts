import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('search_outbox')
export class SearchOutbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  aggregateId: number; // id задачи

  @Column({ type: 'varchar' })
  operation: 'UPSERT' | 'DELETE';

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null; // null = ещё не обработано воркером

  @CreateDateColumn()
  createdAt: Date;
}
