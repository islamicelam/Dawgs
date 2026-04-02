import type { Task, Status } from "../../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-700 font-medium">{task.title}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
          {task.type === 'USER_STORY' ? 'Story' : task.type === 'EPIC' ? 'Epic' : 'Task'}
        </span>
      </div>
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
          {task.subtasks.filter((sub) => sub.done).length}/{task.subtasks.length} subtasks
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
