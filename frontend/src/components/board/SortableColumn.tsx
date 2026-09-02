import { useState } from 'react';
import type { Task, Status } from '../../types';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import SortableTask from './SortableTask';
import ConfirmModal from '../common/ConfirmModal';
import Modal from '../common/Modal';
import {
  BUTTON_PRIMARY_CLS,
  BUTTON_SECONDARY_CLS,
  GHOST_ICON_BUTTON_CLS,
  INPUT_CLS,
} from '../../constants/ui';

const CATEGORY_DOT: Record<string, string> = {
  TODO: 'bg-neutral-400 dark:bg-neutral-500',
  IN_PROGRESS: 'bg-sky-500',
  DONE: 'bg-emerald-500',
};

const CATEGORY_BADGE: Record<string, string> = {
  TODO: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

const SortableColumn = ({
  status,
  tasks,
  statuses,
  onMove,
  onSelect,
  onEditStatus,
  onDeleteStatus,
  addingTaskToStatus,
  setAddingTaskToStatus,
  newTaskTitle,
  setNewTaskTitle,
  handleCreateTask,
}: {
  status: Status;
  tasks: Task[];
  statuses: Status[];
  onMove: (taskId: number, statusId: number) => void;
  onSelect: (task: Task) => void;
  onEditStatus: (statusId: number, name: string, category: string) => void;
  onDeleteStatus: (statusId: number) => void;
  addingTaskToStatus: number | null;
  setAddingTaskToStatus: (id: number | null) => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  handleCreateTask: (statusId: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${status.id}` });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(status.name);
  const [editCategory, setEditCategory] = useState(status.category);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    onEditStatus(status.id, editName, editCategory);
    setIsEditOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-72 bg-neutral-100/60 dark:bg-neutral-900/60 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80"
      >
        <div
          {...attributes}
          {...listeners}
          className="px-3.5 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_DOT[status.category] || 'bg-neutral-300'}`}
            />
            <span className="font-medium text-sm text-neutral-700 dark:text-neutral-200">
              {status.name}
            </span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[status.category]}`}
            >
              {tasks.length}
            </span>
          </div>
          <div className="hidden group-hover:flex gap-0.5">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
              className={`${GHOST_ICON_BUTTON_CLS} text-xs px-1.5 py-1 rounded`}
            >
              <PencilSimple size={15} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteOpen(true);
              }}
              className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors text-xs px-1.5 py-1 rounded"
            >
              <Trash size={15} />
            </button>
          </div>
        </div>

        <SortableContext
          items={tasks.map((t) => `task-${t.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="px-2.5 pb-2 flex flex-col gap-2 min-h-24">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                statuses={statuses}
                onMove={onMove}
                onSelect={onSelect}
              />
            ))}
          </div>
        </SortableContext>

        <div className="px-2.5 pb-2.5">
          {addingTaskToStatus === status.id ? (
            <div className="flex flex-col gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2">
              <input
                autoFocus
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleCreateTask(status.id)
                }
                className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateTask(status.id)}
                  className={`flex-1 ${BUTTON_PRIMARY_CLS} py-1.5 text-xs`}
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTaskToStatus(null)}
                  className={`flex-1 ${BUTTON_SECONDARY_CLS} py-1.5 text-xs`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTaskToStatus(status.id)}
              className="w-full text-left text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-white dark:hover:bg-neutral-900 rounded-md transition-colors py-1.5 px-2 -mx-0"
            >
              + Add task
            </button>
          )}
        </div>
      </div>

      {isEditOpen && (
        <Modal onClose={() => setIsEditOpen(false)}>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Edit column
          </h2>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={`${INPUT_CLS} mb-3`}
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className={`${INPUT_CLS} mb-4`}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleEdit} className={`flex-1 ${BUTTON_PRIMARY_CLS}`}>
              Save
            </button>
            <button
              onClick={() => setIsEditOpen(false)}
              className={`flex-1 ${BUTTON_SECONDARY_CLS}`}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {isDeleteOpen && (
        <ConfirmModal
          message="Are you sure you want to delete this column?"
          onConfirm={() => onDeleteStatus(status.id)}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </>
  );
};

export default SortableColumn;
