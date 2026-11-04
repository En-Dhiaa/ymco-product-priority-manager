import React, { useState } from 'react';
import { X, Palette, Plus, Check, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { StatusConfig } from '../types';
import { translations } from '../utils/translations';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusManagerModal: React.FC<StatusManagerModalProps> = ({ isOpen, onClose }) => {
  const { statuses, updateStatusConfig, settings, currentUser } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isAdmin = currentUser.role === 'admin';

  const [localStatuses, setLocalStatuses] = useState<StatusConfig[]>([...statuses]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabelEn, setEditLabelEn] = useState('');
  const [editLabelAr, setEditLabelAr] = useState('');
  const [editColor, setEditColor] = useState('#2563eb');

  const [newLabelEn, setNewLabelEn] = useState('');
  const [newLabelAr, setNewLabelAr] = useState('');
  const [newColor, setNewColor] = useState('#10b981');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (s: StatusConfig) => {
    if (!isAdmin) return;
    setEditingId(s.id);
    setEditLabelEn(s.labelEn);
    setEditLabelAr(s.labelAr);
    setEditColor(s.color);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = localStatuses.map((s) =>
      s.id === editingId
        ? {
            ...s,
            labelEn: editLabelEn,
            labelAr: editLabelAr,
            color: editColor
          }
        : s
    );
    setLocalStatuses(updated);
    updateStatusConfig(updated);
    setEditingId(null);
  };

  const handleToggleActive = (id: string) => {
    if (!isAdmin) return;
    const updated = localStatuses.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setLocalStatuses(updated);
    updateStatusConfig(updated);
  };

  const handleAddNewStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelEn.trim()) return;

    const newId = newLabelEn.trim();
    const newStatus: StatusConfig = {
      id: newId,
      labelEn: newLabelEn.trim(),
      labelAr: newLabelAr.trim() || newLabelEn.trim(),
      color: newColor,
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
      isActive: true
    };

    const updated = [...localStatuses, newStatus];
    setLocalStatuses(updated);
    updateStatusConfig(updated);
    setNewLabelEn('');
    setNewLabelAr('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-ymco-50 dark:bg-ymco-950/50 text-ymco-primary border border-ymco-200 dark:border-ymco-800">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.manageStatuses}
              </h2>
              <span className="text-xs text-slate-500">Configure Color Codes & Arabic Labels</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isAdmin && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-200 flex items-center space-x-2 rtl:space-x-reverse">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.readOnlyNotice}</span>
            </div>
          )}

          {/* List of Statuses */}
          <div className="space-y-2">
            {localStatuses.map((st) => {
              const isEditing = editingId === st.id;

              return (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-3 gap-2 mr-2 rtl:ml-2">
                      <input
                        type="text"
                        value={editLabelEn}
                        onChange={(e) => setEditLabelEn(e.target.value)}
                        placeholder="English"
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded"
                      />
                      <input
                        type="text"
                        value={editLabelAr}
                        onChange={(e) => setEditLabelAr(e.target.value)}
                        placeholder="العربية"
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded"
                      />
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-7 h-7 rounded border cursor-pointer"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 text-xs bg-emerald-600 text-white rounded font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: st.color }} />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {st.labelEn}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {st.labelAr}
                        </div>
                      </div>
                    </div>
                  )}

                  {isAdmin && !isEditing && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleToggleActive(st.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                          st.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {st.isActive ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleStartEdit(st)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Status Form */}
          {isAdmin && (
            <div className="pt-2">
              {showAddForm ? (
                <form onSubmit={handleAddNewStatus} className="p-4 rounded-xl border border-ymco-200 dark:border-ymco-900 bg-ymco-50/50 dark:bg-ymco-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Create New Product Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="English Status Label"
                      value={newLabelEn}
                      onChange={(e) => setNewLabelEn(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="اسم الحالة بالعربية"
                      value={newLabelAr}
                      onChange={(e) => setNewLabelAr(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
                      <span>Pick Color:</span>
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 text-xs font-bold bg-ymco-primary text-white rounded-lg"
                      >
                        Add Status
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-ymco-primary rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4 text-ymco-primary" />
                  <span>Add Custom Status</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

