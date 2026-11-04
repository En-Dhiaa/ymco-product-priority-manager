import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Collection, CollectionType, CollectionVisibility, CollectionStatus, SmartRuleCondition } from '../../types';
import { 
  FolderPlus, Sparkles, Filter, Search, Copy, Archive, Trash2, 
  ExternalLink, Layers, Shield, Eye, Calendar, User as UserIcon,
  ChevronRight, ArrowUpDown, Plus, X, Check, Edit2, FileDown,
  BookOpen, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import { generateYmcoPdf } from '../../utils/pdfGenerator';
import CollectionWorkspace from './CollectionWorkspace';

const COLOR_PRESETS = [
  '#990000', // UMCO Crimson
  '#1E3A8A', // Deep Blue
  '#065F46', // Deep Emerald
  '#6D28D9', // Purple
  '#B45309', // Amber
  '#374151', // Slate
  '#0284C7', // Sky
  '#BE185D', // Pink
  '#0F766E', // Teal
];

const ICON_PRESETS = ['Layers', 'Sparkles', 'Star', 'Flame', 'Trophy', 'Heart', 'Bookmark', 'Tag', 'Shield', 'Box'];

export const CollectionsView: React.FC = () => {
  const { 
    collections, 
    activeCollectionId, 
    setActiveCollectionId, 
    createCollection, 
    updateCollection, 
    deleteCollection, 
    duplicateCollection, 
    archiveCollection,
    getCollectionProducts,
    products,
    activeIngredients,
    therapeuticCategories,
    dosageForms,
    settings,
    currentUser,
    hasPermission,
    logAuditEvent
  } = useProducts();

  const isAr = settings.language === 'ar';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CollectionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CollectionStatus>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | CollectionVisibility>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form State
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0]);
  const [formIcon, setFormIcon] = useState('Layers');
  const [formManager, setFormManager] = useState(currentUser?.name || 'Eng. Dhiaa Al-Himyari');
  const [formType, setFormType] = useState<CollectionType>('manual');
  const [formVisibility, setFormVisibility] = useState<CollectionVisibility>('public');
  const [formStatus, setFormStatus] = useState<CollectionStatus>('active');

  // Smart Rules Form State
  const [smartOperator, setSmartOperator] = useState<'AND' | 'OR'>('AND');
  const [smartConditions, setSmartConditions] = useState<SmartRuleCondition[]>([
    { id: '1', field: 'status', operator: 'equals', value: 'Active' }
  ]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCollection(null);
    setFormNameEn('');
    setFormNameAr('');
    setFormDescEn('');
    setFormDescAr('');
    setFormColor(COLOR_PRESETS[0]);
    setFormIcon('Layers');
    setFormManager(currentUser?.name || 'Eng. Dhiaa Al-Himyari');
    setFormType('manual');
    setFormVisibility('public');
    setFormStatus('active');
    setSmartOperator('AND');
    setSmartConditions([{ id: '1', field: 'status', operator: 'equals', value: 'Active' }]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setFormNameEn(col.nameEn);
    setFormNameAr(col.nameAr);
    setFormDescEn(col.descriptionEn);
    setFormDescAr(col.descriptionAr);
    setFormColor(col.color);
    setFormIcon(col.icon);
    setFormManager(col.manager);
    setFormType(col.type);
    setFormVisibility(col.visibility);
    setFormStatus(col.status);
    if (col.smartRules) {
      setSmartOperator(col.smartRules.logicalOperator);
      setSmartConditions(col.smartRules.conditions.length > 0 ? col.smartRules.conditions : [{ id: '1', field: 'status', operator: 'equals', value: 'Active' }]);
    } else {
      setSmartOperator('AND');
      setSmartConditions([{ id: '1', field: 'status', operator: 'equals', value: 'Active' }]);
    }
    setIsModalOpen(true);
  };

  // Add Smart Condition
  const handleAddCondition = () => {
    setSmartConditions(prev => [
      ...prev,
      { id: Date.now().toString(), field: 'dosage_form', operator: 'equals', value: dosageForms[0]?.nameEn || 'Cream' }
    ]);
  };

  // Remove Smart Condition
  const handleRemoveCondition = (index: number) => {
    setSmartConditions(prev => prev.filter((_, i) => i !== index));
  };

  // Update Smart Condition
  const handleUpdateCondition = (index: number, updates: Partial<SmartRuleCondition>) => {
    setSmartConditions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Calculate live preview matches for smart rules
  const smartMatchCount = useMemo(() => {
    if (formType !== 'smart') return 0;
    try {
      const matches = products.filter(p => {
        if (smartConditions.length === 0) return true;
        const results = smartConditions.map(cond => {
          if (cond.field === 'ingredient') {
            const ingNames = (p.ingredientIds || []).map(id => {
              const ing = activeIngredients.find(i => i.id === id);
              return ing ? ing.nameEn.toLowerCase() : '';
            });
            const target = String(cond.value).toLowerCase();
            return ingNames.some(n => n.includes(target)) || p.scientificName.toLowerCase().includes(target);
          }
          if (cond.field === 'therapeutic_use') {
            const catNames = (p.therapeuticCategoryIds || []).map(id => {
              const tc = therapeuticCategories.find(c => c.id === id);
              return tc ? tc.nameEn.toLowerCase() : '';
            });
            const target = String(cond.value).toLowerCase();
            return catNames.some(n => n.includes(target)) || p.categoryEn.toLowerCase().includes(target);
          }
          if (cond.field === 'dosage_form') {
            const target = String(cond.value).toLowerCase();
            return p.dosageFormEn.toLowerCase().includes(target) || (p.dosageFormId && p.dosageFormId === cond.value);
          }
          if (cond.field === 'status') {
            return p.status.toLowerCase() === String(cond.value).toLowerCase();
          }
          if (cond.field === 'name') {
            const target = String(cond.value).toLowerCase();
            return p.tradeNameEn.toLowerCase().includes(target) || p.tradeNameAr.toLowerCase().includes(target);
          }
          if (cond.field === 'priority_range') {
            if (Array.isArray(cond.value)) {
              const min = Number(cond.value[0]);
              const max = Number(cond.value[1]);
              return p.priority >= min && p.priority <= max;
            }
            return p.priority <= Number(cond.value);
          }
          return true;
        });
        return smartOperator === 'AND' ? results.every(Boolean) : results.some(Boolean);
      });
      return matches.length;
    } catch (e) {
      return 0;
    }
  }, [formType, smartConditions, smartOperator, products, activeIngredients, therapeuticCategories, dosageForms]);

  // Save Collection
  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn.trim() && !formNameAr.trim()) return;

    if (editingCollection) {
      const updated: Collection = {
        ...editingCollection,
        nameEn: formNameEn.trim() || formNameAr.trim(),
        nameAr: formNameAr.trim() || formNameEn.trim(),
        descriptionEn: formDescEn.trim(),
        descriptionAr: formDescAr.trim(),
        color: formColor,
        icon: formIcon,
        manager: formManager,
        type: formType,
        visibility: formVisibility,
        status: formStatus,
        smartRules: formType === 'smart' ? {
          logicalOperator: smartOperator,
          conditions: smartConditions
        } : undefined,
        updatedAt: new Date().toISOString()
      };
      updateCollection(updated);
    } else {
      createCollection({
        nameEn: formNameEn.trim() || formNameAr.trim(),
        nameAr: formNameAr.trim() || formNameEn.trim(),
        descriptionEn: formDescEn.trim(),
        descriptionAr: formDescAr.trim(),
        color: formColor,
        icon: formIcon,
        manager: formManager,
        type: formType,
        visibility: formVisibility,
        status: formStatus,
        smartRules: formType === 'smart' ? {
          logicalOperator: smartOperator,
          conditions: smartConditions
        } : undefined
      });
    }

    setIsModalOpen(false);
  };

  // Filter collections
  const filteredCollections = useMemo(() => {
    return collections.filter(col => {
      if (typeFilter !== 'all' && col.type !== typeFilter) return false;
      if (statusFilter !== 'all' && col.status !== statusFilter) return false;
      if (visibilityFilter !== 'all' && col.visibility !== visibilityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = col.nameEn.toLowerCase().includes(q) || col.nameAr.toLowerCase().includes(q);
        const matchDesc = col.descriptionEn.toLowerCase().includes(q) || col.descriptionAr.toLowerCase().includes(q);
        const matchManager = col.manager.toLowerCase().includes(q);
        return matchName || matchDesc || matchManager;
      }
      return true;
    });
  }, [collections, typeFilter, statusFilter, visibilityFilter, searchQuery]);

  // Fast PDF Export
  const handleExportPdf = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    const colProducts = getCollectionProducts(col);
    generateYmcoPdf({
      products: colProducts,
      settings,
      mode: 'summary',
      orientation: 'landscape',
      refNumber: `COL-${col.id.toUpperCase()}`,
      preparedBy: col.manager || currentUser?.name || 'UMCO Priority Manager',
      scopeTitle: isAr ? `مجموعة المنتجات: ${col.nameAr}` : `Collection: ${col.nameEn}`
    });
    logAuditEvent('collection_change', `Exported PDF for collection "${col.nameEn}"`, `تصدير تقرير PDF للمجموعة "${col.nameAr}"`, 'collection', col.id);
  };

  // If a collection is selected, render the dedicated Collection Priority Workspace!
  if (activeCollectionId) {
    const activeCol = collections.find(c => c.id === activeCollectionId);
    if (activeCol) {
      return (
        <CollectionWorkspace 
          collection={activeCol} 
          onBack={() => setActiveCollectionId(null)} 
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isAr ? 'مجموعات المنتجات والحملات المخصصة' : 'Collections & Product Groups'}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    {collections.length} {isAr ? 'مجموعة' : 'Collections'}
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isAr 
                    ? 'تنظيم المنتجات في حملات ومجموعات ذكية أو يدوية مع ترتيب أولويات مستقل تماماً عن الترتيب العام'
                    : 'Organize products into manual or smart dynamic groups with independent priority sequences decoupled from the master catalog'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {hasPermission('collections.create') && (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all hover:shadow hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                {isAr ? 'إنشاء مجموعة جديدة' : 'New Collection'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المجموعات...' : 'Search collections...'}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">{isAr ? 'كل الأنواع (يدوي / ذكي / تصنيفي)' : 'All Types (Manual / Smart / Classification)'}</option>
              <option value="manual">{isAr ? 'مجموعات يدوية (Manual)' : 'Manual Collections'}</option>
              <option value="smart">{isAr ? 'مجموعات ذكية ديناميكية (Smart Rules)' : 'Smart Dynamic Collections'}</option>
              <option value="classification">{isAr ? 'مبنية على التصنيف (Classification-based)' : 'Classification-based'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">{isAr ? 'كل الحالات (نشط / مؤرشف / مسودة)' : 'All Statuses (Active / Archived / Draft)'}</option>
              <option value="active">{isAr ? 'نشطة فقط (Active)' : 'Active'}</option>
              <option value="draft">{isAr ? 'مسودات (Draft)' : 'Draft'}</option>
              <option value="archived">{isAr ? 'مؤرشفة (Archived)' : 'Archived'}</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">{isAr ? 'كل مستويات الرؤية' : 'All Visibilities'}</option>
              <option value="public">{isAr ? 'عام للكل (Public)' : 'Public'}</option>
              <option value="internal">{isAr ? 'داخلي للقسم (Internal)' : 'Internal'}</option>
              <option value="restricted">{isAr ? 'مقيد للمدراء (Restricted)' : 'Restricted'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {isAr ? 'لا توجد مجموعات تطابق البحث' : 'No collections match your criteria'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {isAr ? 'قم بتعديل خيارات البحث أو أنشئ مجموعة منتجات جديدة للحملات والمواسم' : 'Adjust your filters or create a new collection for marketing campaigns or priority launches.'}
          </p>
          {hasPermission('collections.create') && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'إنشاء مجموعة الآن' : 'Create Collection'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map(col => {
            const count = getCollectionProducts(col).length;
            const isSmart = col.type === 'smart';
            const isArchived = col.status === 'archived';

            return (
              <div
                key={col.id}
                onClick={() => setActiveCollectionId(col.id)}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isArchived 
                    ? 'border-slate-200 dark:border-slate-800 opacity-75' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Color Header Ribbon */}
                <div 
                  className="h-2.5 w-full transition-all group-hover:h-3"
                  style={{ backgroundColor: col.color || '#990000' }}
                />

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Badges & Menu */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Type Badge */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isSmart 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {isSmart ? <Sparkles className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                          {col.type === 'smart' ? (isAr ? 'ذكية (قواعد ديناميكية)' : 'Smart Rules') : (isAr ? 'يدوية' : 'Manual')}
                        </span>

                        {/* Visibility Badge */}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {col.visibility === 'public' ? (isAr ? 'عام' : 'Public') : col.visibility === 'internal' ? (isAr ? 'داخلي' : 'Internal') : (isAr ? 'مقيد' : 'Restricted')}
                        </span>

                        {/* Status Badge */}
                        {col.status === 'archived' && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            {isAr ? 'مؤرشفة' : 'Archived'}
                          </span>
                        )}
                      </div>

                      {/* Item Count Pill */}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {count} {isAr ? 'أصناف' : 'items'}
                      </span>
                    </div>

                    {/* Collection Title & AR */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {isAr ? col.nameAr : col.nameEn}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      {isAr ? col.nameEn : col.nameAr}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {isAr ? (col.descriptionAr || col.descriptionEn) : (col.descriptionEn || col.descriptionAr)}
                    </p>

                    {/* If Smart Collection: Show condition tags */}
                    {isSmart && col.smartRules && (
                      <div className="mb-4 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-[11px] text-purple-800 dark:text-purple-300">
                        <div className="font-semibold mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          {isAr ? `تطابق (${col.smartRules.logicalOperator === 'AND' ? 'كل الشروط' : 'أي شرط'}):` : `Matches (${col.smartRules.logicalOperator}):`}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {col.smartRules.conditions.map((cond, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[10px]">
                              {cond.field}: {String(cond.value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta Details: Manager & Updated */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>{col.manager || 'UMCO Manager'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(col.updatedAt || col.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Quick PDF Export */}
                    <button
                      onClick={(e) => handleExportPdf(col, e)}
                      title={isAr ? 'تصدير PDF لهذه المجموعة' : 'Export Collection PDF'}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    {hasPermission('collections.create') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateCollection(col.id);
                        }}
                        title={isAr ? 'تكرار المجموعة' : 'Duplicate Collection'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit Settings */}
                    {hasPermission('collections.edit') && (
                      <button
                        onClick={(e) => handleOpenEditModal(col, e)}
                        title={isAr ? 'تعديل بيانات المجموعة' : 'Edit Collection'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Archive / Unarchive */}
                    {hasPermission('collections.edit') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveCollection(col.id);
                        }}
                        title={col.status === 'archived' ? (isAr ? 'إلغاء الأرشفة' : 'Unarchive') : (isAr ? 'أرشفة' : 'Archive')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    {hasPermission('collections.delete') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه المجموعة؟ لن يتم حذف الأصناف من الكتالوج العام.' : 'Are you sure you want to delete this collection? Products will NOT be deleted from the master catalog.')) {
                            deleteCollection(col.id);
                          }
                        }}
                        title={isAr ? 'حذف المجموعة' : 'Delete Collection'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Primary Workspace CTA */}
                  <button
                    onClick={() => setActiveCollectionId(col.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform"
                  >
                    <span>{isAr ? 'إدارة الأولويات' : 'Manage Priorities'}</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingCollection 
                    ? (isAr ? 'تعديل إعدادات المجموعة' : 'Edit Collection Settings') 
                    : (isAr ? 'إنشاء مجموعة منتجات جديدة' : 'Create New Collection')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'حدد نوع المجموعة، الرؤية، وقواعد التضمين الديناميكية' : 'Configure group type, visibility, and dynamic rule matching'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'نوع المجموعة' : 'Collection Type'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('manual')}
                    className={`p-3 rounded-xl border text-start transition-all ${
                      formType === 'manual'
                        ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <Layers className="w-4 h-4 text-red-600" />
                      <span>{isAr ? 'مجموعة يدوية (Manual)' : 'Manual Collection'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'اختيار الأصناف يدوياً وترتيب أولوياتها بالتسلسل المرغوب' : 'Select products manually and curate their sequence'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('smart')}
                    className={`p-3 rounded-xl border text-start transition-all ${
                      formType === 'smart'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>{isAr ? 'مجموعة ذكية (Smart Rules)' : 'Smart Dynamic Collection'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'تضمين تلقائي للأصناف المطابقة للقواعد والشروط' : 'Automated product grouping based on matching rules'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم المجموعة (إنجليزي)' : 'Collection Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Priority Launch 2027"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم المجموعة (عربي) *' : 'Collection Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: أصناف التدشين ذات الأولوية"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescEn}
                    onChange={(e) => setFormDescEn(e.target.value)}
                    placeholder="Brief objective of this collection..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescAr}
                    onChange={(e) => setFormDescAr(e.target.value)}
                    placeholder="وصف مختصر للغرض من هذه المجموعة..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Manager & Visibility & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المسؤول عن المجموعة' : 'Collection Manager'}
                  </label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'مستوى الرؤية' : 'Visibility'}
                  </label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="public">{isAr ? 'عام للكل' : 'Public'}</option>
                    <option value="internal">{isAr ? 'داخلي للشركة' : 'Internal'}</option>
                    <option value="restricted">{isAr ? 'مقيد للمدراء' : 'Restricted'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="active">{isAr ? 'نشطة (Active)' : 'Active'}</option>
                    <option value="draft">{isAr ? 'مسودة (Draft)' : 'Draft'}</option>
                    <option value="archived">{isAr ? 'مؤرشفة (Archived)' : 'Archived'}</option>
                  </select>
                </div>
              </div>

              {/* Color Preset Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'لون التمييز' : 'Accent Color'}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        formColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {formColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMART RULES BUILDER (when formType === 'smart') */}
              {formType === 'smart' && (
                <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                        {isAr ? 'منشئ القواعد الذكية' : 'Smart Rule Builder'}
                      </span>
                    </div>

                    {/* Live Match Counter */}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                      {isAr ? `مطابقة فورية: ${smartMatchCount} صنف` : `Live Match: ${smartMatchCount} products`}
                    </span>
                  </div>

                  {/* Logical Operator */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {isAr ? 'تطابق الشروط:' : 'Match Conditions:'}
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="smartOp"
                        checked={smartOperator === 'AND'}
                        onChange={() => setSmartOperator('AND')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>{isAr ? 'كافة الشروط (AND - All)' : 'All Conditions (AND)'}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="smartOp"
                        checked={smartOperator === 'OR'}
                        onChange={() => setSmartOperator('OR')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>{isAr ? 'أي من الشروط (OR - Any)' : 'Any Condition (OR)'}</span>
                    </label>
                  </div>

                  {/* Conditions List */}
                  <div className="space-y-2">
                    {smartConditions.map((cond, index) => (
                      <div key={cond.id || index} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/40">
                        {/* Field */}
                        <select
                          value={cond.field}
                          onChange={(e) => handleUpdateCondition(index, { field: e.target.value as any, value: '' })}
                          className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <option value="status">{isAr ? 'حالة الصنف (Status)' : 'Product Status'}</option>
                          <option value="dosage_form">{isAr ? 'الشكل الدوائي (Dosage Form)' : 'Dosage Form'}</option>
                          <option value="ingredient">{isAr ? 'المادة الفعالة (Ingredient)' : 'Active Ingredient'}</option>
                          <option value="therapeutic_use">{isAr ? 'الاستخدام العلاجي (Therapeutic)' : 'Therapeutic Class'}</option>
                          <option value="priority_range">{isAr ? 'نطاق الأولوية (Priority Range)' : 'Priority Range'}</option>
                          <option value="name">{isAr ? 'اسم الصنف (Name)' : 'Product Name'}</option>
                        </select>

                        {/* Value Selector depending on field */}
                        <div className="flex-1">
                          {cond.field === 'status' && (
                            <select
                              value={String(cond.value)}
                              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              <option value="Active">Active</option>
                              <option value="Under Development">Under Development</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Completed">Completed</option>
                            </select>
                          )}

                          {cond.field === 'dosage_form' && (
                            <select
                              value={String(cond.value)}
                              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              {dosageForms.map(df => (
                                <option key={df.id} value={df.nameEn}>{df.nameEn} ({df.nameAr})</option>
                              ))}
                            </select>
                          )}

                          {cond.field === 'ingredient' && (
                            <input
                              type="text"
                              value={String(cond.value)}
                              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                              placeholder={isAr ? 'اكتب اسم المادة الفعالة...' : 'Ingredient name...'}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                          )}

                          {cond.field === 'therapeutic_use' && (
                            <select
                              value={String(cond.value)}
                              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              {therapeuticCategories.map(tc => (
                                <option key={tc.id} value={tc.nameEn}>{tc.nameEn} ({tc.nameAr})</option>
                              ))}
                            </select>
                          )}

                          {cond.field === 'priority_range' && (
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={Number(cond.value) || 20}
                              onChange={(e) => handleUpdateCondition(index, { value: Number(e.target.value) })}
                              placeholder={isAr ? 'الأولوية أقل من أو تساوي...' : 'Priority <= ...'}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                          )}

                          {cond.field === 'name' && (
                            <input
                              type="text"
                              value={String(cond.value)}
                              onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                              placeholder={isAr ? 'جزء من اسم الصنف...' : 'Name contains...'}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                          )}
                        </div>

                        {/* Remove Condition */}
                        {smartConditions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة شرط آخر' : 'Add condition'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all"
                >
                  {editingCollection ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء المجموعة' : 'Create Collection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsView;
