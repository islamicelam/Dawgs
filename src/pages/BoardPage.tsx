import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTasks, createTask, updateTask } from "../api/tasks";
import { getStatuses, createStatus, updateStatusOrder } from "../api/statuses";
import { getBoard } from "../api/boards";
import { getUsers } from "../api/users";
import type { Task, Status, Board, User } from "../types";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Header from "../components/Header";
import SortableColumn from "../components/board/SortableColumn";
import TaskModal from "../components/board/TaskModal";

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusCategory, setNewStatusCategory] = useState("TODO");
  const [addingTaskToStatus, setAddingTaskToStatus] = useState<number | null>(
    null,
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [boardId]);

  const handleCreateStatus = async () => {
    await createStatus(boardId, {
      name: newStatusName,
      category: newStatusCategory,
    });
    setIsStatusModalOpen(false);
    setNewStatusName("");
    const res = await getStatuses(boardId);
    setStatuses(res.data);
  };

  const handleCreateTask = async (statusId: number) => {
    await createTask(boardId, { title: newTaskTitle, statusId });
    setNewTaskTitle("");
    setAddingTaskToStatus(null);
    const res = await getTasks(boardId);
    setTasks(res.data);
  };

  const handleMoveTask = async (taskId: number, newStatusId: number) => {
    await updateTask(taskId, { statusId: newStatusId });
    const res = await getTasks(boardId);
    setTasks(res.data);
  };

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr.startsWith("task-") && overIdStr.startsWith("col-")) {
      const taskId = Number(activeIdStr.replace("task-", ""));
      const statusId = Number(overIdStr.replace("col-", ""));
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

    if (activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
      const oldIndex = statuses.findIndex((s) => `col-${s.id}` === activeIdStr);
      const newIndex = statuses.findIndex((s) => `col-${s.id}` === overIdStr);
      const newStatuses = arrayMove(statuses, oldIndex, newIndex);
      setStatuses(newStatuses);
      await updateStatusOrder(newStatuses.map((s) => s.id));
      return;
    }

    if (activeIdStr.startsWith("task-")) {
      const taskId = Number(activeIdStr.replace("task-", ""));
      let newStatusId: number | null = null;
      if (overIdStr.startsWith("col-"))
        newStatusId = Number(overIdStr.replace("col-", ""));
      else if (overIdStr.startsWith("task-"))
        newStatusId =
          tasks.find((t) => `task-${t.id}` === overIdStr)?.status?.id ?? null;
      if (newStatusId) await handleMoveTask(taskId, newStatusId);
    }
  };

  const activeTask = activeId?.startsWith("task-")
    ? tasks.find((t) => `task-${t.id}` === activeId)
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/projects")}
          className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          ← Projects
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            {board?.name}
          </h1>
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
          <div className="p-8 flex gap-5 overflow-x-auto">
            {statuses.map((status) => (
              <SortableColumn
                key={status.id}
                status={status}
                tasks={tasks.filter((t) => t.status?.id === status.id)}
                statuses={statuses}
                onMove={handleMoveTask}
                onSelect={setSelectedTask}
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
          statuses={statuses}
          users={users}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadData}
        />
      )}

      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
