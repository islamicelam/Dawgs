import type { Task, Status } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_BADGE, PRIORITY_LABEL } from '../../constants/task';

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
    USER_STORY: '#3b82f6',
    TASK: '#94a3b8',
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeft: `3px solid ${typeColor[task.type ?? 'TASK']}`,
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
      className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-700 font-medium">{task.title}</p>
        {task.priority && (
          <span
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
      </div>
      {(task.parentEpic || task.parentStory) && (
        <p className="text-[11px] text-slate-400 mt-0.5">
          ↑{' '}
          {task.parentEpic
            ? `Epic: #${task.parentEpic.id} ${task.parentEpic.title}`
            : `Story: #${task.parentStory!.id} ${task.parentStory!.title}`}
        </p>
      )}
      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      {task.assign && (
        <p className="text-xs text-blue-400 mt-1">👤 {task.assign.name}</p>
      )}
      {!!task.subtasks?.length && (
        <p className="text-xs text-emerald-600 mt-1">
          {task.subtasks.filter((sub) => sub.done).length}/
          {task.subtasks.length} subtasks
        </p>
      )}
      {!!task.labels?.length && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium leading-tight"
              style={{ background: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      {dueLabel && (
        <p
          className={`text-xs mt-1 inline-flex items-center gap-1 ${
            isOverdue ? 'text-red-600 font-medium' : 'text-slate-400'
          }`}
        >
          {isOverdue ? '⚠' : '📅'} {dueLabel}
        </p>
      )}
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
              className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              → {s.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default SortableTask;
