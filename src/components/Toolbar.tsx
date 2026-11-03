import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  ListOrdered,
  Plus,
  ArrowUpDown,
  Layers,
  ChevronDown,
  CheckSquare,
  Square,
  Trash2,
  ArrowUpToLine,
  Tag,
  Download,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

interface ToolbarProps {
  onOpenAddModal: () => void;
  onOpenPdf: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenAddModal, onOpenPdf }) => {
  const {
    products,
    categories,
    statuses,
    settings,
    currentUser,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortOption,
    setSortOption,
    activeFilterCount,
    clearAllFilters,
    filteredProducts,
    selectedProductIds,
    toggleSelectAll,
    autoRenumberAll,
    undoLastReorder,
    canUndo,
    bulkUpdateStatus,
    bulkMoveToTop,
    bulkAssignPriority,
    bulkDelete,
    updateSettings
  } = useProducts();

  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isViewer = currentUser.role === 'viewer';

  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [assignPriorityInput, setAssignPriorityInput] = useState<string>('');
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);

  const hasSelection = selectedProductIds.length > 0;
  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;

  const handleBulkPrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pri = parseInt(assignPriorityInput, 10);
    if (!isNaN(pri) && pri > 0) {
      bulkAssignPriority(pri);
      setPriorityModalOpen(false);
      setAssignPriorityInput('');
    }
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Search & Main Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-9 rtl:pr-10 rtl:pl-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ymco-primary/30 focus:border-ymco-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 rtl:pr-3 rtl:pl-8 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ymco-primary/30 transition-all cursor-pointer"
            >
              <option value="ALL">{t.filterByStatus}</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {isAr ? st.labelAr : st.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 rtl:left-2.5 rtl:right-auto top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 rtl:pr-3 rtl:pl-8 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ymco-primary/30 transition-all cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">{t.filterByCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={isAr ? c.name_ar : c.name_en}>
                  {isAr ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 rtl:left-2.5 rtl:right-auto top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none pl-3 pr-8 rtl:pr-3 rtl:pl-8 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ymco-primary/30 transition-all cursor-pointer"
            >
              <option value="priority-asc">{t.sortPriorityAsc}</option>
              <option value="priority-desc">{t.sortPriorityDesc}</option>
              <option value="name-asc">{t.sortNameAsc}</option>
              <option value="name-desc">{t.sortNameDesc}</option>
              <option value="recently-updated">{t.sortRecentlyUpdated}</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 rtl:left-2.5 rtl:right-auto top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Table Density Switcher */}
          <button
            onClick={() =>
              updateSettings({
                tableDensity: settings.tableDensity === 'compact' ? 'comfortable' : 'compact'
              })
            }
            title={settings.tableDensity === 'compact' ? t.densityComfortable : t.densityCompact}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Auto-Renumber 1..N */}
          <button
            onClick={autoRenumberAll}
            disabled={isViewer}
            title={t.autoRenumber}
            className={`inline-flex items-center px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              isViewer
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-ymco-primary" />
            <span className="hidden xl:inline">{t.autoRenumber}</span>
            <span className="xl:hidden">1..N</span>
          </button>

          {/* Undo Reorder Button */}
          <button
            onClick={undoLastReorder}
            disabled={!canUndo || isViewer}
            title={t.undoReorder}
            className={`p-2 rounded-lg border transition-all ${
              canUndo && !isViewer
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 active:scale-95 cursor-pointer'
                : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            disabled={isViewer}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm transition-all ${
              isViewer
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-ymco-primary hover:bg-ymco-dark active:scale-95 cursor-pointer shadow-ymco-primary/20'
            }`}
          >
            <Plus className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
            <span>{t.addNewProduct}</span>
          </button>

        </div>
      </div>

      {/* Active Filter Chips & Summary Row */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between text-xs px-2 text-slate-600 dark:text-slate-300 animate-fadeIn">
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-y-1">
            <span className="font-semibold text-slate-500">{t.activeFilters}:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px]">
                "{searchQuery}"
                <X className="w-3 h-3 ml-1 rtl:mr-1 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}

            {filterStatus !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ymco-50 dark:bg-ymco-950 text-ymco-700 dark:text-ymco-300 text-[11px] border border-ymco-200 dark:border-ymco-800">
                {filterStatus}
                <X className="w-3 h-3 ml-1 rtl:mr-1 cursor-pointer" onClick={() => setFilterStatus('ALL')} />
              </span>
            )}

            {filterCategory !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] border border-blue-200 dark:border-blue-800">
                {filterCategory}
                <X className="w-3 h-3 ml-1 rtl:mr-1 cursor-pointer" onClick={() => setFilterCategory('ALL')} />
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-ymco-primary hover:underline font-bold text-[11px] ml-2 rtl:mr-2"
            >
              {t.clearFilters}
            </button>
          </div>

          <div className="font-semibold text-slate-500 dark:text-slate-400">
            {filteredProducts.length} / {products.length} {t.productCount}
          </div>
        </div>
      )}

      {/* Smart Bulk Action Toolbar (appears when items are selected) */}
      {hasSelection && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-ymco-50 dark:bg-slate-800/90 border border-ymco-200 dark:border-ymco-900/60 rounded-xl shadow-sm text-xs sm:text-sm animate-fadeIn">
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse font-bold text-ymco-900 dark:text-ymco-200">
            <span className="px-2 py-0.5 bg-ymco-primary text-white rounded-md text-xs">
              {selectedProductIds.length}
            </span>
            <span>{t.selectedItems.replace('{count}', selectedProductIds.length.toString())}</span>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-y-1">
            
            {/* Move to Top */}
            <button
              onClick={bulkMoveToTop}
              disabled={isViewer}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <ArrowUpToLine className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-blue-600" />
              <span>{t.bulkMoveTop}</span>
            </button>

            {/* Assign Priority Modal Trigger */}
            <button
              onClick={() => setPriorityModalOpen(true)}
              disabled={isViewer}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <ListOrdered className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-amber-600" />
              <span>{t.bulkAssignPriority}</span>
            </button>

            {/* Change Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                disabled={isViewer}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
              >
                <Tag className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-emerald-600" />
                <span>{t.bulkChangeStatus}</span>
                <ChevronDown className="w-3 h-3 ml-1 rtl:mr-1 rtl:ml-0" />
              </button>

              {bulkStatusOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  {statuses.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        bulkUpdateStatus(st.id);
                        setBulkStatusOpen(false);
                      }}
                      className="w-full text-start px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span>{isAr ? st.labelAr : st.labelEn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Selected PDF */}
            <button
              onClick={onOpenPdf}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-ymco-primary" />
              <span>{t.bulkExport}</span>
            </button>

            {/* Delete Selected (Admin Only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) {
                    bulkDelete();
                  }
                }}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                <span>{t.bulkDelete}</span>
              </button>
            )}

            {/* Deselect All */}
            <button
              onClick={() => toggleSelectAll()}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline px-1"
            >
              {t.deselectAll}
            </button>

          </div>
        </div>
      )}

      {/* Priority Assign Popover Modal */}
      {priorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleUp">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.bulkAssignPriority}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter the starting priority number. Selected products will be repositioned sequentially starting from this position.
            </p>
            <form onSubmit={handleBulkPrioritySubmit}>
              <input
                type="number"
                min="1"
                max={products.length}
                value={assignPriorityInput}
                onChange={(e) => setAssignPriorityInput(e.target.value)}
                placeholder="e.g. 1"
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary mb-4"
              />
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setPriorityModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-lg shadow-sm"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
