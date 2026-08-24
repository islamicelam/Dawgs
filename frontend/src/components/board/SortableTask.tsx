import type { Task, Status } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PriorityBadge from '../common/PriorityBadge';

const SortableTask = ({
  task,
  statuses,
  onMove,
  onSelect,
}: {
  task: Task;
  statuses: Status[];
  onMove: (taskId: number, statusId: number) => void;
  onSelect: (task: Task) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${task.id}` });

  const typeColor = {
    EPIC: '#8b5cf6',
    USER_STORY: '#60a5fa',
    TASK: '#a1a1aa',
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeft: `2.5px solid ${typeColor[task.type ?? 'TASK']}`,
  };

  const isDone = task.status?.category === 'DONE';
  const isOverdue =
    !!task.dueDate &&
    !isDone &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm hover:shadow-black/5 transition-all cursor-grab active:cursor-grabbing group"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-neutral-800 dark:text-neutral-100 font-medium leading-snug">
          {task.title}
        </p>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>
      {(task.parentEpic || task.parentStory) && (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
          ↑{' '}
          {task.parentEpic
            ? `Epic: #${task.parentEpic.id} ${task.parentEpic.title}`
            : `Story: #${task.parentStory!.id} ${task.parentStory!.title}`}
        </p>
      )}
      {task.description && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}
      {!!task.labels?.length && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 font-medium leading-tight"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: label.color }}
              />
              {label.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400 dark:text-neutral-500">
        {task.assign && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[9px] font-semibold flex items-center justify-center shrink-0">
              {task.assign.name.slice(0, 2).toUpperCase()}
            </span>
            {task.assign.name}
          </span>
        )}
        {!!task.subtasks?.length && (
          <span className="text-emerald-600 dark:text-emerald-400">
            {task.subtasks.filter((sub) => sub.done).length}/
            {task.subtasks.length}
          </span>
        )}
        {dueLabel && (
          <span
            className={
              isOverdue
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-neutral-400 dark:text-neutral-500'
            }
          >
            {isOverdue ? '⚠' : '📅'} {dueLabel}
          </span>
        )}
      </div>
      <div className="mt-2 hidden group-hover:flex gap-1 flex-wrap">
        {statuses
          .filter((s) => s.id !== task.status?.id)
          .map((s) => (
            <button
              key={s.id}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMove(task.id, s.id);
              }}
              className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-0.5 text-neutral-500 dark:text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              → {s.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default SortableTask;
