import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types";

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onAddBoard,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onAddBoard: (projectId: number, name: string) => void;
}) => {
  const navigate = useNavigate();
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;
    onAddBoard(project.id, newBoardName);
    setNewBoardName("");
    setIsAddingBoard(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">{project.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{project.description}</p>
        </div>
        <div className="hidden group-hover:flex gap-1 ml-2">
          <button
            onClick={() => onEdit(project)}
            className="text-slate-300 hover:text-slate-600 text-sm px-1 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-slate-300 hover:text-red-500 text-sm px-1 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {project.boards.length === 0 && (
          <p className="text-xs text-slate-300 text-center py-2">
            No boards yet
          </p>
        )}
        {project.boards.map((board) => (
          <div
            key={board.id}
            onClick={() => navigate(`/boards/${board.id}`)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group/board"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 group-hover/board:bg-blue-500 transition-colors" />
            <span className="text-sm text-slate-600 group-hover/board:text-slate-800 transition-colors">
              {board.name}
            </span>
          </div>
        ))}

        {isAddingBoard ? (
          <div className="flex gap-2 mt-1">
            <input
              autoFocus
              type="text"
              placeholder="Board name..."
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
              className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={() => setIsAddingBoard(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingBoard(true)}
            className="w-full text-left text-xs text-slate-300 hover:text-slate-500 mt-1 py-1 transition-colors"
          >
            + Add board
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
