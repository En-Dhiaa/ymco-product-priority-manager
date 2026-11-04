import React from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  Layers,
  FolderHeart,
  FileBarChart,
  Users,
  History,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';
import { AppNavigationSection } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const {
    currentSection,
    setCurrentSection,
    settings,
    currentUser,
    hasPermission,
    products,
    collections,
    activeIngredients
  } = useProducts();

  const isAr = settings.language === 'ar';
  const t = translations[settings.language];

  interface NavItem {
    id: AppNavigationSection;
    labelEn: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    badge?: number;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelAr: 'لوحة المؤشرات',
      icon: LayoutDashboard
    },
    {
      id: 'products',
      labelEn: 'Products & Priorities',
      labelAr: 'الأصناف والأولويات',
      icon: ListOrdered,
      permission: 'products.view',
      badge: products.length
    },
    {
      id: 'classification',
      labelEn: 'Classification',
      labelAr: 'التصنيف الدوائي',
      icon: Layers,
      permission: 'classification.view',
      badge: activeIngredients.length
    },
    {
      id: 'collections',
      labelEn: 'Collections & Groups',
      labelAr: 'المجموعات الذكية',
      icon: FolderHeart,
      permission: 'collections.view',
      badge: collections.length
    },
    {
      id: 'reports',
      labelEn: 'Reports & Export',
      labelAr: 'التقارير والتصدير',
      icon: FileBarChart,
      permission: 'reports.view'
    },
    {
      id: 'users',
      labelEn: 'User Management',
      labelAr: 'إدارة المستخدمين',
      icon: Users,
      permission: 'users.view'
    },
    {
      id: 'audit',
      labelEn: 'Audit Trail',
      labelAr: 'سجل التدقيق',
      icon: History,
      permission: 'audit.view'
    },
    {
      id: 'settings',
      labelEn: 'System Settings',
      labelAr: 'إعدادات المنصة',
      icon: SettingsIcon,
      permission: 'settings.view'
    }
  ];

  const handleSelectSection = (id: AppNavigationSection) => {
    setCurrentSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 shadow-sm ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0'
        } rtl:translate-x-full rtl:lg:translate-x-0 ${
          isMobileOpen && isAr ? '!translate-x-0' : ''
        }`}
      >
        {/* Brand & Collapse Bar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
            <img
              src="./images/logos/ymco-transparent-logo.png"
              alt="UMCO"
              className="h-8 w-auto object-contain shrink-0"
            />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight truncate">
                  UMCO PHARM
                </span>
                <span className="text-[10px] font-semibold text-ymco-primary truncate">
                  {isAr ? 'المنصة المؤسسية' : 'Enterprise Suite'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            if (item.permission && !hasPermission(item.permission as any)) {
              return null;
            }

            const isActive = currentSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSection(item.id)}
                title={isAr ? item.labelAr : item.labelEn}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-ymco-primary text-white shadow-sm shadow-ymco-primary/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-ymco-primary'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate text-start">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card in Sidebar Bottom */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
              <div className="w-8 h-8 rounded-full bg-ymco-primary/10 text-ymco-primary flex items-center justify-center font-black text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-start">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {isAr ? currentUser.nameAr : currentUser.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Developer Credit shortcut in sidebar */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">{isAr ? 'المطور:' : 'Architect:'}</span>
              <a
                href="https://en-dhiaa.surge.sh/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-ymco-primary hover:underline inline-flex items-center space-x-1 rtl:space-x-reverse"
              >
                <span>{isAr ? 'م. ضياء الحميري' : 'Eng. Dhiaa'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
