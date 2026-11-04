import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { 
  Package, CheckCircle2, Clock, AlertCircle, Layers, 
  Dna, HeartPulse, Users, Shield, ArrowUpRight, 
  TrendingUp, FileDown, Plus, Sparkles, Calendar, UserCheck
} from 'lucide-react';
import { generateYmcoPdf } from '../../utils/pdfGenerator';

export const DashboardOverview: React.FC = () => {
  const { 
    products, 
    collections, 
    activeIngredients, 
    therapeuticCategories, 
    dosageForms, 
    users, 
    auditLogs, 
    setCurrentSection, 
    setActiveCollectionId, 
    settings,
    currentUser,
    hasPermission
  } = useProducts();

  const isAr = settings.language === 'ar';

  // Stats calculation
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'Active').length;
  const underDevProducts = products.filter(p => p.status === 'Under Development').length;
  const suspendedProducts = products.filter(p => p.status === 'Suspended').length;
  const completedProducts = products.filter(p => p.status === 'Completed').length;
  const unassignedPriority = products.filter(p => !p.priority || p.priority === 0).length;

  // Unclassified products (missing ingredients or therapeutic category)
  const unclassifiedCount = products.filter(p => (!p.ingredientIds || p.ingredientIds.length === 0) && !p.dosageFormId).length;

  // Handle Master PDF Export
  const handleQuickExportPdf = () => {
    generateYmcoPdf({
      products,
      settings,
      mode: 'summary',
      orientation: 'landscape',
      refNumber: `UMCO-DASH-${new Date().getFullYear()}`,
      preparedBy: currentUser?.name || 'UMCO Executive Dashboard',
      scopeTitle: isAr ? 'تقرير الأولويات الشامل لمصنع شركة الأدوية الحديثة' : 'UMCO Master Pharmaceutical Catalog & Priority Index'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'منظومة إدارة أولويات وتصنيف الأدوية الحديثة 2026' : 'UMCO Enterprise Pharmaceutical Priority System 2026'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAr ? `مرحباً بك، ${currentUser?.nameAr || currentUser?.name}` : `Welcome back, ${currentUser?.name}`}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'لوحة القيادة الموحدة لمتابعة أولويات 59 صنفاً دوائياً، وتصنيف المواد الفعالة، والحملات التسويقية المستقلة، وإدارة الصلاحيات الدقيقة.'
                : 'Centralized executive workspace governing 59 genuine pharmaceutical products, active ingredients, decoupled collection sequences, and granular RBAC.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentSection('products')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105"
            >
              <Package className="w-4 h-4" />
              <span>{isAr ? 'جدول أولويات المنتجات' : 'Manage Products'}</span>
            </button>

            <button
              onClick={handleQuickExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>{isAr ? 'تصدير الكتالوج PDF' : 'Master PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Products */}
        <div 
          onClick={() => setCurrentSection('products')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'إجمالي الأصناف' : 'Total Catalog'}</span>
            <Package className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalProducts}</div>
          <div className="text-[10px] text-slate-400 mt-1">{isAr ? 'منتج مسعر 2026' : 'Priced Products'}</div>
        </div>

        {/* Active Products */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'نشط في السوق' : 'Active'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeProducts}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            {Math.round((activeProducts / (totalProducts || 1)) * 100)}% {isAr ? 'من الكتالوج' : 'of catalog'}
          </div>
        </div>

        {/* Under Development */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'قيد التطوير' : 'In Pipeline'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{underDevProducts}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">{isAr ? 'أبحاث وتجارب' : 'R&D / Clinical'}</div>
        </div>

        {/* Collections */}
        <div 
          onClick={() => setCurrentSection('collections')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'المجموعات المخصصة' : 'Collections'}</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{collections.length}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-1">{isAr ? 'حملات وأولويات' : 'Custom Groups'}</div>
        </div>

        {/* Active Ingredients */}
        <div 
          onClick={() => setCurrentSection('classification')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'المواد الفعالة' : 'Active APIs'}</span>
            <Dna className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeIngredients.length}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">{isAr ? 'مركبات مصنفة' : 'Chemical APIs'}</div>
        </div>

        {/* System Users */}
        <div 
          onClick={() => setCurrentSection('users')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">{isAr ? 'المستخدمين' : 'Authorized Users'}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">{isAr ? 'صلاحيات RBAC' : 'Active Accounts'}</div>
        </div>
      </div>

      {/* Main Grid: Collections Showcase & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections Overview Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'مجموعات المنتجات والحملات النشطة' : 'Active Collections & Priority Campaigns'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'قوائم الأولويات المستقلة المجهزة للعروض والتسويق' : 'Independent sequence groups tailored for marketing and exhibits'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentSection('collections')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {collections.slice(0, 4).map(col => (
              <div
                key={col.id}
                onClick={() => {
                  setActiveCollectionId(col.id);
                  setCurrentSection('collections');
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: col.color || '#990000' }} 
                    />
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {col.items?.length || 0} {isAr ? 'صنف' : 'items'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    {isAr ? col.nameAr : col.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {isAr ? col.descriptionAr : col.descriptionEn}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{col.manager || 'UMCO Manager'}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {isAr ? 'إدارة الأولويات ←' : 'Open Workspace →'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Audit Activity (1 col) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'روابط سريعة' : 'Quick Actions'}
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setCurrentSection('products')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-between text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" />
                  <span>{isAr ? 'ترتيب أولويات الأصناف' : 'Reorder Product Catalog'}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentSection('classification')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? 'إدارة المواد الفعالة والتصنيفات' : 'Active Ingredients & Categories'}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentSection('collections')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-between text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? 'إنشاء مجموعة أو حملة جديدة' : 'Create Custom Collection'}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentSection('reports')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'مركز التقارير وتصدير PDF' : 'Reports & Exports Hub'}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Audit Trail Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'آخر سجلات العمليات' : 'Recent Activity'}
              </h3>
              <button
                onClick={() => setCurrentSection('audit')}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
              >
                {isAr ? 'السجل الكامل' : 'Full Log'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {isAr ? log.descriptionAr : log.descriptionEn}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.userName} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex-shrink-0">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
