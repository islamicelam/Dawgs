// src/search/search.types.ts
export type OutboxOperation = 'UPSERT' | 'DELETE';

export interface IndexJobData {
  outboxId: number;
  taskId: number;
  operation: OutboxOperation;
}
