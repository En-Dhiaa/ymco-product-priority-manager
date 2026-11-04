import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Collection, Product } from '../../types';
import { 
  ArrowLeft, ArrowRight, Plus, Trash2, ArrowUp, ArrowDown, 
  ChevronsUp, ChevronsDown, FileDown, Hash, RefreshCw, 
  Search, Check, Sparkles, Layers, Shield, Eye, Calendar,
  X, CheckSquare, Square, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import { generateYmcoPdf } from '../../utils/pdfGenerator';

interface CollectionWorkspaceProps {
  collection: Collection;
  onBack: () => void;
}

export const CollectionWorkspace: React.FC<CollectionWorkspaceProps> = ({ collection, onBack }) => {
  const {
    products,
    getCollectionProducts,
    addProductsToCollection,
    removeProductFromCollection,
    assignCollectionPriority,
    moveCollectionProduct,
    autoRenumberCollection,
    settings,
    currentUser,
    hasPermission,
    logAuditEvent
  } = useProducts();

  const isAr = settings.language === 'ar';

  // Products currently in this collection with independent collection priority
  const collectionProducts = useMemo(() => {
    return getCollectionProducts(collection);
  }, [collection, getCollectionProducts]);

  // Search & Filter within collection
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [priorityInputValue, setPriorityInputValue] = useState<number>(1);

  // Add Products Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Existing product IDs in collection
  const existingProductIds = useMemo(() => {
    return new Set(collectionProducts.map(p => p.id));
  }, [collectionProducts]);

  // Filtered collection products
  const displayProducts = useMemo(() => {
    if (!searchQuery.trim()) return collectionProducts;
    const q = searchQuery.toLowerCase();
    return collectionProducts.filter(p => 
      p.tradeNameEn.toLowerCase().includes(q) ||
      p.tradeNameAr.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.categoryEn.toLowerCase().includes(q)
    );
  }, [collectionProducts, searchQuery]);

  // Candidate products to add
  const candidateProducts = useMemo(() => {
    return products.filter(p => {
      if (modalCategory !== 'all' && p.categoryEn !== modalCategory) return false;
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase();
        const matchName = p.tradeNameEn.toLowerCase().includes(q) || p.tradeNameAr.toLowerCase().includes(q);
        const matchSci = p.scientificName.toLowerCase().includes(q);
        return matchName || matchSci;
      }
      return true;
    });
  }, [products, modalCategory, modalSearch]);

  // Categories list for modal filter
  const categoriesList = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoryEn))).filter(Boolean);
  }, [products]);

  // Handle Export PDF
  const handleExportPdf = () => {
    generateYmcoPdf({
      products: collectionProducts,
      settings,
      mode: 'summary',
      orientation: 'landscape',
      refNumber: `COL-${collection.id.toUpperCase()}`,
      preparedBy: collection.manager || currentUser?.name || 'UMCO Priority Manager',
      scopeTitle: isAr ? `مجموعة الأولويات: ${collection.nameAr}` : `Collection Priorities: ${collection.nameEn}`
    });
    logAuditEvent(
      'collection_change', 
      `Exported priority report for collection "${collection.nameEn}"`, 
      `تصدير تقرير أولويات المجموعة "${collection.nameAr}"`, 
      'collection', 
      collection.id
    );
  };

  // Submit Add Products
  const handleConfirmAddProducts = () => {
    if (selectedProductIds.length > 0) {
      addProductsToCollection(collection.id, selectedProductIds);
      setSelectedProductIds([]);
      setIsAddModalOpen(false);
    }
  };

  // Toggle selection in Add Modal
  const toggleSelectCandidate = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all visible candidates (excluding already added)
  const handleSelectAllVisible = () => {
    const unadded = candidateProducts.filter(p => !existingProductIds.has(p.id)).map(p => p.id);
    if (unadded.every(id => selectedProductIds.includes(id))) {
      setSelectedProductIds(prev => prev.filter(id => !unadded.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...unadded])));
    }
  };

  // Handle Priority Input Change
  const handleSavePriorityInput = (productId: string) => {
    if (priorityInputValue > 0) {
      assignCollectionPriority(collection.id, productId, priorityInputValue);
    }
    setEditingPriorityId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? 'العودة إلى كافة المجموعات' : 'Back to All Collections'}</span>
            </button>

            {/* Collection Title */}
            <div className="flex items-center gap-3">
              <span 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-lg"
                style={{ backgroundColor: collection.color || '#990000' }}
              >
                {collection.type === 'smart' ? <Sparkles className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </span>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isAr ? collection.nameAr : collection.nameEn}
                  </h1>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {isAr ? collection.nameEn : collection.nameAr}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    collection.type === 'smart' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}>
                    {collection.type === 'smart' ? (isAr ? 'مجموعة ذكية' : 'Smart Rule') : (isAr ? 'مجموعة يدوية' : 'Manual')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAr ? (collection.descriptionAr || collection.descriptionEn) : (collection.descriptionEn || collection.descriptionAr)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto Renumber */}
            {hasPermission('priorities.reorder') && (
              <button
                onClick={() => {
                  autoRenumberCollection(collection.id);
                }}
                title={isAr ? 'إعادة ترقيم الأولويات تسلسلياً (1, 2, 3...)' : 'Renumber priorities 1..N sequentially'}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'ترقيم تسلسلي تلقائي' : 'Auto Renumber'}</span>
              </button>
            )}

            {/* Export Collection PDF */}
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-red-600" />
              <span>{isAr ? 'تصدير PDF للمجموعة' : 'Export PDF'}</span>
            </button>

            {/* Add Products to Collection (Manual only) */}
            {collection.type === 'manual' && hasPermission('collections.manage_members') && (
              <button
                onClick={() => {
                  setSelectedProductIds([]);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة أصناف للمجموعة' : 'Add Products'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Independence Notice Banner */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              {isAr ? 'تنبيه استقلالية الأولويات: ' : 'Decoupled Priority Sequence Notice: '}
            </span>
            <span>
              {isAr
                ? 'ترتيب الأولويات في هذه المجموعة مستقل تماماً عن الترتيب العام في الكتالوج الرئيسي. تغيير الأولوية أو إزالة صنف هنا لن يؤثر على الكتالوج العام نهائياً.'
                : 'Priorities in this collection are completely decoupled from the global catalog sequence. Reordering or removing an item here will NEVER modify the master catalog.'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Controls: Search inside collection & stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في أصناف المجموعة...' : 'Search within collection...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-end">
          <span>
            {isAr ? `إجمالي أصناف المجموعة:` : `Total Products in Collection:`}{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{collectionProducts.length}</strong>
          </span>
          {collection.type === 'smart' && (
            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
              {isAr ? 'تحديث تلقائي بالقواعد' : 'Dynamic Rule-Based'}
            </span>
          )}
        </div>
      </div>

      {/* Collection Priority Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 font-bold text-center w-20">
                  {isAr ? 'أولوية المجموعة' : 'Col. Priority'}
                </th>
                <th className="py-3 px-4 font-bold text-center w-16">
                  {isAr ? 'الصورة' : 'Image'}
                </th>
                <th className="py-3 px-4 font-bold text-start">
                  {isAr ? 'اسم الصنف والمواصفات' : 'Product Details'}
                </th>
                <th className="py-3 px-4 font-bold text-start">
                  {isAr ? 'الشكل والتصنيف' : 'Form & Category'}
                </th>
                <th className="py-3 px-4 font-bold text-center">
                  {isAr ? 'الأولوية العامة' : 'Global Rank'}
                </th>
                <th className="py-3 px-4 font-bold text-center">
                  {isAr ? 'الحالة' : 'Status'}
                </th>
                <th className="py-3 px-4 font-bold text-center w-48">
                  {isAr ? 'إجراءات الترتيب' : 'Reorder Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {isAr ? 'لا توجد أصناف في هذه المجموعة حتى الآن' : 'No products in this collection yet'}
                    </p>
                    {collection.type === 'manual' && hasPermission('collections.manage_members') && (
                      <button
                        onClick={() => {
                          setSelectedProductIds([]);
                          setIsAddModalOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إضافة أصناف الآن' : 'Add Products Now'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displayProducts.map((p, index) => {
                  const isFirst = index === 0;
                  const isLast = index === displayProducts.length - 1;

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Collection Priority Rank (Editable on click) */}
                      <td className="py-3 px-4 text-center">
                        {editingPriorityId === p.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={999}
                              autoFocus
                              value={priorityInputValue}
                              onChange={(e) => setPriorityInputValue(Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePriorityInput(p.id);
                                if (e.key === 'Escape') setEditingPriorityId(null);
                              }}
                              className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white dark:bg-slate-800 border border-red-500 rounded focus:outline-none"
                            />
                            <button
                              onClick={() => handleSavePriorityInput(p.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (hasPermission('priorities.reorder')) {
                                setEditingPriorityId(p.id);
                                setPriorityInputValue(p.collectionPriority || index + 1);
                              }
                            }}
                            title={isAr ? 'انقر لتعديل الأولوية مباشرة' : 'Click to edit priority'}
                            className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-bold hover:scale-105 transition-transform"
                          >
                            #{p.collectionPriority || index + 1}
                          </button>
                        )}
                      </td>

                      {/* Product Thumbnail */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-11 h-11 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.tradeNameEn}
                              className="w-full h-full object-contain p-0.5"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">UMCO</span>
                          )}
                        </div>
                      </td>

                      {/* Product Names */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {p.tradeNameEn}
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {p.tradeNameAr}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                          {p.scientificName}
                        </div>
                      </td>

                      {/* Form & Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {isAr ? p.dosageFormAr : p.dosageFormEn}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isAr ? p.categoryAr : p.categoryEn}
                        </div>
                      </td>

                      {/* Global Master Catalog Rank (Decoupled Indicator) */}
                      <td className="py-3 px-4 text-center">
                        <span 
                          title={isAr ? 'الأولوية العامة للمنتج في الكتالوج الرئيسي' : 'Master catalog priority'}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        >
                          #{p.priority} Global
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : p.status === 'Under Development'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Reorder & Action Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* Move to Top */}
                          {hasPermission('priorities.reorder') && (
                            <button
                              disabled={isFirst}
                              onClick={() => moveCollectionProduct(collection.id, p.id, 'top')}
                              title={isAr ? 'النقل إلى رأس القائمة' : 'Move to Top'}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ChevronsUp className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move Up */}
                          {hasPermission('priorities.reorder') && (
                            <button
                              disabled={isFirst}
                              onClick={() => moveCollectionProduct(collection.id, p.id, 'up')}
                              title={isAr ? 'رفع الأولوية خطوة' : 'Move Up'}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move Down */}
                          {hasPermission('priorities.reorder') && (
                            <button
                              disabled={isLast}
                              onClick={() => moveCollectionProduct(collection.id, p.id, 'down')}
                              title={isAr ? 'خفض الأولوية خطوة' : 'Move Down'}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move to Bottom */}
                          {hasPermission('priorities.reorder') && (
                            <button
                              disabled={isLast}
                              onClick={() => moveCollectionProduct(collection.id, p.id, 'bottom')}
                              title={isAr ? 'النقل إلى أسفل القائمة' : 'Move to Bottom'}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ChevronsDown className="w-4 h-4" />
                            </button>
                          )}

                          {/* Remove from Collection Only */}
                          {hasPermission('collections.manage_members') && (
                            <button
                              onClick={() => {
                                if (window.confirm(
                                  isAr
                                    ? `هل تريد إزالة الصنف "${p.tradeNameAr}" من هذه المجموعة؟\n(ملاحظة هامة: لن يتم حذف الصنف من الكتالوج العام مطلقاً).`
                                    : `Remove "${p.tradeNameEn}" from this collection?\n(Important: The product will NOT be deleted from the master catalog).`
                                )) {
                                  removeProductFromCollection(collection.id, p.id);
                                }
                              }}
                              title={isAr ? 'إزالة من المجموعة فقط (دون حذف الصنف)' : 'Remove from collection only (preserves product in master catalog)'}
                              className="p-1 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCTS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-600" />
                  <span>{isAr ? 'إضافة أصناف إلى المجموعة' : 'Add Products to Collection'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr 
                    ? `المجموعة الحالية: ${collection.nameAr} (${collectionProducts.length} صنف مسجل)` 
                    : `Target Collection: ${collection.nameEn} (${collectionProducts.length} items present)`}
                </p>
              </div>

              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={isAr ? 'بحث بالاسم التجاري أو العلمي...' : 'Search by trade or scientific name...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="all">{isAr ? 'كافة التصنيفات' : 'All Categories'}</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select All & Selection Summary */}
            <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={handleSelectAllVisible}
                className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium hover:text-red-600"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديد الكل غير المضاف' : 'Select all unadded'}</span>
              </button>

              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {isAr ? `المحدد للإضافة: ${selectedProductIds.length}` : `Selected: ${selectedProductIds.length}`}
              </span>
            </div>

            {/* Candidate Products List */}
            <div className="p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {candidateProducts.map(p => {
                const isAlreadyIn = existingProductIds.has(p.id);
                const isSelected = selectedProductIds.includes(p.id);

                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      if (!isAlreadyIn) toggleSelectCandidate(p.id);
                    }}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                      isAlreadyIn 
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/30' 
                        : isSelected
                        ? 'bg-red-50/60 dark:bg-red-950/20 cursor-pointer'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isAlreadyIn ? (
                          <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-[10px]">✓</span>
                        ) : isSelected ? (
                          <CheckSquare className="w-4 h-4 text-red-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold">UMCO</span>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {p.tradeNameEn} <span className="font-medium text-slate-500">({p.tradeNameAr})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.scientificName} • #{p.priority} Global
                        </div>
                      </div>
                    </div>

                    <div>
                      {isAlreadyIn ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {isAr ? 'مضاف مسبقاً' : 'Already in Collection'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {p.dosageFormEn}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isAr ? `${selectedProductIds.length} صنف محدد` : `${selectedProductIds.length} products selected`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={selectedProductIds.length === 0}
                  onClick={handleConfirmAddProducts}
                  className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
                >
                  {isAr ? 'إضافة الأصناف المحددة' : 'Add Selected to Collection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionWorkspace;
