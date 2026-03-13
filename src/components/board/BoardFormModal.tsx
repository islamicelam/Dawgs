import { useState } from "react";
import Modal from "../common/Modal";

const BoardFormModal = ({
  initialName = "",
  onSubmit,
  onClose,
}: {
  initialName?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(initialName);

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {initialName ? "Edit board" : "New board"}
      </h2>
      <input
        autoFocus
        type="text"
        placeholder="Board name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(name)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(name)}
          className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
        >
          {initialName ? "Save" : "Create"}
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

export default BoardFormModal;
