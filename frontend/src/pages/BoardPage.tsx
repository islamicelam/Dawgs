import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getTasks, createTask, reorderTasks, updateTask } from '../api/tasks';
import { getLabels } from '../api/labels';
import {
  getStatuses,
  createStatus,
  updateStatusOrder,
  updateStatus,
  deleteStatus,
} from '../api/statuses';
import { deleteBoard, getBoard, updateBoard } from '../api/boards';
import { getUsers } from '../api/users';
import type { Task, Status, Board, User, Label, PresenceUser } from '../types';
import { useBoardSocket } from '../hooks/useBoardSocket';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import Header from '../components/Header';
import SortableColumn from '../components/board/SortableColumn';
import TaskModal from '../components/board/TaskModal';
import BoardFormModal from '../components/board/BoardFormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Modal from '../components/common/Modal';
import LabelsPanel from '../components/labels/LabelsPanel';
import {
  BUTTON_PRIMARY_CLS,
  BUTTON_SECONDARY_CLS,
  GHOST_ICON_BUTTON_CLS,
  INPUT_CLS,
} from '../constants/ui';

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectId, setProjectId] = useState<number | null>(null);

  const [board, setBoard] = useState<Board | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusCategory, setNewStatusCategory] = useState('TODO');
  const [addingTaskToStatus, setAddingTaskToStatus] = useState<number | null>(
    null,
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dragOriginStatusId, setDragOriginStatusId] = useState<number | null>(
    null,
  );

  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  const [filterAssignId, setFilterAssignId] = useState<number | ''>('');
  const [filterLabelId, setFilterLabelId] = useState<number | ''>('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLabelsPanelOpen, setIsLabelsPanelOpen] = useState(false);
  const me = JSON.parse(localStorage.getItem('me') ?? 'null') as User | null;
  const canDelete = me?.role === 'ADMIN';

  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const loadData = useCallback(async () => {
    const [boardRes, statusRes, taskRes, usersRes] = await Promise.all([
      getBoard(boardId),
      getStatuses(boardId),
      getTasks(boardId),
      getUsers(),
    ]);
    setBoard(boardRes.data);
    setStatuses(statusRes.data);
    setTasks(taskRes.data);
    setUsers(usersRes.data);

    const pid: number | undefined = boardRes.data?.project?.id;
    if (pid) {
      setProjectId(pid);
      const labelsRes = await getLabels(pid);
      setLabels(labelsRes.data);
    }

    setLoading(false);

    const taskId = searchParams.get('taskId');
    if (taskId && taskRes.data.some((t: Task) => t.id === Number(taskId))) {
      setSelectedTaskId(Number(taskId));
      setSearchParams({}, { replace: true });
    }
  }, [boardId, searchParams, setSearchParams]);

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, [loadData]);

  useBoardSocket(projectId, {
    onTaskCreated: (task) =>
      setTasks((prev) =>
        prev.some((t) => t.id === task.id) ? prev : [...prev, task],
      ),
    onTaskUpdated: (task) =>
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))),
    onTaskDeleted: (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedTaskId((prev) => (prev === id ? null : prev));
    },
    onTaskReordered: (taskIds) =>
      setTasks((prev) =>
        prev.map((t) => {
          const idx = taskIds.indexOf(t.id);
          return idx === -1 ? t : { ...t, order: idx };
        }),
      ),
    onPresence: (users) => setPresenceUsers(users),
  });

  const handleCreateStatus = async () => {
    await createStatus(boardId, {
      name: newStatusName,
      category: newStatusCategory,
    });
    setIsStatusModalOpen(false);
    setNewStatusName('');
    const res = await getStatuses(boardId);
    setStatuses(res.data);
  };

  const handleCreateTask = async (statusId: number) => {
    await createTask(boardId, { title: newTaskTitle, statusId });
    setNewTaskTitle('');
    setAddingTaskToStatus(null);
    const res = await getTasks(boardId);
    setTasks(res.data);
  };

  const handleUpdateBoard = async (name: string) => {
    await updateBoard(boardId, { name });
    setIsEditBoardOpen(false);
    const res = await getBoard(boardId);
    setBoard(res.data);
  };

  const handleDeleteBoard = async () => {
    await deleteBoard(boardId);
    navigate('/projects');
  };

  const handleMoveTask = async (taskId: number, newStatusId: number) => {
    await updateTask(taskId, { statusId: newStatusId });
    const res = await getTasks(boardId);
    setTasks(res.data);
  };

  const handleEditStatus = async (
    statusId: number,
    name: string,
    category: string,
  ) => {
    await updateStatus(statusId, { name, category });
    const res = await getStatuses(boardId);
    setStatuses(res.data);
  };

  const handleDeleteStatus = async (statusId: number) => {
    await deleteStatus(statusId);
    const res = await getStatuses(boardId);
    setStatuses(res.data);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    if (id.startsWith('task-')) {
      const taskId = Number(id.replace('task-', ''));
      const task = tasks.find((t) => t.id === taskId);
      setDragOriginStatusId(task?.status?.id ?? null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr.startsWith('task-') && overIdStr.startsWith('col-')) {
      const taskId = Number(activeIdStr.replace('task-', ''));
      const statusId = Number(overIdStr.replace('col-', ''));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: statuses.find((s) => s.id === statusId) }
            : t,
        ),
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr.startsWith('col-') && overIdStr.startsWith('col-')) {
      const oldIndex = statuses.findIndex((s) => `col-${s.id}` === activeIdStr);
      const newIndex = statuses.findIndex((s) => `col-${s.id}` === overIdStr);
      const newStatuses = arrayMove(statuses, oldIndex, newIndex);
      setStatuses(newStatuses);
      await updateStatusOrder(newStatuses.map((s) => s.id));
      return;
    }

    if (activeIdStr.startsWith('task-')) {
      const taskId = Number(activeIdStr.replace('task-', ''));
      let newStatusId: number | null = null;
      if (overIdStr.startsWith('col-'))
        newStatusId = Number(overIdStr.replace('col-', ''));
      else if (overIdStr.startsWith('task-')) {
        const overTask = tasks.find((t) => `task-${t.id}` === overIdStr);
        newStatusId = overTask?.status?.id ?? null;
        if (overTask && overTask.status?.id === dragOriginStatusId) {
          const statusTasks = tasks
            .filter((t) => t.status?.id === overTask.status?.id)
            .sort((a, b) => a.order - b.order);
          const oldIndex = statusTasks.findIndex((t) => t.id === taskId);
          const newIndex = statusTasks.findIndex((t) => t.id === overTask.id);
          const moved = arrayMove(statusTasks, oldIndex, newIndex);
          const updated = tasks.map((task) => {
            const idx = moved.findIndex((t) => t.id === task.id);
            return idx === -1 ? task : { ...task, order: idx };
          });
          setTasks(updated);
          await reorderTasks(moved.map((t) => t.id));
          return;
        }
      }
      if (newStatusId) await handleMoveTask(taskId, newStatusId);
    }
  };

  const activeTask = activeId?.startsWith('task-')
    ? tasks.find((t) => `task-${t.id}` === activeId)
    : null;
  const selectedTask = selectedTaskId
    ? (tasks.find((t) => t.id === selectedTaskId) ?? null)
    : null;

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 dark:text-neutral-500 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <div className="bg-white/70 dark:bg-neutral-900/40 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 text-sm transition-colors shrink-0"
        >
          ← Projects
        </button>
        <div className="flex flex-col items-center min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {board?.name}
            </h1>
            <button
              onClick={() => setIsEditBoardOpen(true)}
              className={`${GHOST_ICON_BUTTON_CLS} text-sm`}
            >
              ✏️
            </button>
            {canDelete && (
              <button
                onClick={() => setIsDeleteBoardOpen(true)}
                className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors text-sm"
              >
                🗑️
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {statuses.length} columns · {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {presenceUsers.length > 0 && (
            <div className="flex items-center -space-x-2">
              {presenceUsers
                .filter(
                  (u, idx) =>
                    presenceUsers.findIndex((x) => x.userId === u.userId) ===
                    idx,
                )
                .map((u) => (
                  <div
                    key={u.userId}
                    title={u.name}
                    className="w-7 h-7 rounded-full bg-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-sm"
                  >
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                ))}
            </div>
          )}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className={`${BUTTON_PRIMARY_CLS} text-sm`}
          >
            + Add column
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 pt-3.5 flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          Filter
        </span>
        <select
          value={filterAssignId}
          onChange={(e) =>
            setFilterAssignId(e.target.value ? Number(e.target.value) : '')
          }
          className={`${INPUT_CLS} w-auto py-1.5 text-xs`}
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        {projectId !== null && (
          <select
            value={filterLabelId}
            onChange={(e) =>
              setFilterLabelId(e.target.value ? Number(e.target.value) : '')
            }
            className={`${INPUT_CLS} w-auto py-1.5 text-xs`}
          >
            <option value="">All labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}
        {filterLabelId !== '' && (
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white font-medium"
            style={{
              background:
                labels.find((l) => l.id === filterLabelId)?.color ?? '#a1a1aa',
            }}
          >
            {labels.find((l) => l.id === filterLabelId)?.name}
          </span>
        )}
        <div className="ml-auto">
          {projectId !== null && (
            <button
              onClick={() => setIsLabelsPanelOpen(true)}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              🏷 Labels
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={statuses.map((s) => `col-${s.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="p-4 lg:p-6 flex gap-4 overflow-x-auto items-start">
            {statuses.map((status) => (
              <SortableColumn
                key={status.id}
                status={status}
                tasks={tasks
                  .filter((t) => t.status?.id === status.id)
                  .sort((a, b) => a.order - b.order)
                  .filter(
                    (t) =>
                      filterAssignId === '' || t.assign?.id === filterAssignId,
                  )
                  .filter(
                    (t) =>
                      filterLabelId === '' ||
                      t.labels?.some((l) => l.id === filterLabelId),
                  )}
                statuses={statuses}
                onMove={handleMoveTask}
                onSelect={(task) => setSelectedTaskId(task.id)}
                onEditStatus={handleEditStatus}
                onDeleteStatus={handleDeleteStatus}
                addingTaskToStatus={addingTaskToStatus}
                setAddingTaskToStatus={setAddingTaskToStatus}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                handleCreateTask={handleCreateTask}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 shadow-xl w-72">
              <p className="text-sm text-neutral-800 dark:text-neutral-100 font-medium">
                {activeTask.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          allTasks={tasks}
          statuses={statuses}
          users={users}
          labels={labels}
          canDelete={canDelete}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={loadData}
        />
      )}

      {isLabelsPanelOpen && projectId !== null && (
        <LabelsPanel
          projectId={projectId}
          labels={labels}
          onClose={() => setIsLabelsPanelOpen(false)}
          onUpdate={() => void loadData()}
        />
      )}

      {isStatusModalOpen && (
        <Modal onClose={() => setIsStatusModalOpen(false)}>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Add column
          </h2>
          <input
            type="text"
            placeholder="Column name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            className={`${INPUT_CLS} mb-3`}
          />
          <select
            value={newStatusCategory}
            onChange={(e) => setNewStatusCategory(e.target.value)}
            className={`${INPUT_CLS} mb-4`}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateStatus}
              className={`flex-1 ${BUTTON_PRIMARY_CLS}`}
            >
              Create
            </button>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className={`flex-1 ${BUTTON_SECONDARY_CLS}`}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {isEditBoardOpen && (
        <BoardFormModal
          initialName={board?.name}
          onSubmit={handleUpdateBoard}
          onClose={() => setIsEditBoardOpen(false)}
        />
      )}

      {isDeleteBoardOpen && canDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this board?"
          onConfirm={handleDeleteBoard}
          onCancel={() => setIsDeleteBoardOpen(false)}
        />
      )}
    </div>
  );
};

export default BoardPage;
