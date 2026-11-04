import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderTree,
  FlaskConical,
  Activity,
  Feather,
  ChevronRight,
  ChevronDown,
  Shield,
  Eye,
  Check,
  X,
  Filter,
  Tag
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { translations } from '../../utils/translations';
import {
  ActiveIngredient,
  TherapeuticCategory,
  DosageForm,
  HierarchicalCategory
} from '../../types';

export const ClassificationView: React.FC = () => {
  const {
    settings,
    products,
    hasPermission,
    activeIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    therapeuticCategories,
    addTherapeuticCategory,
    updateTherapeuticCategory,
    deleteTherapeuticCategory,
    dosageForms,
    addDosageForm,
    updateDosageForm,
    deleteDosageForm,
    hierarchicalCategories,
    addHierarchicalCategory,
    updateHierarchicalCategory,
    deleteHierarchicalCategory
  } = useProducts();

  const isAr = settings.language === 'ar';
  const t = translations[settings.language];

  // Active classification sub-tab
  const [activeTab, setActiveTab] = useState<'ingredients' | 'therapeutic' | 'dosage' | 'tree'>('ingredients');

  // Search within classification
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<ActiveIngredient | null>(null);

  const [isTherapeuticModalOpen, setIsTherapeuticModalOpen] = useState(false);
  const [editingTherapeutic, setEditingTherapeutic] = useState<TherapeuticCategory | null>(null);

  const [isDosageModalOpen, setIsDosageModalOpen] = useState(false);
  const [editingDosage, setEditingDosage] = useState<DosageForm | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HierarchicalCategory | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Expanded nodes in tree
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['cat-root-1', 'cat-root-2', 'cat-root-3']));

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Compute product counts for ingredients
  const ingredientProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeIngredients.forEach((ing) => {
      const count = products.filter((p) => {
        const matchesSci = p.scientificName.toLowerCase().includes(ing.nameEn.toLowerCase()) ||
                           p.scientificName.toLowerCase().includes(ing.nameAr.toLowerCase());
        const matchesTrade = p.tradeNameEn.toLowerCase().includes(ing.nameEn.toLowerCase()) ||
                             p.tradeNameAr.toLowerCase().includes(ing.nameAr.toLowerCase());
        const matchesLink = p.ingredientIds?.includes(ing.id);
        return matchesSci || matchesTrade || matchesLink;
      }).length;
      counts.set(ing.id, count);
    });
    return counts;
  }, [activeIngredients, products]);

  // Compute product counts for therapeutic categories
  const therapeuticProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    therapeuticCategories.forEach((tc) => {
      const count = products.filter((p) => {
        const matchesCat = p.categoryEn.toLowerCase().includes(tc.nameEn.toLowerCase()) ||
                           p.categoryAr.toLowerCase().includes(tc.nameAr.toLowerCase());
        const matchesLink = p.therapeuticCategoryIds?.includes(tc.id);
        return matchesCat || matchesLink;
      }).length;
      counts.set(tc.id, count);
    });
    return counts;
  }, [therapeuticCategories, products]);

  // Compute product counts for dosage forms
  const dosageProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dosageForms.forEach((df) => {
      const count = products.filter((p) => {
        const matchesEn = p.dosageFormEn.toLowerCase().includes(df.nameEn.toLowerCase()) || p.dosageFormEn.toLowerCase().includes(df.slug);
        const matchesAr = p.dosageFormAr.toLowerCase().includes(df.nameAr.toLowerCase());
        const matchesLink = p.dosageFormId === df.id;
        return matchesEn || matchesAr || matchesLink;
      }).length;
      counts.set(df.id, count);
    });
    return counts;
  }, [dosageForms, products]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return activeIngredients;
    const q = searchQuery.toLowerCase().trim();
    return activeIngredients.filter(
      (i) => i.nameEn.toLowerCase().includes(q) || i.nameAr.toLowerCase().includes(q) || (i.casNumber && i.casNumber.includes(q))
    );
  }, [activeIngredients, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'التصنيف الدوائي المتقدم' : 'Advanced Product Classification'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'إدارة المواد الفعالة، الأقسام العلاجية، الأشكال الصيدلانية، والتصنيف الشجري الهرمي'
                : 'Multi-dimensional taxonomy: Active Ingredients, Therapeutic Classes, Dosage Forms & Tree Hierarchy'}
            </p>
          </div>
        </div>

        {/* Action Button based on active tab */}
        {hasPermission('classification.create') && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {activeTab === 'ingredients' && (
              <button
                type="button"
                onClick={() => {
                  setEditingIngredient(null);
                  setIsIngredientModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark active:scale-95 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                <span>{isAr ? 'إضافة مادة فعالة' : 'Add Active Ingredient'}</span>
              </button>
            )}

            {activeTab === 'therapeutic' && (
              <button
                type="button"
                onClick={() => {
                  setEditingTherapeutic(null);
                  setIsTherapeuticModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                <span>{isAr ? 'إضافة تصنيف علاجي' : 'Add Therapeutic Class'}</span>
              </button>
            )}

            {activeTab === 'dosage' && (
              <button
                type="button"
                onClick={() => {
                  setEditingDosage(null);
                  setIsDosageModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                <span>{isAr ? 'إضافة شكل صيدلاني' : 'Add Dosage Form'}</span>
              </button>
            )}

            {activeTab === 'tree' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedParentId(null);
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                <span>{isAr ? 'إضافة قسم رئيسي' : 'Add Root Category'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 rtl:space-x-reverse overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('ingredients')}
          className={`inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ingredients'
              ? 'border-ymco-primary text-ymco-primary dark:text-ymco-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{isAr ? 'المواد الفعالة (APIs)' : 'Active Ingredients'}</span>
          <span className="ml-2 rtl:mr-2 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {activeIngredients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('therapeutic')}
          className={`inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'therapeutic'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{isAr ? 'التصنيف العلاجي' : 'Therapeutic Uses'}</span>
          <span className="ml-2 rtl:mr-2 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {therapeuticCategories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dosage')}
          className={`inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dosage'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Feather className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{isAr ? 'الأشكال الصيدلانية' : 'Dosage Forms'}</span>
          <span className="ml-2 rtl:mr-2 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {dosageForms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tree')}
          className={`inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tree'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{isAr ? 'شجرة التصنيف الهرمية' : 'Category Hierarchy Tree'}</span>
          <span className="ml-2 rtl:mr-2 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {hierarchicalCategories.length}
          </span>
        </button>
      </div>

      {/* Sub-Tab 1: Active Ingredients */}
      {activeTab === 'ingredients' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث في المواد الفعالة ورقم CAS...' : 'Search active ingredients, CAS number...'}
                className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>
            <span className="text-xs text-slate-500">
              {filteredIngredients.length} {isAr ? 'مادة متوفرة' : 'ingredients'}
            </span>
          </div>

          {/* Ingredients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIngredients.map((ing) => {
              const productCount = ingredientProductCounts.get(ing.id) || 0;
              return (
                <div
                  key={ing.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-ymco-primary/60 transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                            {isAr ? ing.nameAr : ing.nameEn}
                          </h3>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {isAr ? ing.nameEn : ing.nameAr}
                          </span>
                        </div>
                      </div>

                      {ing.defaultStrength && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                          {ing.defaultStrength} {ing.unit || '%'}
                        </span>
                      )}
                    </div>

                    {(ing.descriptionAr || ing.descriptionEn) && (
                      <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {isAr ? ing.descriptionAr || ing.descriptionEn : ing.descriptionEn || ing.descriptionAr}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Tag className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 text-slate-400" />
                      {productCount} {isAr ? 'أصناف مرتبطة' : 'products'}
                    </span>

                    {hasPermission('classification.edit') && (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIngredient(ing);
                            setIsIngredientModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {hasPermission('classification.delete') && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(isAr ? 'هل أنت متأكد من حذف هذه المادة الفعالة؟' : 'Delete this active ingredient?')) {
                                deleteIngredient(ing.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Therapeutic Categories */}
      {activeTab === 'therapeutic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {therapeuticCategories.map((tc) => {
            const count = therapeuticProductCounts.get(tc.id) || 0;
            return (
              <div
                key={tc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: tc.color || '#0284c7' }}
                    >
                      <Activity className="w-5 h-5" />
                    </div>

                    {tc.code && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {tc.code}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {isAr ? tc.nameAr : tc.nameEn}
                  </h3>
                  <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
                    {isAr ? tc.nameEn : tc.nameAr}
                  </span>

                  {(tc.descriptionAr || tc.descriptionEn) && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {isAr ? tc.descriptionAr || tc.descriptionEn : tc.descriptionEn || tc.descriptionAr}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {count} {isAr ? 'صنف مسجل' : 'items'}
                  </span>

                  {hasPermission('classification.edit') && (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTherapeutic(tc);
                          setIsTherapeuticModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {hasPermission('classification.delete') && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(isAr ? 'حذف هذا التصنيف العلاجي؟' : 'Delete this category?')) {
                              deleteTherapeuticCategory(tc.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 3: Dosage Forms */}
      {activeTab === 'dosage' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {dosageForms.map((df) => {
            const count = dosageProductCounts.get(df.id) || 0;
            return (
              <div
                key={df.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/50 transition-all shadow-2xs"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {isAr ? df.nameAr : df.nameEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {df.routeAr || df.routeEn || 'Topical / External'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {count}
                  </span>

                  {df.isCustom && hasPermission('classification.delete') && (
                    <button
                      type="button"
                      onClick={() => deleteDosageForm(df.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 4: Hierarchical Category Tree */}
      {activeTab === 'tree' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'شجرة التصنيف الهيكلية متعددة المستويات' : 'Multi-Level Category Hierarchy Tree'}
              </h3>
              <span className="text-xs text-slate-500">
                {isAr ? 'هيكل تنظيمي متدرج يتيح تفريع الأصناف حسب المجموعات الرئيسية والفرعية' : 'Hierarchical parent-child nodes structure with automatic inheritance'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {hierarchicalCategories.map((root) => {
              const isExpanded = expandedNodes.has(root.id);
              const children = root.children || [];

              return (
                <div key={root.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-800/30">
                  {/* Root Node Header */}
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleNode(root.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
                      </button>

                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: root.color }}
                      >
                        <FolderTree className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                          {isAr ? root.nameAr : root.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {isAr ? root.nameEn : root.nameAr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {children.length} {isAr ? 'فروع' : 'branches'}
                      </span>

                      {hasPermission('classification.create') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParentId(root.id);
                            setEditingCategory(null);
                            setIsCategoryModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-black rounded-lg transition-colors inline-flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                          <span>{isAr ? 'إضافة فرع' : 'Add Child'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Child Nodes */}
                  {isExpanded && children.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60 pl-8 rtl:pr-8 rtl:pl-0">
                      {children.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color || root.color }} />
                            <div>
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                                {isAr ? sub.nameAr : sub.nameEn}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {isAr ? sub.nameEn : sub.nameAr}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Level 2 Node
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isIngredientModalOpen && (
        <IngredientModal
          ingredient={editingIngredient}
          onClose={() => setIsIngredientModalOpen(false)}
          onSave={(data) => {
            if (editingIngredient) {
              updateIngredient({ ...editingIngredient, ...data });
            } else {
              addIngredient(data);
            }
            setIsIngredientModalOpen(false);
          }}
        />
      )}

      {/* Add / Edit Therapeutic Modal */}
      {isTherapeuticModalOpen && (
        <TherapeuticModal
          category={editingTherapeutic}
          onClose={() => setIsTherapeuticModalOpen(false)}
          onSave={(data) => {
            if (editingTherapeutic) {
              updateTherapeuticCategory({ ...editingTherapeutic, ...data });
            } else {
              addTherapeuticCategory(data);
            }
            setIsTherapeuticModalOpen(false);
          }}
        />
      )}

      {/* Add / Edit Dosage Form Modal */}
      {isDosageModalOpen && (
        <DosageModal
          dosage={editingDosage}
          onClose={() => setIsDosageModalOpen(false)}
          onSave={(data) => {
            if (editingDosage) {
              updateDosageForm({ ...editingDosage, ...data });
            } else {
              addDosageForm(data);
            }
            setIsDosageModalOpen(false);
          }}
        />
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          parentId={selectedParentId}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={(data) => {
            if (editingCategory) {
              updateHierarchicalCategory({ ...editingCategory, ...data });
            } else {
              addHierarchicalCategory(data);
            }
            setIsCategoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal Components
interface ModalProps<T> {
  ingredient?: T | null;
  category?: T | null;
  dosage?: T | null;
  parentId?: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const IngredientModal: React.FC<ModalProps<ActiveIngredient>> = ({ ingredient, onClose, onSave }) => {
  const [form, setForm] = useState({
    nameEn: ingredient?.nameEn || '',
    nameAr: ingredient?.nameAr || '',
    defaultStrength: ingredient?.defaultStrength || '',
    unit: ingredient?.unit || '%',
    casNumber: ingredient?.casNumber || '',
    descriptionEn: ingredient?.descriptionEn || '',
    descriptionAr: ingredient?.descriptionAr || '',
    isCombination: ingredient?.isCombination || false
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {ingredient ? 'تعديل مادة فعالة (Active Ingredient)' : 'إضافة مادة فعالة جديدة'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المادة (الإنجليزية) *</label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="e.g. Clotrimazole"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المادة (العربية) *</label>
              <input
                type="text"
                required
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="مثال: كلوتريمازول"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">التركيز / القوة</label>
              <input
                type="text"
                value={form.defaultStrength}
                onChange={(e) => setForm({ ...form, defaultStrength: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="e.g. 1 or 500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الوحدة</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="%">% (Percentage)</option>
                <option value="mg">mg (Milligrams)</option>
                <option value="g">g (Grams)</option>
                <option value="mcg">mcg (Micrograms)</option>
                <option value="ml">ml (Milliliters)</option>
                <option value="IU">IU (International Units)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم CAS الدوائي</label>
              <input
                type="text"
                value={form.casNumber}
                onChange={(e) => setForm({ ...form, casNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                placeholder="e.g. 23593-75-1"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الوصف والاستطباب</label>
            <textarea
              rows={2}
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              placeholder="وصف آلية العمل والاستخدام الصيدلاني..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => {
              if (!form.nameEn || !form.nameAr) return alert('يرجى كتابة اسم المادة باللغتين');
              onSave(form);
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-xl"
          >
            حفظ المادة الفعالة
          </button>
        </div>
      </div>
    </div>
  );
};

const TherapeuticModal: React.FC<ModalProps<TherapeuticCategory>> = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({
    nameEn: category?.nameEn || '',
    nameAr: category?.nameAr || '',
    code: category?.code || '',
    color: category?.color || '#0284c7',
    descriptionAr: category?.descriptionAr || '',
    descriptionEn: category?.descriptionEn || '',
    isActive: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          {category ? 'تعديل التصنيف العلاجي' : 'إضافة تصنيف علاجي جديد'}
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">الاسم بالعربية *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">الاسم بالإنجليزية *</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">الكود المختصر</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">لون التمييز</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-9 rounded-lg border cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold">إلغاء</button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

const DosageModal: React.FC<ModalProps<DosageForm>> = ({ dosage, onClose, onSave }) => {
  const [form, setForm] = useState({
    nameEn: dosage?.nameEn || '',
    nameAr: dosage?.nameAr || '',
    slug: dosage?.slug || '',
    routeAr: dosage?.routeAr || 'موضعي على الجلد',
    routeEn: dosage?.routeEn || 'Topical',
    isActive: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">إضافة شكل صيدلاني مخصص</h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">الاسم بالعربية *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              placeholder="مثال: قطرة أذن"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">الاسم بالإنجليزية *</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              placeholder="e.g. Ear Drops"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">طريقة الإعطاء (Route)</label>
            <input
              type="text"
              value={form.routeAr}
              onChange={(e) => setForm({ ...form, routeAr: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold">إلغاء</button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryModal: React.FC<ModalProps<HierarchicalCategory>> = ({ category, parentId, onClose, onSave }) => {
  const [form, setForm] = useState({
    nameEn: category?.nameEn || '',
    nameAr: category?.nameAr || '',
    descriptionAr: category?.descriptionAr || '',
    descriptionEn: category?.descriptionEn || '',
    color: category?.color || '#0284c7',
    icon: category?.icon || 'folder',
    sortOrder: 1,
    isActive: true,
    parentId: parentId || null
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          {parentId ? 'إضافة فرع تصنيفي جديد' : 'إضافة قسم تصنيف رئيسي'}
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">الاسم بالعربية *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">الاسم بالإنجليزية *</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">لون التمييز</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full h-9 rounded-lg border cursor-pointer"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold">إلغاء</button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};
export default ClassificationView;
