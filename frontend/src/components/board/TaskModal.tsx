import { useState } from 'react';
import { updateTask, deleteTask } from '../../api/tasks';
import type { Task, Status, User } from '../../types';
import ConfirmModal from '../common/ConfirmModal';

const TaskModal = ({
  task,
  statuses,
  users,
  onClose,
  onUpdate,
}: {
  task: Task;
  statuses: Status[];
  users: User[];
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [assignId, setAssignId] = useState<number | ''>(task.assign?.id ?? '');
  const [statusId, setStatusId] = useState<number | ''>(task.status?.id ?? '');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleSave = async () => {
    await updateTask(task.id, {
      title,
      description,
      assignId: assignId !== '' ? assignId : undefined,
      statusId: statusId !== '' ? statusId : undefined,
    });
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onUpdate();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Task details
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">
                Assignee
              </label>
              <select
                value={assignId}
                onChange={(e) =>
                  setAssignId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">
                Status
              </label>
              <select
                value={statusId}
                onChange={(e) =>
                  setStatusId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="w-full bg-red-50 text-red-500 border border-red-200 rounded-lg py-2 text-sm hover:bg-red-100 transition-colors"
              >
                Delete task
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDeleteOpen && (
        <ConfirmModal
          message="Are you sure you want to delete this task?"
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </>
  );
};

export default TaskModal;
