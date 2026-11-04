import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { AuditLog } from '../../types';
import { 
  Shield, Search, Calendar, User as UserIcon, Download, 
  Filter, ChevronDown, ChevronUp, Clock, History, AlertCircle,
  FileSpreadsheet, ArrowRight, Layers, Dna, Package, Key
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, settings } = useProducts();
  const isAr = settings.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = log.descriptionEn.toLowerCase().includes(q) || log.descriptionAr.toLowerCase().includes(q);
        const matchUser = (log.userName || '').toLowerCase().includes(q);
        const matchProd = (log.productName || '').toLowerCase().includes(q);
        return matchDesc || matchUser || matchProd;
      }
      return true;
    });
  }, [auditLogs, actionFilter, searchQuery]);

  // Export Audit Logs to JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `UMCO_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Get Action Badge Style & Icon
  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', icon: <Package className="w-3 h-3" /> };
      case 'reorder':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300', icon: <History className="w-3 h-3" /> };
      case 'classification_change':
        return { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300', icon: <Dna className="w-3 h-3" /> };
      case 'collection_change':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300', icon: <Layers className="w-3 h-3" /> };
      case 'permission_change':
      case 'user_change':
        return { color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', icon: <Key className="w-3 h-3" /> };
      case 'delete':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300', icon: <AlertCircle className="w-3 h-3" /> };
      default:
        return { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', icon: <Clock className="w-3 h-3" /> };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isAr ? 'سجل التدقيق والرقابة الشامل' : 'Audit Trail & Compliance Logs'}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {auditLogs.length} {isAr ? 'سجل' : 'events'}
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr 
                  ? 'توثيق كامل لكافة التغييرات والعمليات على الأولويات والمنتجات والتصنيفات والمستخدمين للمراجعة الدوائية والرقابية' 
                  : 'Immutable audit trail recording all product priority reorders, classification changes, and user permission updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير السجل JSON' : 'Export Logs JSON'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في السجلات بالوصف، المستخدم أو الصنف...' : 'Search logs by description, user, or product...'}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="all">{isAr ? 'كافة أنواع العمليات' : 'All Action Types'}</option>
              <option value="reorder">{isAr ? 'تعديل وترتيب الأولويات' : 'Priority Reorders'}</option>
              <option value="classification_change">{isAr ? 'تغييرات التصنيف والمواد الفعالة' : 'Classification Changes'}</option>
              <option value="collection_change">{isAr ? 'تغييرات المجموعات والحملات' : 'Collection Changes'}</option>
              <option value="user_change">{isAr ? 'تغييرات المستخدمين' : 'User Changes'}</option>
              <option value="permission_change">{isAr ? 'تعديل الصلاحيات' : 'Permission Changes'}</option>
              <option value="status_change">{isAr ? 'تغيير حالة الصنف' : 'Status Changes'}</option>
              <option value="create">{isAr ? 'إنشاء عناصر جديدة' : 'Creations'}</option>
              <option value="delete">{isAr ? 'حذف عناصر' : 'Deletions'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 font-bold text-start w-48">{isAr ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3 px-4 font-bold text-center w-36">{isAr ? 'نوع الإجراء' : 'Action'}</th>
                <th className="py-3 px-4 font-bold text-start">{isAr ? 'وصف العملية' : 'Description'}</th>
                <th className="py-3 px-4 font-bold text-start w-44">{isAr ? 'المستخدم المنفذ' : 'Executed By'}</th>
                <th className="py-3 px-4 font-bold text-center w-20">{isAr ? 'الفروقات' : 'Diff'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      {isAr ? 'لا توجد سجلات مطابقة للبحث' : 'No matching audit records'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  const isExpanded = expandedLogId === log.id;
                  const hasDiff = Boolean(log.previousValue || log.newValue);

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString(isAr ? 'ar-YE' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color}`}>
                            {badge.icon}
                            <span>{log.action}</span>
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {isAr ? log.descriptionAr : log.descriptionEn}
                          </div>
                          {log.productName && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {isAr ? 'الصنف المرتبط:' : 'Target Product:'} <strong>{log.productName}</strong>
                            </div>
                          )}
                        </td>

                        {/* User */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.userName || 'System'}</span>
                          </div>
                        </td>

                        {/* Expand Diff */}
                        <td className="py-3 px-4 text-center">
                          {hasDiff ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Diff Row */}
                      {isExpanded && hasDiff && (
                        <tr className="bg-slate-50 dark:bg-slate-800/60">
                          <td colSpan={5} className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40">
                                <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                                  {isAr ? 'القيمة السابقة:' : 'Previous Value:'}
                                </span>
                                <pre className="text-[11px] font-mono text-red-900 dark:text-red-200 whitespace-pre-wrap">
                                  {log.previousValue || '(None)'}
                                </pre>
                              </div>

                              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                                <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                                  {isAr ? 'القيمة الجديدة:' : 'New Value:'}
                                </span>
                                <pre className="text-[11px] font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                                  {log.newValue || '(None)'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsView;
