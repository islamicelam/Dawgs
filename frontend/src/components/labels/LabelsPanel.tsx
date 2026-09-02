import { useState } from 'react';
import { X, PencilSimple, Trash } from '@phosphor-icons/react';
import { createLabel, updateLabel, deleteLabel } from '../../api/labels';
import type { Label } from '../../types';
import ConfirmModal from '../common/ConfirmModal';
import { BUTTON_PRIMARY_CLS, GHOST_ICON_BUTTON_CLS } from '../../constants/ui';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const LabelsPanel = ({
  projectId,
  labels,
  onClose,
  onUpdate,
}: {
  projectId: number;
  labels: Label[];
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newColorText, setNewColorText] = useState('#6366f1');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editColorText, setEditColorText] = useState('');

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const syncNewColor = (hex: string) => {
    setNewColorText(hex);
    if (HEX_RE.test(hex)) setNewColor(hex);
  };

  const syncEditColor = (hex: string) => {
    setEditColorText(hex);
    if (HEX_RE.test(hex)) setEditColor(hex);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !HEX_RE.test(newColor)) return;
    setSaving(true);
    try {
      await createLabel(projectId, { name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor('#6366f1');
      setNewColorText('#6366f1');
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setEditColorText(label.color);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim() || !HEX_RE.test(editColor)) return;
    setSaving(true);
    try {
      await updateLabel(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteLabel(deletingId);
    setDeletingId(null);
    onUpdate();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 w-[500px] shadow-xl shadow-black/10 dark:shadow-black/40 max-h-[80vh] flex flex-col animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Manage labels
            </h2>
            <button onClick={onClose} className={GHOST_ICON_BUTTON_CLS}>
              <X size={14} />
            </button>
          </div>

          {/* Create */}
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg shrink-0">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              New label
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
                placeholder="Label name"
                className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => {
                  setNewColor(e.target.value);
                  setNewColorText(e.target.value);
                }}
                className="w-9 h-9 rounded-md cursor-pointer border border-neutral-200 dark:border-neutral-800 p-0.5 bg-white dark:bg-neutral-900"
              />
              <input
                type="text"
                value={newColorText}
                onChange={(e) => syncNewColor(e.target.value)}
                placeholder="#6366f1"
                className="w-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1.5 text-xs font-mono text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              />
              <button
                onClick={() => void handleCreate()}
                disabled={saving || !newName.trim() || !HEX_RE.test(newColor)}
                className={`${BUTTON_PRIMARY_CLS} px-3 py-1.5 shrink-0`}
              >
                Add
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 space-y-2">
            {labels.length === 0 && (
              <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-6">
                No labels yet — create one above
              </p>
            )}
            {labels.map((label) =>
              editingId === label.id ? (
                <div
                  key={label.id}
                  className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-2.5 bg-neutral-100 dark:bg-neutral-800/50 flex gap-2 items-center"
                >
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => {
                      setEditColor(e.target.value);
                      setEditColorText(e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer border border-neutral-200 dark:border-neutral-800 p-0.5 bg-white dark:bg-neutral-900"
                  />
                  <input
                    type="text"
                    value={editColorText}
                    onChange={(e) => syncEditColor(e.target.value)}
                    className="w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-xs font-mono text-neutral-700 dark:text-neutral-300 focus:outline-none"
                  />
                  <button
                    onClick={() => void handleUpdate()}
                    disabled={saving || !editName.trim() || !HEX_RE.test(editColor)}
                    className={`${BUTTON_PRIMARY_CLS} px-2.5 py-1 text-xs`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-md text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  key={label.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 flex items-center gap-3"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                    style={{ background: label.color }}
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-200 flex-1 truncate">
                    {label.name}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {label.color}
                  </span>
                  <button
                    onClick={() => startEdit(label)}
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-0.5 rounded transition-colors"
                  >
                    <PencilSimple size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(label.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-400 dark:text-red-500/80 hover:text-red-600 dark:hover:text-red-400 px-2 py-0.5 rounded transition-colors"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {deletingId !== null && (
        <ConfirmModal
          message="Delete this label? It will be removed from all tasks."
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
};

export default LabelsPanel;
