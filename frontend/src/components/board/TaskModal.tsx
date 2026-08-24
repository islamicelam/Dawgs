import { useState } from 'react';
import { addTaskComment, deleteTask, updateTask } from '../../api/tasks';
import type { Task, Status, User, TaskPriority, Label } from '../../types';
import { TASK_PRIORITIES, PRIORITY_LABEL } from '../../constants/task';
import ConfirmModal from '../common/ConfirmModal';
import { improveText } from '../../api/ai';
import {
  BUTTON_DANGER_CLS,
  BUTTON_PRIMARY_CLS,
  BUTTON_SECONDARY_CLS,
  INPUT_CLS,
  LABEL_CLS,
} from '../../constants/ui';

const TaskModal = ({
  task,
  allTasks,
  statuses,
  users,
  labels,
  canDelete,
  onClose,
  onUpdate,
}: {
  task: Task;
  allTasks: Task[];
  statuses: Status[];
  users: User[];
  labels: Label[];
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
  const [priority, setPriority] = useState<TaskPriority>(
    task.priority ?? 'MEDIUM',
  );
  const [dueDate, setDueDate] = useState((task.dueDate ?? '').slice(0, 10));
  const [labelIds, setLabelIds] = useState<number[]>(
    task.labels?.map((l) => l.id) ?? [],
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
      priority,
      dueDate: dueDate || null,
      subtasks,
      linkedTaskIds,
      parentEpicId: parentEpicId !== '' ? parentEpicId : null,
      parentStoryId: parentStoryId !== '' ? parentStoryId : null,
      labelIds,
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

  const TYPE_LABEL: Record<typeof type, string> = {
    TASK: 'Task',
    USER_STORY: 'User story',
    EPIC: 'Epic',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 w-[960px] max-w-full max-h-[88vh] flex flex-col overflow-hidden animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 dark:text-neutral-500">
              <span className="text-neutral-500 dark:text-neutral-400">
                #{task.id}
              </span>
              <span>·</span>
              <span>{TYPE_LABEL[type]}</span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
            {/* Main column */}
            <div className="flex-1 min-w-0 p-6 space-y-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full text-xl font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent border-none outline-none focus:ring-0 placeholder-neutral-300 dark:placeholder-neutral-600 -ml-0.5"
              />

              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Add a description..."
                  className={`${INPUT_CLS} resize-none`}
                />
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-0.5 self-center">
                      Mention:
                    </span>
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => appendMention(user.name, 'description')}
                        className="text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        @{user.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleImprove}
                    disabled={isImproving || !description.trim()}
                    className="px-3 py-1 text-xs bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-500/20 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isImproving ? 'Improving...' : '✨ Improve with AI'}
                  </button>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Subtasks</label>
                <div className="space-y-1.5">
                  {subtasks.map((subtask) => (
                    <label
                      key={subtask.id}
                      className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 py-0.5"
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
                        className="accent-indigo-600"
                      />
                      <span className={subtask.done ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                        {subtask.text}
                      </span>
                    </label>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                      placeholder="Add subtask..."
                      className={`flex-1 ${INPUT_CLS} py-1.5`}
                    />
                    <button
                      onClick={handleAddSubtask}
                      className={`${BUTTON_SECONDARY_CLS} px-3 py-1.5`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Linked tasks</label>
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
                  className={`${INPUT_CLS} min-h-24`}
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
                <label className={LABEL_CLS}>Comments</label>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                  {(task.comments ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-2.5 text-xs"
                    >
                      <div className="font-semibold text-neutral-700 dark:text-neutral-200">
                        {item.createdByName}
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                        {item.text}
                      </div>
                      {!!item.mentions?.length && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.mentions.map((mention) => (
                            <span
                              key={mention}
                              className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
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
                  className={`${INPUT_CLS} resize-none`}
                  placeholder="Write a comment with @mention"
                />
                <div className="mt-1.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => appendMention(user.name, 'comment')}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                      >
                        @{user.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleAddComment}
                    className={`${BUTTON_PRIMARY_CLS} px-3 py-1.5 text-xs shrink-0`}
                  >
                    Add comment
                  </button>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Activity</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {(task.history ?? [])
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.id}
                        className="text-xs text-neutral-500 dark:text-neutral-400 py-1 border-b border-neutral-100 dark:border-neutral-800/70 last:border-b-0"
                      >
                        <span className="font-medium text-neutral-700 dark:text-neutral-200">
                          {item.createdByName}
                        </span>{' '}
                        {item.action}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 p-5 space-y-4">
              <div>
                <label className={LABEL_CLS}>Status</label>
                <select
                  value={statusId}
                  onChange={(e) =>
                    setStatusId(e.target.value ? Number(e.target.value) : '')
                  }
                  className={INPUT_CLS}
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Assignee</label>
                <select
                  value={assignId}
                  onChange={(e) =>
                    setAssignId(e.target.value ? Number(e.target.value) : '')
                  }
                  className={INPUT_CLS}
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
                <label className={LABEL_CLS}>Type</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'TASK' | 'USER_STORY' | 'EPIC')
                  }
                  className={INPUT_CLS}
                >
                  <option value="TASK">Task</option>
                  <option value="USER_STORY">User story</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={INPUT_CLS}
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {type !== 'EPIC' && (
                <div>
                  <label className={LABEL_CLS}>Parent Epic</label>
                  <select
                    value={parentEpicId}
                    onChange={(e) =>
                      setParentEpicId(
                        e.target.value ? Number(e.target.value) : '',
                      )
                    }
                    className={INPUT_CLS}
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
                  <label className={LABEL_CLS}>Parent Story</label>
                  <select
                    value={parentStoryId}
                    onChange={(e) => {
                      setParentStoryId(
                        e.target.value ? Number(e.target.value) : '',
                      );
                      if (e.target.value) setParentEpicId(''); // mutual exclusivity
                    }}
                    className={INPUT_CLS}
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

              {labels.length > 0 && (
                <div>
                  <label className={LABEL_CLS}>Labels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map((label) => {
                      const active = labelIds.includes(label.id);
                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() =>
                            setLabelIds((prev) =>
                              active
                                ? prev.filter((id) => id !== label.id)
                                : [...prev, label.id],
                            )
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? 'text-white border-transparent shadow-sm'
                              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                          style={
                            active
                              ? { background: label.color, borderColor: label.color }
                              : {}
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: active ? 'white' : label.color }}
                          />
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
            {canDelete ? (
              <button
                onClick={() => setIsDeleteOpen(true)}
                className={BUTTON_DANGER_CLS + ' px-4'}
              >
                Delete task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className={BUTTON_SECONDARY_CLS}>
                Cancel
              </button>
              <button onClick={handleSave} className={BUTTON_PRIMARY_CLS}>
                Save
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
