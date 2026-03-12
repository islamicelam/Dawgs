import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTasks, createTask, updateTask } from "../api/tasks";
import { getStatuses, createStatus } from "../api/statuses";
import { getBoard } from "../api/boards";
import type { Task, Status, Board } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  TODO: "border-t-slate-400",
  IN_PROGRESS: "border-t-blue-500",
  DONE: "border-t-emerald-500",
};

const CATEGORY_BADGE: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);

  const [board, setBoard] = useState<Board | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusCategory, setNewStatusCategory] = useState("TODO");

  const [addingTaskToStatus, setAddingTaskToStatus] = useState<number | null>(
    null,
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadData = async () => {
    const [boardRes, statusRes, taskRes] = await Promise.all([
      getBoard(boardId),
      getStatuses(boardId),
      getTasks(boardId),
    ]);
    setBoard(boardRes.data);
    setStatuses(statusRes.data);
    setTasks(taskRes.data);
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {board?.name}
          </h1>
          <p className="text-sm text-slate-400">
            {statuses.length} columns · {tasks.length} tasks
          </p>
        </div>
        <button
          onClick={() => setIsStatusModalOpen(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          + Add column
        </button>
      </div>

      {/* Board */}
      <div className="p-8 flex gap-5 overflow-x-auto">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((t) => t.status?.id === status.id);
          return (
            <div
              key={status.id}
              className={`flex-shrink-0 w-72 bg-white rounded-xl shadow-sm border-t-4 ${CATEGORY_COLORS[status.category] || "border-t-slate-300"}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    {status.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[status.category]}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-3 flex flex-col gap-2 min-h-24">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <p className="text-sm text-slate-700 font-medium">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {/* Move to other status */}
                    <div className="mt-2 hidden group-hover:flex gap-1 flex-wrap">
                      {statuses
                        .filter((s) => s.id !== status.id)
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleMoveTask(task.id, s.id)}
                            className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                          >
                            → {s.name}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task */}
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
                        e.key === "Enter" && handleCreateTask(status.id)
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
          );
        })}
      </div>

      {/* Add Status Modal */}
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
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
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
