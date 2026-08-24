import type { TaskPriority } from '../types';

export const TASK_PRIORITIES: TaskPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

// Dot color for the priority indicator (rendered by <PriorityBadge />).
export const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: 'bg-neutral-400 dark:bg-neutral-500',
  MEDIUM: 'bg-sky-500',
  HIGH: 'bg-amber-500',
  URGENT: 'bg-red-500',
};

// Text color to pair with the dot — kept muted except for Urgent.
export const PRIORITY_TEXT: Record<TaskPriority, string> = {
  LOW: 'text-neutral-500 dark:text-neutral-400',
  MEDIUM: 'text-neutral-600 dark:text-neutral-300',
  HIGH: 'text-neutral-600 dark:text-neutral-300',
  URGENT: 'text-red-600 dark:text-red-400 font-medium',
};

// Legacy filled-pill style — still used by a couple of dense contexts
// (search results) where a dot alone is too subtle against many rows.
export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  MEDIUM: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  HIGH: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};
