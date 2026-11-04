import React from 'react';
import { X, History, User, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, settings, canUndo, undoLastReorder } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-ymco-50 dark:bg-ymco-950/50 text-ymco-primary border border-ymco-200 dark:border-ymco-800">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.historyTitle}
              </h2>
              <span className="text-xs text-slate-500">Chronological Operations & Priority Audit Log</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canUndo && (
              <button
                onClick={() => {
                  undoLastReorder();
                }}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                <span>{t.undoReorder}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {auditLogs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              {t.noHistory}
            </div>
          ) : (
            auditLogs.map((log) => {
              const actionBadge =
                log.action === 'create'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : log.action === 'delete'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : log.action === 'reorder'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : log.action === 'bulk_update'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-slate-800 dark:text-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${actionBadge}`}>
                        {log.action}
                      </span>
                      <span>{log.productName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">
                    {isAr ? log.descriptionAr : log.descriptionEn}
                  </p>

                  {(log.previousValue || log.newValue) && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] text-slate-500 bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700 font-mono w-fit">
                      <span className="line-through text-slate-400">{log.previousValue}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-ymco-primary">{log.newValue}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1">
                    <User className="w-3 h-3" />
                    <span>Actor: {log.userName} ({log.userRole})</span>
                  </div>
                </div>
              );
            })
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

