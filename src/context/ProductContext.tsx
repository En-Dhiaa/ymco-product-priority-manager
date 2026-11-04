import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  ProductCategory,
  StatusConfig,
  User,
  AuditLog,
  AppSettings,
  PriorityHistorySnapshot
} from '../types';
import { initialProducts, initialCategories } from '../data/productsData';
import { initialStatuses, initialUsers, defaultSettings } from '../data/initialConfig';

interface ProductContextType {
  products: Product[];
  categories: ProductCategory[];
  statuses: StatusConfig[];
  currentUser: User;
  users: User[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  selectedProductIds: string[];
  searchQuery: string;
  filterStatus: string;
  filterCategory: string;
  filterPriorityRange: [number, number];
  sortOption: string;
  activeFilterCount: number;
  filteredProducts: Product[];
  canUndo: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Setters
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterPriorityRange: (range: [number, number]) => void;
  setSortOption: (opt: string) => void;
  clearAllFilters: () => void;
  setSelectedProductIds: (ids: string[]) => void;
  toggleSelectProduct: (id: string) => void;
  toggleSelectAll: () => void;

  // Actions
  reorderProduct: (fromIndex: number, toIndex: number) => void;
  assignPriority: (productId: string, newPriority: number) => void;
  moveProduct: (productId: string, direction: 'top' | 'up' | 'down' | 'bottom') => void;
  autoRenumberAll: () => void;
  undoLastReorder: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;

  // Bulk actions
  bulkUpdateStatus: (status: string) => void;
  bulkMoveToTop: () => void;
  bulkAssignPriority: (startPriority: number) => void;
  bulkDelete: () => void;

  // Import / Export
  applyImportData: (newItems: Product[], updatedItems: Product[]) => void;

  // Status & Settings & Auth
  updateStatusConfig: (statuses: StatusConfig[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  switchUser: (user: User) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ymco_products_catalog_2026_v2',
  SETTINGS: 'ymco_app_settings_v1',
  STATUSES: 'ymco_custom_statuses_v1',
  AUDIT: 'ymco_audit_logs_v1',
  USER: 'ymco_active_session_user_v1'
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultSettings;
  });

  // 2. Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialProducts;
  });

  // 3. Statuses state
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStatuses;
  });

  // 4. Current user session
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUsers[0]; // Admin by default
  });

  // 5. Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // 6. Undo Snapshot history
  const [historyStack, setHistoryStack] = useState<PriorityHistorySnapshot[]>([]);

  // 7. Filtering & Selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriorityRange, setFilterPriorityRange] = useState<[number, number]>([1, 1000]);
  const [sortOption, setSortOption] = useState('priority-asc');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (e) {
      console.warn('Storage quota exceeded:', e);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs.slice(0, 100)));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Helper to record audit
  const logAudit = (
    action: AuditLog['action'],
    productName: string,
    descEn: string,
    descAr: string,
    productId?: string,
    prev?: string,
    curr?: string
  ) => {
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userName: settings.language === 'ar' ? currentUser.nameAr : currentUser.name,
      userRole: currentUser.role,
      action,
      productId,
      productName,
      descriptionEn: descEn,
      descriptionAr: descAr,
      previousValue: prev,
      newValue: curr
    };
    setAuditLogs((prevLogs) => [entry, ...prevLogs.slice(0, 99)]);
  };

  // Helper to push history snapshot before mutations
  const pushHistorySnapshot = (desc: string) => {
    const snap: PriorityHistorySnapshot = {
      timestamp: new Date().toISOString(),
      sequence: products.map((p) => ({ id: p.id, priority: p.priority })),
      description: desc
    };
    setHistoryStack((prev) => [snap, ...prev.slice(0, 19)]);
  };

  // Reorder product via Drag and Drop
  const reorderProduct = (fromIndex: number, toIndex: number) => {
    if (currentUser.role === 'viewer') return;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    pushHistorySnapshot(`Reorder product from position ${fromIndex + 1} to ${toIndex + 1}`);

    setProducts((prev) => {
      const list = [...prev];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);

      // Auto-renumber priorities if enabled in settings
      if (settings.autoRenumberOnReorder) {
        return list.map((p, idx) => ({
          ...p,
          priority: idx + 1,
          updatedAt: p.id === moved.id ? new Date().toISOString() : p.updatedAt
        }));
      }
      return list;
    });

    logAudit(
      'reorder',
      products[fromIndex]?.tradeNameEn || 'Item',
      `Reordered product to position ${toIndex + 1}`,
      `تم تغيير ترتيب المستحضر إلى الموضع ${toIndex + 1}`
    );
  };

  // Assign specific priority number
  const assignPriority = (productId: string, newPriority: number) => {
    if (currentUser.role === 'viewer') return;
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const oldPriority = target.priority;
    if (oldPriority === newPriority) return;

    pushHistorySnapshot(`Assign priority #${newPriority} to ${target.tradeNameEn}`);

    setProducts((prev) => {
      // Sort currently by priority
      const list = [...prev].sort((a, b) => a.priority - b.priority);
      const currentIndex = list.findIndex((p) => p.id === productId);
      if (currentIndex === -1) return prev;

      const [item] = list.splice(currentIndex, 1);
      const clampedIndex = Math.max(0, Math.min(list.length, newPriority - 1));
      list.splice(clampedIndex, 0, item);

      return list.map((p, idx) => ({
        ...p,
        priority: idx + 1,
        updatedAt: p.id === productId ? new Date().toISOString() : p.updatedAt
      }));
    });

    logAudit(
      'reorder',
      target.tradeNameEn,
      `Changed priority from #${oldPriority} to #${newPriority}`,
      `تعديل الأولوية من #${oldPriority} إلى #${newPriority}`,
      productId,
      `#${oldPriority}`,
      `#${newPriority}`
    );
  };

  // Move controls: top, up, down, bottom
  const moveProduct = (productId: string, direction: 'top' | 'up' | 'down' | 'bottom') => {
    if (currentUser.role === 'viewer') return;

    setProducts((prev) => {
      const list = [...prev].sort((a, b) => a.priority - b.priority);
      const idx = list.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;

      pushHistorySnapshot(`Move ${direction} for ${list[idx].tradeNameEn}`);

      let newIdx = idx;
      if (direction === 'top') newIdx = 0;
      else if (direction === 'bottom') newIdx = list.length - 1;
      else if (direction === 'up') newIdx = Math.max(0, idx - 1);
      else if (direction === 'down') newIdx = Math.min(list.length - 1, idx + 1);

      if (newIdx === idx) return prev;

      const [moved] = list.splice(idx, 1);
      list.splice(newIdx, 0, moved);

      return list.map((p, i) => ({
        ...p,
        priority: i + 1,
        updatedAt: p.id === productId ? new Date().toISOString() : p.updatedAt
      }));
    });

    const target = products.find((p) => p.id === productId);
    logAudit(
      'reorder',
      target?.tradeNameEn || 'Product',
      `Moved product ${direction}`,
      `تم نقل المستحضر ${direction === 'top' ? 'للصدارة' : direction === 'bottom' ? 'للقاع' : direction === 'up' ? 'لأعلى' : 'لأسفل'}`
    );
  };

  // Auto renumber all sequentially 1..N
  const autoRenumberAll = () => {
    if (currentUser.role === 'viewer') return;
    pushHistorySnapshot('Auto-renumber all products sequentially 1..N');

    setProducts((prev) => {
      const list = [...prev].sort((a, b) => a.priority - b.priority);
      return list.map((p, idx) => ({ ...p, priority: idx + 1 }));
    });

    logAudit('reorder', 'All Products', 'Sequentially renumbered all items 1..N', 'إعادة ترقيم كافة الأصناف تسلسلياً');
  };

  // Undo last reorder
  const undoLastReorder = () => {
    if (currentUser.role === 'viewer' || historyStack.length === 0) return;
    const [lastSnap, ...remaining] = historyStack;

    const snapMap = new Map<string, number>();
    lastSnap.sequence.forEach((s) => snapMap.set(s.id, s.priority));

    setProducts((prev) => {
      const restored = prev.map((p) => {
        const prevPri = snapMap.get(p.id);
        return prevPri !== undefined ? { ...p, priority: prevPri } : p;
      });
      return restored.sort((a, b) => a.priority - b.priority);
    });

    setHistoryStack(remaining);
    logAudit('reorder', 'Priority Catalog', `Undid reorder: ${lastSnap.description}`, `تراجع عن آخر ترتيب: ${lastSnap.description}`);
  };

  // CRUD Operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentUser.role === 'viewer') return;

    const newId = `ymco-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => {
      const list = [...prev];
      list.push(newProduct);
      return list.sort((a, b) => a.priority - b.priority);
    });

    logAudit('create', newProduct.tradeNameEn, `Added new product (SKU: ${newProduct.sku})`, `إدراج صنف دوائي جديد (${newProduct.tradeNameAr})`, newId);
  };

  const updateProduct = (updated: Product) => {
    if (currentUser.role === 'viewer') return;

    const now = new Date().toISOString();
    const finalProduct = { ...updated, updatedAt: now };

    setProducts((prev) => prev.map((p) => (p.id === updated.id ? finalProduct : p)));
    logAudit('update', updated.tradeNameEn, `Updated product specifications`, `تحديث بيانات ومواصفات الصنف`, updated.id);
  };

  const deleteProduct = (productId: string) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'editor') return;
    const target = products.find((p) => p.id === productId);

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));

    logAudit('delete', target?.tradeNameEn || productId, `Deleted product record`, `حذف سجل الصنف الدوائي نهائياً`, productId);
  };

  const duplicateProduct = (productId: string) => {
    if (currentUser.role === 'viewer') return;
    const original = products.find((p) => p.id === productId);
    if (!original) return;

    const dupId = `ymco-${Date.now()}`;
    const duplicate: Product = {
      ...original,
      id: dupId,
      sku: `${original.sku}-COPY`,
      tradeNameEn: `${original.tradeNameEn} (Copy)`,
      tradeNameAr: `${original.tradeNameAr} (نسخة)`,
      priority: products.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => [...prev, duplicate]);
    logAudit('create', duplicate.tradeNameEn, `Duplicated from SKU ${original.sku}`, `تكرار الصنف من ${original.sku}`, dupId);
  };

  // Bulk Operations
  const bulkUpdateStatus = (newStatus: string) => {
    if (currentUser.role === 'viewer' || selectedProductIds.length === 0) return;

    setProducts((prev) =>
      prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
    );

    logAudit(
      'bulk_update',
      `${selectedProductIds.length} Products`,
      `Bulk updated status to ${newStatus}`,
      `تحديث جماعي للحالة إلى ${newStatus}`
    );
    setSelectedProductIds([]);
  };

  const bulkMoveToTop = () => {
    if (currentUser.role === 'viewer' || selectedProductIds.length === 0) return;

    pushHistorySnapshot(`Move ${selectedProductIds.length} selected items to top`);

    setProducts((prev) => {
      const selected = prev.filter((p) => selectedProductIds.includes(p.id));
      const remaining = prev.filter((p) => !selectedProductIds.includes(p.id));
      const combined = [...selected, ...remaining];

      return combined.map((p, idx) => ({ ...p, priority: idx + 1, updatedAt: new Date().toISOString() }));
    });

    logAudit('reorder', `${selectedProductIds.length} Items`, `Bulk moved to top priority`, `نقل جماعي للأصناف المحددة إلى الصدارة`);
  };

  const bulkAssignPriority = (startPriority: number) => {
    if (currentUser.role === 'viewer' || selectedProductIds.length === 0) return;

    pushHistorySnapshot(`Bulk assign priorities starting at #${startPriority}`);

    setProducts((prev) => {
      const selected = prev.filter((p) => selectedProductIds.includes(p.id));
      const remaining = prev.filter((p) => !selectedProductIds.includes(p.id));

      const insertIndex = Math.max(0, Math.min(remaining.length, startPriority - 1));
      remaining.splice(insertIndex, 0, ...selected);

      return remaining.map((p, idx) => ({ ...p, priority: idx + 1, updatedAt: new Date().toISOString() }));
    });

    logAudit(
      'reorder',
      `${selectedProductIds.length} Items`,
      `Assigned bulk sequence starting from #${startPriority}`,
      `تعيين أولوية متتالية بدءاً من #${startPriority}`
    );
  };

  const bulkDelete = () => {
    if (currentUser.role !== 'admin' || selectedProductIds.length === 0) return;

    const count = selectedProductIds.length;
    setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);

    logAudit('delete', `${count} Products`, `Bulk deleted ${count} products`, `حذف جماعي لـ ${count} أصناف دوائية`);
  };

  const applyImportData = (newItems: Product[], updatedItems: Product[]) => {
    if (currentUser.role === 'viewer') return;

    pushHistorySnapshot(`Import batch: ${newItems.length} new, ${updatedItems.length} updated`);

    setProducts((prev) => {
      const updateMap = new Map<string, Product>();
      updatedItems.forEach((p) => updateMap.set(p.sku.toLowerCase(), p));

      // Update existing
      const modified = prev.map((p) => {
        const matched = updateMap.get(p.sku.toLowerCase());
        return matched ? { ...p, ...matched, id: p.id, updatedAt: new Date().toISOString() } : p;
      });

      // Append new
      const combined = [...modified, ...newItems];
      return combined.sort((a, b) => a.priority - b.priority);
    });

    logAudit(
      'import',
      'Batch Import',
      `Imported ${newItems.length} new records and updated ${updatedItems.length} records`,
      `استيراد ${newItems.length} صنف جديد وتحديث ${updatedItems.length} صنف`
    );
  };

  // Statuses & Settings
  const updateStatusConfig = (newStatuses: StatusConfig[]) => {
    setStatuses(newStatuses);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'ar' : 'en' });
  };

  // Selection handlers
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterCategory('ALL');
    setFilterPriorityRange([1, 1000]);
    setSortOption('priority-asc');
  };

  // Filter and sort computation (Never mutates underlying array)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.tradeNameEn.toLowerCase().includes(q) ||
          p.tradeNameAr.toLowerCase().includes(q) ||
          p.scientificName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryEn.toLowerCase().includes(q) ||
          p.categoryAr.toLowerCase().includes(q) ||
          p.indicationsEn.toLowerCase().includes(q) ||
          p.indicationsAr.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'ALL') {
      result = result.filter((p) => p.categoryEn === filterCategory || p.categoryAr === filterCategory);
    }

    // Priority Range filter
    result = result.filter((p) => p.priority >= filterPriorityRange[0] && p.priority <= filterPriorityRange[1]);

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'priority-asc') return a.priority - b.priority;
      if (sortOption === 'priority-desc') return b.priority - a.priority;
      if (sortOption === 'name-asc') return a.tradeNameEn.localeCompare(b.tradeNameEn);
      if (sortOption === 'name-desc') return b.tradeNameEn.localeCompare(a.tradeNameEn);
      if (sortOption === 'recently-updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.priority - b.priority;
    });

    return result;
  }, [products, searchQuery, filterStatus, filterCategory, filterPriorityRange, sortOption]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterStatus !== 'ALL') count++;
    if (filterCategory !== 'ALL') count++;
    if (filterPriorityRange[0] > 1 || filterPriorityRange[1] < 1000) count++;
    return count;
  }, [searchQuery, filterStatus, filterCategory, filterPriorityRange]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories: initialCategories,
        statuses,
        currentUser,
        users: initialUsers,
        settings,
        auditLogs,
        selectedProductIds,
        searchQuery,
        filterStatus,
        filterCategory,
        filterPriorityRange,
        sortOption,
        activeFilterCount,
        filteredProducts,
        canUndo: historyStack.length > 0,
        lastSavedAt,
        hasUnsavedChanges,
        setSearchQuery,
        setFilterStatus,
        setFilterCategory,
        setFilterPriorityRange,
        setSortOption,
        clearAllFilters,
        setSelectedProductIds,
        toggleSelectProduct,
        toggleSelectAll,
        reorderProduct,
        assignPriority,
        moveProduct,
        autoRenumberAll,
        undoLastReorder,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        bulkUpdateStatus,
        bulkMoveToTop,
        bulkAssignPriority,
        bulkDelete,
        applyImportData,
        updateStatusConfig,
        updateSettings,
        switchUser,
        toggleTheme,
        toggleLanguage
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

