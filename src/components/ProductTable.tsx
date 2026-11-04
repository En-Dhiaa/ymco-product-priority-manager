import React, { useState, useRef } from 'react';
import {
  GripVertical,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Check,
  Hash,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { translations } from '../utils/translations';

interface ProductTableProps {
  onOpenDetailModal: (product: Product) => void;
  onOpenEditModal: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  onOpenDetailModal,
  onOpenEditModal
}) => {
  const {
    filteredProducts,
    products,
    statuses,
    settings,
    currentUser,
    selectedProductIds,
    toggleSelectProduct,
    toggleSelectAll,
    reorderProduct,
    assignPriority,
    moveProduct,
    deleteProduct,
    duplicateProduct,
    updateProduct
  } = useProducts();

  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isViewer = currentUser.role === 'viewer';
  const isComfortable = settings.tableDensity === 'comfortable';

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Quick Inline Priority editing state
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [priorityInputValue, setPriorityInputValue] = useState<string>('');

  // Status dropdown state
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);

  const statusMap = new Map();
  statuses.forEach((s) => statusMap.set(s.id, s));

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    if (isViewer) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Map filtered index back to absolute master array indices
    const draggedItem = filteredProducts[draggedIndex];
    const targetItem = filteredProducts[targetIndex];

    const masterFrom = products.findIndex((p) => p.id === draggedItem.id);
    const masterTo = products.findIndex((p) => p.id === targetItem.id);

    if (masterFrom !== -1 && masterTo !== -1) {
      reorderProduct(masterFrom, masterTo);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Priority edit handler
  const startEditingPriority = (product: Product) => {
    if (isViewer) return;
    setEditingPriorityId(product.id);
    setPriorityInputValue(product.priority.toString());
  };

  const handlePriorityInputSubmit = (productId: string) => {
    const newPri = parseInt(priorityInputValue, 10);
    if (!isNaN(newPri) && newPri > 0) {
      assignPriority(productId, newPri);
    }
    setEditingPriorityId(null);
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          {t.noProductsFound}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t.noProductsSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          {/* Sticky Table Header */}
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/80 sticky top-0 z-20 backdrop-blur-xs">
              
              {/* Checkbox column */}
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-600 text-ymco-primary focus:ring-ymco-primary cursor-pointer w-4 h-4"
                />
              </th>

              {/* Priority column */}
              <th className="py-3 px-3 w-24 text-center">
                <div className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                  <span>{t.colPriority}</span>
                </div>
              </th>

              {/* Product Thumbnail */}
              <th className="py-3 px-3 w-16 text-center">
                {t.colImage}
              </th>

              {/* Product Names */}
              <th className="py-3 px-4 text-start">
                {t.colProductName}
              </th>

              {/* Category / Type */}
              <th className="py-3 px-3 text-start w-48 hidden md:table-cell">
                {t.colType}
              </th>

              {/* Status */}
              <th className="py-3 px-3 text-center w-36">
                {t.colStatus}
              </th>

              {/* Ordering Controls & Actions */}
              <th className="py-3 px-4 text-center w-48">
                {t.colActions}
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            {filteredProducts.map((product, idx) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx;
              const statusCfg = statusMap.get(product.status) || {
                labelEn: product.status,
                labelAr: product.status,
                color: '#64748b',
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
              };

              // Subtle row tint based on status
              const statusRowTint =
                product.status === 'Suspended'
                  ? 'bg-rose-50/20 dark:bg-rose-950/10'
                  : product.status === 'Under Development'
                  ? 'bg-blue-50/20 dark:bg-blue-950/10'
                  : '';

              return (
                <tr
                  key={product.id}
                  draggable={!isViewer}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group transition-colors duration-150 ${statusRowTint} ${
                    isSelected
                      ? 'bg-ymco-50/70 dark:bg-ymco-950/30'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  } ${isDragging ? 'opacity-40 bg-slate-200 dark:bg-slate-700' : ''} ${
                    isDragOver ? 'border-t-2 border-ymco-primary bg-ymco-50/50' : ''
                  }`}
                >
                  
                  {/* Row Checkbox & Drag Handle */}
                  <td className={`py-2 px-3 text-center ${isComfortable ? 'py-3.5' : 'py-2'}`}>
                    <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                      <span
                        title={isViewer ? '' : t.dragHint}
                        className={`text-slate-300 dark:text-slate-600 transition-colors ${
                          isViewer ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:text-slate-500'
                        }`}
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-ymco-primary focus:ring-ymco-primary cursor-pointer w-4 h-4"
                      />
                    </div>
                  </td>

                  {/* Priority Number Badge with Quick Edit */}
                  <td className="py-2 px-3 text-center">
                    {editingPriorityId === product.id ? (
                      <div className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                        <input
                          type="number"
                          min="1"
                          max={products.length}
                          value={priorityInputValue}
                          onChange={(e) => setPriorityInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePriorityInputSubmit(product.id);
                            if (e.key === 'Escape') setEditingPriorityId(null);
                          }}
                          autoFocus
                          className="w-14 px-1.5 py-0.5 text-xs text-center font-bold bg-white dark:bg-slate-800 border-2 border-ymco-primary rounded focus:outline-none"
                        />
                        <button
                          onClick={() => handlePriorityInputSubmit(product.id)}
                          className="p-1 rounded bg-ymco-primary text-white hover:bg-ymco-dark"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingPriority(product)}
                        disabled={isViewer}
                        title={isViewer ? '' : t.editPriority}
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black tracking-tight transition-all ${
                          product.priority <= 3
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-xs'
                            : product.priority <= 10
                            ? 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-bold'
                            : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        } ${!isViewer ? 'hover:border-ymco-primary hover:text-ymco-primary cursor-pointer' : ''}`}
                      >
                        #{product.priority}
                      </button>
                    )}
                  </td>

                  {/* Thumbnail Image */}
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => onOpenDetailModal(product)}
                      title={t.viewDetails}
                      className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-0.5 transition-transform group-hover:scale-105 hover:border-ymco-primary cursor-pointer"
                    >
                      <img
                        src={product.imageUrl || './images/logos/ymco-pill-logo.png'}
                        alt={product.tradeNameEn}
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './images/logos/ymco-pill-logo.png';
                        }}
                      />
                    </button>
                  </td>

                  {/* Product Name & Type ONLY */}
                  <td className="py-2.5 px-4 text-start">
                    <div className="flex flex-col text-start">
                      <button
                        type="button"
                        onClick={() => onOpenDetailModal(product)}
                        className="text-start font-bold text-slate-900 dark:text-white hover:text-ymco-primary dark:hover:text-ymco-400 transition-colors cursor-pointer text-xs sm:text-sm line-clamp-1"
                      >
                        {isAr ? product.tradeNameAr : product.tradeNameEn}
                      </button>

                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {isAr
                          ? (product.dosageFormAr || product.dosageFormEn || 'مستحضر صيدلاني')
                          : (product.dosageFormEn || product.dosageFormAr || 'Pharmaceutical Form')}
                      </span>
                    </div>
                  </td>

                  {/* Category & Dosage Form */}
                  <td className="py-2 px-3 hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {isAr ? product.categoryAr : product.categoryEn}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {product.dosageFormEn || product.concentration}
                      </span>
                    </div>
                  </td>

                  {/* Product Status with Interactive Dropdown on Click */}
                  <td className="py-2 px-3 text-center relative">
                    <div className="relative inline-block text-start">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isViewer) {
                            setActiveStatusDropdownId(
                              activeStatusDropdownId === product.id ? null : product.id
                            );
                          }
                        }}
                        disabled={isViewer}
                        title={isViewer ? '' : (isAr ? 'انقر لتغيير حالة الصنف' : 'Click to change status')}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${statusCfg.badgeClass} ${
                          !isViewer ? 'hover:shadow-xs hover:scale-105 cursor-pointer active:scale-95' : 'cursor-default'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0"
                          style={{ backgroundColor: statusCfg.color }}
                        />
                        <span className="truncate max-w-[120px]">{isAr ? statusCfg.labelAr : statusCfg.labelEn}</span>
                        {!isViewer && (
                          <ChevronDown className="w-3 h-3 ml-1 rtl:mr-1 rtl:ml-0 opacity-60" />
                        )}
                      </button>

                      {/* Status Dropdown Popover */}
                      {activeStatusDropdownId === product.id && (
                        <>
                          {/* Invisible backdrop */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusDropdownId(null);
                            }}
                          />

                          <div
                            className="absolute z-50 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-scaleUp text-start ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                              {isAr ? 'تغيير حالة الصنف' : 'Change Status'}
                            </div>

                            <div className="max-h-56 overflow-y-auto py-0.5 space-y-0.5">
                              {statuses
                                .filter((s) => s.isActive)
                                .map((s) => {
                                  const isCurrent = product.status === s.id;
                                  return (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => {
                                        updateProduct({ ...product, status: s.id });
                                        setActiveStatusDropdownId(null);
                                      }}
                                      className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                                        isCurrent
                                          ? 'bg-ymco-50 dark:bg-ymco-950/40 text-ymco-primary font-bold'
                                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0"
                                          style={{ backgroundColor: s.color }}
                                        />
                                        <span className="truncate">{isAr ? s.labelAr : s.labelEn}</span>
                                      </div>
                                      {isCurrent && (
                                        <Check className="w-3.5 h-3.5 text-ymco-primary shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Ordering Controls & Row Action Menu */}
                  <td className="py-2 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                      
                      {/* Move to Top */}
                      <button
                        onClick={() => moveProduct(product.id, 'top')}
                        disabled={isViewer || product.priority === 1}
                        title={t.moveTop}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowUpToLine className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => moveProduct(product.id, 'up')}
                        disabled={isViewer || product.priority === 1}
                        title={t.moveUp}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveProduct(product.id, 'down')}
                        disabled={isViewer || product.priority === products.length}
                        title={t.moveDown}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Move to Bottom */}
                      <button
                        onClick={() => moveProduct(product.id, 'bottom')}
                        disabled={isViewer || product.priority === products.length}
                        title={t.moveBottom}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                      {/* View Details */}
                      <button
                        onClick={() => onOpenDetailModal(product)}
                        title={t.viewDetails}
                        className="p-1 rounded text-slate-400 hover:text-ymco-primary hover:bg-ymco-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Product */}
                      {!isViewer && (
                        <button
                          onClick={() => onOpenEditModal(product)}
                          title={t.editProduct}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Duplicate Product */}
                      {!isViewer && (
                        <button
                          onClick={() => duplicateProduct(product.id)}
                          title={t.duplicateProduct}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Product */}
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${t.confirmDelete}\n\n${product.tradeNameEn} (${product.sku})`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          title={t.deleteProduct}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse font-medium">
          <span>{filteredProducts.length} of {products.length} products listed</span>
          <span>•</span>
          <span className="text-slate-400">Sequence active: 1 to {products.length}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Real-time persistence enabled</span>
        </div>
      </div>
    </div>
  );
};

