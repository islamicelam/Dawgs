import { useState } from 'react';
import Modal from '../common/Modal';
import type { Project } from '../../types';
import {
  BUTTON_PRIMARY_CLS,
  BUTTON_SECONDARY_CLS,
  INPUT_CLS,
} from '../../constants/ui';

const ProjectFormModal = ({
  project,
  onSubmit,
  onClose,
}: {
  project?: Project; // если передан — режим редактирования
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        {project ? 'Edit project' : 'New project'}
      </h2>
      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${INPUT_CLS} mb-3`}
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${INPUT_CLS} mb-4`}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(name, description)}
          className={`flex-1 ${BUTTON_PRIMARY_CLS}`}
        >
          {project ? 'Save' : 'Create'}
        </button>
        <button onClick={onClose} className={`flex-1 ${BUTTON_SECONDARY_CLS}`}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ProjectFormModal;
