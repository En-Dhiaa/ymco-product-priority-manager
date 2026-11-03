import React from 'react';
import { X, ShieldCheck, UserCheck, Eye, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';
import { User } from '../types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, settings } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-ymco-50 dark:bg-ymco-950/50 text-ymco-primary border border-ymco-200 dark:border-ymco-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.switchRole}
              </h2>
              <span className="text-xs text-slate-500">Security & RBAC Permission Simulation</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User List */}
        <div className="p-6 space-y-3">
          {users.map((u) => {
            const isSelected = currentUser.id === u.id;
            const Icon = u.role === 'admin' ? ShieldCheck : u.role === 'editor' ? UserCheck : Eye;

            return (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u);
                  onClose();
                }}
                className={`w-full p-4 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-ymco-primary bg-ymco-50/50 dark:bg-ymco-950/30 ring-2 ring-ymco-primary/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      u.role === 'admin'
                        ? 'bg-rose-100 text-rose-700'
                        : u.role === 'editor'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{isAr ? u.nameAr : u.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {u.email}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {u.role === 'admin' ? t.roleAdmin : u.role === 'editor' ? t.roleEditor : t.roleViewer}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-ymco-primary text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
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
