import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { BUTTON_SECONDARY_CLS, INPUT_CLS } from '../../constants/ui';

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  canDelete,
  onAddBoard,
  onManageShare,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
  onAddBoard: (projectId: number, name: string) => void;
  onManageShare: (project: Project) => void;
}) => {
  const navigate = useNavigate();
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;
    onAddBoard(project.id, newBoardName);
    setNewBoardName('');
    setIsAddingBoard(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
        <div className="min-w-0">
          <h2 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {project.name}
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
            {project.description}
          </p>
        </div>
        <div className="hidden group-hover:flex gap-0.5 ml-2 shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 text-sm px-1 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onManageShare(project)}
            className="text-neutral-400 hover:text-indigo-600 dark:text-neutral-500 dark:hover:text-indigo-400 text-sm px-1 transition-colors"
            title="Share project"
          >
            👥
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 text-sm px-1 transition-colors"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="p-2.5 flex flex-col gap-1.5">
        {project.boards.length === 0 && (
          <p className="text-xs text-neutral-300 dark:text-neutral-600 text-center py-2">
            No boards yet
          </p>
        )}
        {project.boards.map((board) => (
          <div
            key={board.id}
            onClick={() =>
              navigate(`/boards/${board.id}?projectId=${project.id}`)
            }
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors group/board"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />
            <span className="text-sm text-neutral-600 dark:text-neutral-300 group-hover/board:text-neutral-900 dark:group-hover/board:text-neutral-100 transition-colors truncate">
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
              onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()}
              className={`flex-1 ${INPUT_CLS} py-1.5`}
            />
            <button
              onClick={() => setIsAddingBoard(false)}
              className={`${BUTTON_SECONDARY_CLS} px-2.5 py-1.5 text-xs`}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingBoard(true)}
            className="w-full text-left text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 mt-0.5 py-1 px-1 transition-colors"
          >
            + Add board
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
