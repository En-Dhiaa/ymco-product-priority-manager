import React from 'react';
import { Package, CheckCircle2, Clock, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

export const DashboardStats: React.FC = () => {
  const { products, filterStatus, setFilterStatus, settings } = useProducts();
  const t = translations[settings.language];

  // Calculate statistics
  const total = products.length;
  const activeCount = products.filter((p) => p.status === 'Active' || p.status === 'Approved').length;
  const devCount = products.filter((p) => p.status === 'Under Development' || p.status === 'Under Review').length;
  const suspendedCount = products.filter((p) => p.status === 'Suspended' || p.status === 'Discontinued' || p.status === 'On Hold').length;
  const completedCount = products.filter((p) => p.status === 'Completed').length;
  const unassignedCount = products.filter((p) => !p.priority || p.priority > 900).length;

  const cards = [
    {
      id: 'ALL',
      title: t.totalProducts,
      count: total,
      icon: Package,
      color: 'text-slate-700 dark:text-slate-200',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'ALL' ? 'border-ymco-primary ring-2 ring-ymco-primary/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: '100%'
    },
    {
      id: 'Active',
      title: t.activeProducts,
      count: activeCount,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'Active' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: `${total > 0 ? Math.round((activeCount / total) * 100) : 0}%`
    },
    {
      id: 'Under Development',
      title: t.underDevelopment,
      count: devCount,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'Under Development' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: `${total > 0 ? Math.round((devCount / total) * 100) : 0}%`
    },
    {
      id: 'Suspended',
      title: t.suspendedProducts,
      count: suspendedCount,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'Suspended' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: `${total > 0 ? Math.round((suspendedCount / total) * 100) : 0}%`
    },
    {
      id: 'Completed',
      title: t.completedProducts,
      count: completedCount,
      icon: Sparkles,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'Completed' ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: `${total > 0 ? Math.round((completedCount / total) * 100) : 0}%`
    },
    {
      id: 'UNASSIGNED',
      title: t.unassignedPriority,
      count: unassignedCount,
      icon: Filter,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-white dark:bg-slate-800/80',
      borderColor: filterStatus === 'UNASSIGNED' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-700/80',
      badge: `${unassignedCount}`
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = filterStatus === card.id;

        return (
          <button
            key={card.id}
            onClick={() => setFilterStatus(isSelected ? 'ALL' : card.id)}
            className={`p-3.5 rounded-xl border text-start transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${card.bgColor} ${card.borderColor} group`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {card.badge}
              </span>
            </div>

            <div className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              {card.count}
            </div>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {card.title}
            </div>
          </button>
        );
      })}
    </div>
  );
};

