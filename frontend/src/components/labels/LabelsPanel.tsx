import { useState } from 'react';
import { createLabel, updateLabel, deleteLabel } from '../../api/labels';
import type { Label } from '../../types';
import ConfirmModal from '../common/ConfirmModal';

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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">Manage labels</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Create */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg shrink-0">
            <p className="text-xs font-medium text-slate-500 mb-2">New label</p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
                placeholder="Label name"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => {
                  setNewColor(e.target.value);
                  setNewColorText(e.target.value);
                }}
                className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
              <input
                type="text"
                value={newColorText}
                onChange={(e) => syncNewColor(e.target.value)}
                placeholder="#6366f1"
                className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => void handleCreate()}
                disabled={saving || !newName.trim() || !HEX_RE.test(newColor)}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 space-y-2">
            {labels.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No labels yet — create one above
              </p>
            )}
            {labels.map((label) =>
              editingId === label.id ? (
                <div
                  key={label.id}
                  className="border border-blue-200 rounded-lg p-2.5 bg-blue-50/40 flex gap-2 items-center"
                >
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => {
                      setEditColor(e.target.value);
                      setEditColorText(e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={editColorText}
                    onChange={(e) => syncEditColor(e.target.value)}
                    className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => void handleUpdate()}
                    disabled={saving || !editName.trim() || !HEX_RE.test(editColor)}
                    className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  key={label.id}
                  className="border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-3"
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                    style={{ background: label.color }}
                  />
                  <span className="text-sm text-slate-700 flex-1 truncate">
                    {label.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {label.color}
                  </span>
                  <button
                    onClick={() => startEdit(label)}
                    className="text-xs text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(label.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded transition-colors"
                  >
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
