import { useState } from 'react';
import type { Task, Status } from '../../types';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SortableTask from './SortableTask';
import ConfirmModal from '../common/ConfirmModal';
import Modal from '../common/Modal';

const CATEGORY_COLORS: Record<string, string> = {
  TODO: 'border-t-slate-400',
  IN_PROGRESS: 'border-t-blue-500',
  DONE: 'border-t-emerald-500',
};

const CATEGORY_BADGE: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-emerald-100 text-emerald-700',
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
        className={`flex-shrink-0 w-72 bg-white rounded-xl shadow-sm border-t-4 ${CATEGORY_COLORS[status.category] || 'border-t-slate-300'}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="p-4 border-b border-slate-100 flex items-center justify-between cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{status.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[status.category]}`}
            >
              {tasks.length}
            </span>
          </div>
          <div className="hidden group-hover:flex gap-1">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
              className="text-slate-300 hover:text-slate-600 transition-colors text-sm px-1"
            >
              ✏️
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteOpen(true);
              }}
              className="text-slate-300 hover:text-red-500 transition-colors text-sm px-1"
            >
              🗑️
            </button>
          </div>
        </div>

        <SortableContext
          items={tasks.map((t) => `task-${t.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="p-3 flex flex-col gap-2 min-h-24">
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

        <div className="p-3 border-t border-slate-100">
          {addingTaskToStatus === status.id ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleCreateTask(status.id)
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateTask(status.id)}
                  className="flex-1 bg-slate-800 text-white rounded-lg py-1.5 text-xs hover:bg-slate-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTaskToStatus(null)}
                  className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-1.5 text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTaskToStatus(status.id)}
              className="w-full text-left text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
            >
              + Add task
            </button>
          )}
        </div>
      </div>

      {isEditOpen && (
        <Modal onClose={() => setIsEditOpen(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Edit column
          </h2>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditOpen(false)}
              className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
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
