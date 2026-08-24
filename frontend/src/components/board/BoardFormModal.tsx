import { useState } from 'react';
import Modal from '../common/Modal';
import {
  BUTTON_PRIMARY_CLS,
  BUTTON_SECONDARY_CLS,
  INPUT_CLS,
} from '../../constants/ui';

const BoardFormModal = ({
  initialName = '',
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
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        {initialName ? 'Edit board' : 'New board'}
      </h2>
      <input
        autoFocus
        type="text"
        placeholder="Board name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit(name)}
        className={`${INPUT_CLS} mb-4`}
      />
      <div className="flex gap-2">
        <button onClick={() => onSubmit(name)} className={`flex-1 ${BUTTON_PRIMARY_CLS}`}>
          {initialName ? 'Save' : 'Create'}
        </button>
        <button onClick={onClose} className={`flex-1 ${BUTTON_SECONDARY_CLS}`}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default BoardFormModal;
