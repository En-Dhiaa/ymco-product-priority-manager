import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  History,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  Shield,
  Palette,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

interface HeaderProps {
  onOpenPdf: () => void;
  onOpenExcel: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenStatusManager: () => void;
  onOpenUserModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPdf,
  onOpenExcel,
  onOpenHistory,
  onOpenSettings,
  onOpenStatusManager,
  onOpenUserModal
}) => {
  const { settings, currentUser, toggleLanguage, toggleTheme, lastSavedAt } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  // Logo asset selection based on settings
  const logoSrc =
    settings.logoType === 'pill'
      ? './images/logos/ymco-pill-logo.png'
      : settings.logoType === 'banner'
      ? './images/logos/ymco-banner-logo.webp'
      : './images/logos/ymco-emblem.jpg';

  const roleBadgeColor =
    currentUser.role === 'admin'
      ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
      : currentUser.role === 'editor'
      ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Brand & Logo Section */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative group">
              <img
                src={logoSrc}
                alt="YMCO Logo"
                className="h-12 w-auto object-contain drop-shadow-sm rounded transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  {isAr ? settings.appTitleAr : settings.appTitleEn}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-ymco-50 text-ymco-700 border border-ymco-200 dark:bg-ymco-950/40 dark:text-ymco-300 dark:border-ymco-800">
                  <Sparkles className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 text-ymco-600" />
                  Enterprise 2026
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? settings.companyNameAr : settings.companyNameEn}
              </span>
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
            
            {/* Auto-save indicator */}
            <div className="hidden lg:flex items-center text-xs text-slate-400 dark:text-slate-500 mr-2 rtl:ml-2 rtl:mr-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1 rtl:ml-1 rtl:mr-0" />
              <span>{t.savedNotification}</span>
              {lastSavedAt && (
                <span className="ml-1 rtl:mr-1 text-[11px] opacity-75">
                  ({lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </span>
              )}
            </div>

            {/* Quick Export PDF button */}
            <button
              onClick={onOpenPdf}
              title={t.exportPdf}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-ymco-primary hover:bg-ymco-dark active:scale-95 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ymco-primary/50"
            >
              <FileText className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span className="hidden sm:inline">{t.exportPdf}</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Excel Import / Export */}
            <button
              onClick={onOpenExcel}
              title={t.importExcel}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">{t.exportExcel}</span>
            </button>

            {/* Manage Statuses */}
            <button
              onClick={onOpenStatusManager}
              title={t.manageStatuses}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <Palette className="w-4.5 h-4.5 text-ymco-primary" />
            </button>

            {/* Audit History */}
            <button
              onClick={onOpenHistory}
              title={t.auditLog}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <History className="w-4.5 h-4.5" />
            </button>

            {/* System Settings */}
            <button
              onClick={onOpenSettings}
              title={t.settings}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <SettingsIcon className="w-4.5 h-4.5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={settings.theme === 'dark' ? t.themeLight : t.themeDark}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Globe className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-slate-500" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Session & Role */}
            <button
              onClick={onOpenUserModal}
              title={t.switchRole}
              className="flex items-center space-x-2 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-ymco-primary transition-all text-start"
            >
              <div className="w-7 h-7 rounded-full bg-ymco-primary/10 text-ymco-primary flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xl:flex flex-col text-xs">
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                  {isAr ? currentUser.nameAr : currentUser.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border w-fit mt-0.5 ${roleBadgeColor}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
