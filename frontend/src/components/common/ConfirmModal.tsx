import Modal from './Modal';

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
      <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm font-medium hover:bg-red-500 active:scale-[0.98] transition-all"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-md py-2 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-[0.98] transition-all"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
