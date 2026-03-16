import { useState } from "react";
import Modal from "../common/Modal";
import type { Project } from "../../types";

const ProjectFormModal = ({
  project,
  onSubmit,
  onClose,
}: {
  project?: Project; // если передан — режим редактирования
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {project ? "Edit project" : "New project"}
      </h2>
      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(name, description)}
          className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
        >
          {project ? "Save" : "Create"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ProjectFormModal;
