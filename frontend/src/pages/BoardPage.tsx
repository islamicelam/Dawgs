import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTasks, createTask, reorderTasks, updateTask } from '../api/tasks';
import {
  getStatuses,
  createStatus,
  updateStatusOrder,
  updateStatus,
  deleteStatus,
} from '../api/statuses';
import { deleteBoard, getBoard, updateBoard } from '../api/boards';
import { getUsers } from '../api/users';
import type { Task, Status, Board, User } from '../types';
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

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);
  const navigate = useNavigate();

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

  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  const [filterAssignId, setFilterAssignId] = useState<number | ''>('');
  const me = JSON.parse(localStorage.getItem('me') ?? 'null') as User | null;
  const canDelete = me?.role === 'ADMIN';

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
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, [loadData]);

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

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

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
        if (
          overTask &&
          overTask.status?.id === tasks.find((t) => t.id === taskId)?.status?.id
        ) {
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
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-amber-50">
      <Header />

      <div className="bg-white/80 backdrop-blur border-b border-violet-100 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          ← Projects
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-800">
              {board?.name}
            </h1>
            <button
              onClick={() => setIsEditBoardOpen(true)}
              className="text-slate-300 hover:text-slate-600 transition-colors"
            >
              ✏️
            </button>
            {canDelete && (
              <button
              onClick={() => setIsDeleteBoardOpen(true)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              🗑️
            </button>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {statuses.length} columns · {tasks.length} tasks
          </p>
        </div>
        <button
          onClick={() => setIsStatusModalOpen(true)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          + Add column
        </button>
      </div>

      <div className="px-4 lg:px-6 pt-4 flex items-center gap-3">
        <span className="text-sm text-slate-500">Filter by:</span>
        <select
          value={filterAssignId}
          onChange={(e) =>
            setFilterAssignId(e.target.value ? Number(e.target.value) : '')
          }
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
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
          <div className="p-4 lg:p-6 flex gap-5 overflow-x-auto">
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
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-xl w-72">
              <p className="text-sm text-slate-700 font-medium">
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
          canDelete={canDelete}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={loadData}
        />
      )}

      {isStatusModalOpen && (
        <Modal onClose={() => setIsStatusModalOpen(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Add column
          </h2>
          <input
            type="text"
            placeholder="Column name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
          />
          <select
            value={newStatusCategory}
            onChange={(e) => setNewStatusCategory(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateStatus}
              className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
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
