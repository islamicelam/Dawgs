import { useState } from 'react';
import { addTaskComment, deleteTask, updateTask } from '../../api/tasks';
import type { Task, Status, User } from '../../types';
import ConfirmModal from '../common/ConfirmModal';
import { improveText } from '../../api/ai';

const TaskModal = ({
  task,
  allTasks,
  statuses,
  users,
  canDelete,
  onClose,
  onUpdate,
}: {
  task: Task;
  allTasks: Task[];
  statuses: Status[];
  users: User[];
  canDelete: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [assignId, setAssignId] = useState<number | ''>(task.assign?.id ?? '');
  const [statusId, setStatusId] = useState<number | ''>(task.status?.id ?? '');
  const [type, setType] = useState<'TASK' | 'USER_STORY' | 'EPIC'>(
    task.type ?? 'TASK',
  );
  const [subtasks, setSubtasks] = useState(task.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState('');
  const [comment, setComment] = useState('');
  const [linkedTaskIds, setLinkedTaskIds] = useState<number[]>(
    task.linkedTaskIds ?? [],
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [parentEpicId, setParentEpicId] = useState<number | ''>(
    task.parentEpic?.id ?? '',
  );
  const [parentStoryId, setParentStoryId] = useState<number | ''>(
    task.parentStory?.id ?? '',
  );

  const appendMention = (name: string, target: 'description' | 'comment') => {
    const token = `@${name}`;
    if (target === 'description')
      setDescription((prev) => `${prev} ${token}`.trim());
    else setComment((prev) => `${prev} ${token}`.trim());
  };

  const handleSave = async () => {
    await updateTask(task.id, {
      title,
      description,
      assignId: assignId !== '' ? assignId : undefined,
      statusId: statusId !== '' ? statusId : undefined,
      type,
      subtasks,
      linkedTaskIds,
      parentEpicId: parentEpicId !== '' ? parentEpicId : null,
      parentStoryId: parentStoryId !== '' ? parentStoryId : null,
    });
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onUpdate();
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newSubtask.trim(), done: false },
    ]);
    setNewSubtask('');
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addTaskComment(task.id, comment.trim());
    setComment('');
    onUpdate();
  };

  const [isImproving, setIsImproving] = useState(false);

  const handleImprove = async () => {
    if (!description.trim()) return;
    setIsImproving(true);
    const data = await improveText(description);
    setDescription(data);
    setIsImproving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[760px] shadow-xl max-h-[90vh] overflow-y-auto">
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
            <div className="text-xs text-violet-500">
              Mention users by clicking names below
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => appendMention(user.name, 'description')}
                  className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full hover:bg-violet-200"
                >
                  @{user.name}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Type</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'TASK' | 'USER_STORY' | 'EPIC')
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="TASK">Task</option>
                <option value="USER_STORY">User story</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
            {type !== 'EPIC' && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Parent Epic
                </label>
                <select
                  value={parentEpicId}
                  onChange={(e) =>
                    setParentEpicId(
                      e.target.value ? Number(e.target.value) : '',
                    )
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">No Epic</option>
                  {allTasks
                    .filter((t) => t.type === 'EPIC' && t.id !== task.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.id} {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {type === 'TASK' && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Parent Story
                </label>
                <select
                  value={parentStoryId}
                  onChange={(e) => {
                    setParentStoryId(
                      e.target.value ? Number(e.target.value) : '',
                    );
                    if (e.target.value) setParentEpicId(''); // mutual exclusivity
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">No Story</option>
                  {allTasks
                    .filter((t) => t.type === 'USER_STORY' && t.id !== task.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.id} {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

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
              <button
                onClick={handleImprove}
                disabled={isImproving || !description.trim()}
                className="mt-1 px-3 py-1 text-xs bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 disabled:opacity-50"
              >
                {isImproving ? 'Improving...' : '✨ Improve with AI'}
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">
                Linked tasks
              </label>
              <select
                multiple
                value={linkedTaskIds.map(String)}
                onChange={(e) =>
                  setLinkedTaskIds(
                    Array.from(e.target.selectedOptions).map((option) =>
                      Number(option.value),
                    ),
                  )
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-24"
              >
                {allTasks
                  .filter((candidate) => candidate.id !== task.id)
                  .map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      #{candidate.id} {candidate.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">
                Subtasks
              </label>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <label
                    key={subtask.id}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.done}
                      onChange={() =>
                        setSubtasks((prev) =>
                          prev.map((item) =>
                            item.id === subtask.id
                              ? { ...item, done: !item.done }
                              : item,
                          ),
                        )
                      }
                    />
                    {subtask.text}
                  </label>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-3 rounded-lg bg-slate-100 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Comments
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                  {(task.comments ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 rounded-lg p-2 text-xs"
                    >
                      <div className="font-semibold text-slate-700">
                        {item.createdByName}
                      </div>
                      <div className="text-slate-600">{item.text}</div>
                      {!!item.mentions?.length && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.mentions.map((mention) => (
                            <span
                              key={mention}
                              className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700"
                            >
                              @{mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Write a comment with @mention"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => appendMention(user.name, 'comment')}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200"
                    >
                      @{user.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddComment}
                  className="mt-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
                >
                  Add comment
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Task history
                </label>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {(task.history ?? [])
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600"
                      >
                        <span className="font-medium text-slate-700">
                          {item.createdByName}
                        </span>{' '}
                        {item.action}
                      </div>
                    ))}
                </div>
              </div>
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
              {canDelete && (
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="w-full bg-red-50 text-red-500 border border-red-200 rounded-lg py-2 text-sm hover:bg-red-100 transition-colors"
                >
                  Delete task
                </button>
              )}
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
