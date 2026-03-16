export const STATUS_CATEGORIES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type StatusCategory =
  (typeof STATUS_CATEGORIES)[keyof typeof STATUS_CATEGORIES];
