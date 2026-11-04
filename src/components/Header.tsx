import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  History,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Palette,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Code2
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
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPdf,
  onOpenExcel,
  onOpenHistory,
  onOpenSettings,
  onOpenStatusManager,
  onOpenUserModal,
  onToggleSidebar
}) => {
  const { settings, currentUser, toggleLanguage, toggleTheme } = useProducts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  const logoSrc = './images/logos/ymco-transparent-logo.png';

  const roleBadgeColor =
    currentUser.role === 'admin'
      ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
      : currentUser.role === 'editor'
      ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  const closeMobileAnd = (fn: () => void) => {
    setMobileMenuOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0 shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title={isAr ? 'القائمة الرئيسية والتنقل' : 'Toggle Navigation'}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <Menu className="w-5 h-5 text-red-600" />
              </button>
            )}
            <div className="relative group shrink-0">
              <img
                src={logoSrc}
                alt="UMCO Logo"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-slate-900 dark:text-white truncate">
                {isAr ? settings.appTitleAr : settings.appTitleEn}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {isAr ? settings.companyNameAr : settings.companyNameEn}
              </span>
            </div>
          </div>

          {/* Desktop Toolbar (>= 1024px) */}
          <div className="hidden lg:flex items-center space-x-2.5 rtl:space-x-reverse shrink-0">
            
            {/* Developer Credit Pill */}
            <a
              href="https://en-dhiaa.surge.sh/"
              target="_blank"
              rel="noopener noreferrer"
              title={isAr ? 'زيارة معرض أعمال المطور م. ضياء الحميري' : 'Visit Lead Architect Eng. Dhiaa Portfolio'}
              className="group inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-100 to-rose-50 hover:from-slate-200 hover:to-rose-100 dark:from-slate-800 dark:to-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all hover:scale-105 shrink-0"
            >
              <Code2 className="w-3.5 h-3.5 text-ymco-primary group-hover:rotate-12 transition-transform" />
              <span className="whitespace-nowrap">{isAr ? 'المطور: م. ضياء الحميري' : 'Dev: Eng. Dhiaa'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-ymco-primary transition-colors" />
            </a>

            {/* Quick Export PDF */}
            <button
              onClick={onOpenPdf}
              title={t.exportPdf}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark active:scale-95 shadow-xs transition-all shrink-0"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>{t.exportPdf}</span>
            </button>

            {/* Excel Import / Export */}
            <button
              onClick={onOpenExcel}
              title={t.importExcel}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 active:scale-95 transition-all shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-emerald-600 dark:text-emerald-400" />
              <span>{t.exportExcel}</span>
            </button>

            {/* Manage Statuses */}
            <button
              onClick={onOpenStatusManager}
              title={t.manageStatuses}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors shrink-0"
            >
              <Palette className="w-4 h-4 text-ymco-primary" />
            </button>

            {/* Audit History */}
            <button
              onClick={onOpenHistory}
              title={t.auditLog}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors shrink-0"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title={t.settings}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors shrink-0"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={settings.theme === 'dark' ? t.themeLight : t.themeDark}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
            >
              <Globe className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-slate-500" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Session Profile (Aligned & No Text Wrapping) */}
            <button
              onClick={onOpenUserModal}
              title={t.switchRole}
              className="flex items-center space-x-2 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-ymco-primary transition-all text-start shrink-0 h-9"
            >
              <div className="w-6 h-6 rounded-full bg-ymco-primary/10 text-ymco-primary flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col text-xs justify-center text-start shrink-0 leading-none">
                <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap leading-tight truncate max-w-[140px]">
                  {isAr ? currentUser.nameAr : currentUser.name}
                </span>
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded border w-fit leading-tight mt-0.5 whitespace-nowrap ${roleBadgeColor}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
            </button>

          </div>

          {/* Mobile Clean Top-Bar Controls (< 1024px) */}
          <div className="flex lg:hidden items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse shrink-0">
            
            {/* Direct Compact Developer Link */}
            <a
              href="https://en-dhiaa.surge.sh/"
              target="_blank"
              rel="noopener noreferrer"
              title={isAr ? 'مطور المنصة: م. ضياء الحميري' : 'Developer: Eng. Dhiaa'}
              className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-ymco-primary transition-all shrink-0"
            >
              <Code2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 text-ymco-primary" />
              <span>{isAr ? 'م. ضياء' : 'Eng. Dhiaa'}</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 rtl:mr-0.5 rtl:ml-0 text-slate-400" />
            </a>

            {/* Quick Language Toggle */}
            <button
              onClick={toggleLanguage}
              title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={settings.theme === 'dark' ? t.themeLight : t.themeDark}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-ymco-primary" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer / Actions Dropdown (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            
            {/* Developer Showcase Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-50/80 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/60 border border-red-100 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <div className="w-9 h-9 rounded-lg bg-ymco-primary/10 text-ymco-primary flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-ymco-primary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-ymco-primary uppercase tracking-wider block">
                      {isAr ? 'تطوير وهندسة المنصة' : 'Platform Architect & Lead Developer'}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      {isAr ? 'م. ضياء الحميري' : 'Eng. Dhiaa Al-Himyari'}
                    </span>
                  </div>
                </div>
                <a
                  href="https://en-dhiaa.surge.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-xs transition-transform active:scale-95"
                >
                  <span>{isAr ? 'الملف الشخصي' : 'Portfolio'}</span>
                  <ExternalLink className="w-3 h-3 ml-1 rtl:mr-1 rtl:ml-0" />
                </a>
              </div>
            </div>

            {/* User Session Profile & Role Switcher */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-ymco-primary/10 text-ymco-primary flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {isAr ? currentUser.nameAr : currentUser.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block ${roleBadgeColor}`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => closeMobileAnd(onOpenUserModal)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-ymco-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                {t.switchRole}
              </button>
            </div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* PDF Export */}
              <button
                onClick={() => closeMobileAnd(onOpenPdf)}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2.5 rounded-lg font-bold text-white bg-ymco-primary hover:bg-ymco-dark transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{t.exportPdf}</span>
              </button>

              {/* Excel Manager */}
              <button
                onClick={() => closeMobileAnd(onOpenExcel)}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2.5 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.exportExcel}</span>
              </button>

              {/* Status Manager */}
              <button
                onClick={() => closeMobileAnd(onOpenStatusManager)}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2.5 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Palette className="w-4 h-4 text-ymco-primary shrink-0" />
                <span>{t.manageStatuses}</span>
              </button>

              {/* Audit History */}
              <button
                onClick={() => closeMobileAnd(onOpenHistory)}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2.5 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
              >
                <History className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{t.auditLog}</span>
              </button>

            </div>

            {/* Settings */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => closeMobileAnd(onOpenSettings)}
                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-slate-600 dark:text-slate-300 hover:text-ymco-primary py-1 font-semibold"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{t.settings}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
