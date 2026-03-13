import Modal from "./Modal";

const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Modal onClose={onCancel}>
      <p className="text-slate-700 text-sm mb-4">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
