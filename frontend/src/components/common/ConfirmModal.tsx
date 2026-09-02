import { Trash } from '@phosphor-icons/react';
import Modal from './Modal';
import { BUTTON_DANGER_CLS, BUTTON_SECONDARY_CLS } from '../../constants/ui';

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
        <button onClick={onConfirm} className={`flex-1 ${BUTTON_DANGER_CLS}`}>
          <Trash size={15} />
          Delete
        </button>
        <button onClick={onCancel} className={`flex-1 ${BUTTON_SECONDARY_CLS}`}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
