import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  ProductCategory,
  StatusConfig,
  User,
  AuditLog,
  AppSettings,
  PriorityHistorySnapshot,
  ActiveIngredient,
  TherapeuticCategory,
  DosageForm,
  HierarchicalCategory,
  Collection,
  CollectionItem,
  SmartCollectionRules,
  Role,
  PermissionKey,
  AppNavigationSection
} from '../types';
import { initialProducts, initialCategories } from '../data/productsData';
import {
  initialStatuses,
  initialUsers,
  initialRoles,
  defaultSettings,
  ALL_PERMISSIONS
} from '../data/initialConfig';
import {
  initialActiveIngredients,
  initialTherapeuticCategories,
  initialDosageForms,
  initialHierarchicalCategories
} from '../data/classificationData';
import { initialCollections } from '../data/collectionsData';

interface ProductContextType {
  // Navigation & Views
  currentSection: AppNavigationSection;
  setCurrentSection: (section: AppNavigationSection) => void;

  // Products
  products: Product[];
  categories: ProductCategory[];
  statuses: StatusConfig[];
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

  // Product Setters & Actions
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterPriorityRange: (range: [number, number]) => void;
  setSortOption: (opt: string) => void;
  clearAllFilters: () => void;
  setSelectedProductIds: (ids: string[]) => void;
  toggleSelectProduct: (id: string) => void;
  toggleSelectAll: () => void;

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

  // Classification (Module 1)
  activeIngredients: ActiveIngredient[];
  addIngredient: (ingredient: Omit<ActiveIngredient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIngredient: (ingredient: ActiveIngredient) => void;
  deleteIngredient: (ingredientId: string) => void;

  therapeuticCategories: TherapeuticCategory[];
  addTherapeuticCategory: (cat: Omit<TherapeuticCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTherapeuticCategory: (cat: TherapeuticCategory) => void;
  deleteTherapeuticCategory: (catId: string) => void;

  dosageForms: DosageForm[];
  addDosageForm: (df: Omit<DosageForm, 'id' | 'createdAt'>) => void;
  updateDosageForm: (df: DosageForm) => void;
  deleteDosageForm: (dfId: string) => void;

  hierarchicalCategories: HierarchicalCategory[];
  addHierarchicalCategory: (cat: Omit<HierarchicalCategory, 'id'>) => void;
  updateHierarchicalCategory: (cat: HierarchicalCategory) => void;
  deleteHierarchicalCategory: (catId: string) => void;

  linkProductClassification: (
    productId: string,
    ingredientIds?: string[],
    therapeuticCategoryIds?: string[],
    dosageFormId?: string,
    hierarchicalCategoryId?: string
  ) => void;

  // Collections (Module 2)
  collections: Collection[];
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  createCollection: (col: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'items'>) => string;
  updateCollection: (col: Collection) => void;
  deleteCollection: (collectionId: string) => void;
  duplicateCollection: (collectionId: string) => void;
  archiveCollection: (collectionId: string) => void;
  addProductsToCollection: (collectionId: string, productIds: string[]) => void;
  removeProductFromCollection: (collectionId: string, productId: string) => void;
  reorderCollectionProduct: (collectionId: string, fromIndex: number, toIndex: number) => void;
  assignCollectionPriority: (collectionId: string, productId: string, newPriority: number) => void;
  moveCollectionProduct: (collectionId: string, productId: string, direction: 'top' | 'up' | 'down' | 'bottom') => void;
  autoRenumberCollection: (collectionId: string) => void;
  getCollectionProducts: (collection: Collection) => (Product & { collectionPriority: number })[];

  // User Management & RBAC (Module 4, 5, 6)
  currentUser: User;
  users: User[];
  roles: Role[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  hasPermission: (permission: PermissionKey) => boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (user: User) => boolean;
  toggleUserStatus: (userId: string) => boolean;
  resetUserPassword: (userId: string) => void;
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  switchUser: (user: User) => void;

  // Status & Settings & Logs
  settings: AppSettings;
  auditLogs: AuditLog[];
  updateStatusConfig: (statuses: StatusConfig[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  logAuditEvent: (
    action: AuditLog['action'],
    descriptionEn: string,
    descriptionAr: string,
    entityType?: AuditLog['entityType'],
    entityId?: string,
    productId?: string,
    productName?: string,
    previousValue?: string,
    newValue?: string
  ) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'umco_products_catalog_2026_v2',
  SETTINGS: 'umco_app_settings_v2',
  STATUSES: 'umco_custom_statuses_v2',
  AUDIT: 'umco_audit_logs_v2',
  USER: 'umco_active_session_user_v2',
  USERS_LIST: 'umco_users_registry_v2',
  ROLES: 'umco_roles_registry_v2',
  INGREDIENTS: 'umco_active_ingredients_v1',
  THERAPEUTIC: 'umco_therapeutic_categories_v1',
  DOSAGE_FORMS: 'umco_dosage_forms_v1',
  HIERARCHICAL: 'umco_hierarchical_categories_v1',
  COLLECTIONS: 'umco_collections_registry_v1',
  ACTIVE_SECTION: 'umco_active_nav_section_v1'
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation Section
  const [currentSection, setCurrentSection] = useState<AppNavigationSection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTION);
      if (saved) return saved as AppNavigationSection;
    } catch (e) {}
    return 'products';
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultSettings;
  });

  // Products
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

  // Statuses
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStatuses;
  });

  // Roles
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialRoles;
  });

  // Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUsers;
  });

  // Active Current User
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUsers[0]; // Eng. Dhiaa Al-Himyari (Super Admin)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Active Ingredients (Module 1)
  const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialActiveIngredients;
  });

  // Therapeutic Categories (Module 1)
  const [therapeuticCategories, setTherapeuticCategories] = useState<TherapeuticCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THERAPEUTIC);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialTherapeuticCategories;
  });

  // Dosage Forms (Module 1)
  const [dosageForms, setDosageForms] = useState<DosageForm[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOSAGE_FORMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialDosageForms;
  });

  // Hierarchical Categories (Module 1)
  const [hierarchicalCategories, setHierarchicalCategories] = useState<HierarchicalCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIERARCHICAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialHierarchicalCategories;
  });

  // Custom Collections (Module 2)
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialCollections;
  });

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Audit Logs (Module 8)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Undo Snapshot history
  const [historyStack, setHistoryStack] = useState<PriorityHistorySnapshot[]>([]);

  // Filtering & Selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriorityRange, setFilterPriorityRange] = useState<[number, number]>([1, 1000]);
  const [sortOption, setSortOption] = useState('priority_asc');

  // Persistence State
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Persistence Sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      setLastSavedAt(new Date());
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
    } catch (e) {}
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    } catch (e) {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(activeIngredients));
    } catch (e) {}
  }, [activeIngredients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THERAPEUTIC, JSON.stringify(therapeuticCategories));
    } catch (e) {}
  }, [therapeuticCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOSAGE_FORMS, JSON.stringify(dosageForms));
    } catch (e) {}
  }, [dosageForms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HIERARCHICAL, JSON.stringify(hierarchicalCategories));
    } catch (e) {}
  }, [hierarchicalCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {}
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, currentSection);
    } catch (e) {}
  }, [currentSection]);

  // Synchronize HTML Theme and Direction
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    if (settings.language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
    }
  }, [settings.theme, settings.language]);

  // Audit Logging helper
  const logAuditEvent = (
    action: AuditLog['action'],
    descriptionEn: string,
    descriptionAr: string,
    entityType?: AuditLog['entityType'],
    entityId?: string,
    productId?: string,
    productName?: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      productId,
      productName: productName || (productId ? 'Product' : 'System Entity'),
      descriptionEn,
      descriptionAr,
      previousValue,
      newValue
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // RBAC Permission Checker
  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.status === 'disabled') return false;

    // Super Administrator has total access
    if (currentUser.roleId === 'super_admin' || currentUser.role === 'admin') {
      return true;
    }

    // Check role permissions
    const userRole = roles.find((r) => r.id === (currentUser.roleId || currentUser.role));
    if (userRole && userRole.permissions.includes(permission)) {
      return true;
    }

    // Check individual extra permissions
    if (currentUser.customPermissions && currentUser.customPermissions.includes(permission)) {
      return true;
    }

    return false;
  };

  // Auth Operations
  const login = (email: string, _password?: string): boolean => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (target) {
      if (target.status === 'disabled') {
        alert('This user account has been disabled by the system administrator.');
        return false;
      }
      const updatedUser: User = {
        ...target,
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updatedUser : u)));
      setIsAuthenticated(true);
      logAuditEvent(
        'login',
        `User ${target.name} logged into the system`,
        `قام المستخدم ${target.nameAr || target.name} بتسجيل الدخول إلى المنصة`,
        'user',
        target.id
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    logAuditEvent(
      'logout',
      `User ${currentUser.name} logged out`,
      `قام المستخدم ${currentUser.nameAr || currentUser.name} بتسجيل الخروج`,
      'user',
      currentUser.id
    );
    setIsAuthenticated(false);
  };

  const switchUser = (newUser: User) => {
    if (newUser.status === 'disabled') {
      alert('Cannot switch to a disabled user account.');
      return;
    }
    setCurrentUser(newUser);
    logAuditEvent(
      'user_change',
      `Switched active simulation user to ${newUser.name} (${newUser.role.toUpperCase()})`,
      `تم تبديل المستخدم النشط إلى ${newUser.nameAr || newUser.name} (${newUser.role})`,
      'user',
      newUser.id
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!hasPermission('users.create')) {
      alert('Access Denied: You lack permissions to create users.');
      return;
    }
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
    logAuditEvent(
      'create',
      `Created user account: ${newUser.name} (${newUser.role})`,
      `تم إنشاء حساب مستخدم جديد: ${newUser.nameAr || newUser.name}`,
      'user',
      newUser.id
    );
  };

  const updateUser = (updatedUser: User): boolean => {
    if (!hasPermission('users.edit')) {
      alert('Access Denied: You lack permissions to modify users.');
      return false;
    }
    // Safety protection: Ensure there is always at least one active Super Admin
    if (updatedUser.roleId !== 'super_admin' && updatedUser.role !== 'admin') {
      const activeSuperAdmins = users.filter(
        (u) =>
          u.id !== updatedUser.id &&
          (u.roleId === 'super_admin' || u.role === 'admin') &&
          u.status !== 'disabled'
      );
      if (activeSuperAdmins.length === 0) {
        alert('Critical Action Blocked: You cannot remove the last Super Administrator role from the system.');
        return false;
      }
    }

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    logAuditEvent(
      'update',
      `Updated user profile: ${updatedUser.name}`,
      `تم تعديل بيانات المستخدم: ${updatedUser.nameAr || updatedUser.name}`,
      'user',
      updatedUser.id
    );
    return true;
  };

  const toggleUserStatus = (userId: string): boolean => {
    if (!hasPermission('users.disable')) {
      alert('Access Denied: You lack permissions to disable user accounts.');
      return false;
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    // Safety protection: Never disable the last active Super Admin
    if (target.status !== 'disabled' && (target.roleId === 'super_admin' || target.role === 'admin')) {
      const activeSuperAdmins = users.filter(
        (u) =>
          u.id !== userId &&
          (u.roleId === 'super_admin' || u.role === 'admin') &&
          u.status !== 'disabled'
      );
      if (activeSuperAdmins.length === 0) {
        alert('Critical Protection: Cannot disable the only active Super Administrator in the system.');
        return false;
      }
    }

    const nextStatus = target.status === 'disabled' ? 'active' : 'disabled';
    const updated: User = { ...target, status: nextStatus };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    logAuditEvent(
      'user_change',
      `Changed user ${target.name} status to ${nextStatus}`,
      `تم تغيير حالة المستخدم ${target.nameAr || target.name} إلى ${nextStatus === 'active' ? 'نشط' : 'معطل'}`,
      'user',
      userId
    );
    return true;
  };

  const resetUserPassword = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      logAuditEvent(
        'user_change',
        `Issued password reset invitation for ${target.email}`,
        `تم إصدار رابط إعادة تعيين كلمة المرور للمستخدم ${target.email}`,
        'user',
        userId
      );
      alert(`Password reset link generated and dispatched to: ${target.email}`);
    }
  };

  const addRole = (newRole: Role) => {
    if (!hasPermission('users.assign_roles')) {
      alert('Access Denied: You lack permission to manage roles.');
      return;
    }
    setRoles((prev) => [...prev, newRole]);
    logAuditEvent(
      'permission_change',
      `Created custom role: ${newRole.nameEn}`,
      `تم إنشاء دور وظيفي مخصص: ${newRole.nameAr}`,
      'role',
      newRole.id
    );
  };

  const updateRole = (updatedRole: Role) => {
    if (!hasPermission('users.assign_roles')) {
      alert('Access Denied: You lack permission to edit roles.');
      return;
    }
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    logAuditEvent(
      'permission_change',
      `Updated permissions for role: ${updatedRole.nameEn}`,
      `تم تحديث مصفوفة الصلاحيات للدور: ${updatedRole.nameAr}`,
      'role',
      updatedRole.id
    );
  };

  // ---------------------------------------------------------------------------
  // Classification Engine (Module 1)
  // ---------------------------------------------------------------------------
  const addIngredient = (ing: Omit<ActiveIngredient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!hasPermission('classification.create')) {
      alert('Access Denied: You lack permission to add active ingredients.');
      return;
    }
    const newIng: ActiveIngredient = {
      ...ing,
      id: `ing-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActiveIngredients((prev) => [newIng, ...prev]);
    logAuditEvent(
      'classification_change',
      `Added active ingredient: ${newIng.nameEn}`,
      `تمت إضافة مادة فعالة: ${newIng.nameAr}`,
      'ingredient',
      newIng.id
    );
  };

  const updateIngredient = (updated: ActiveIngredient) => {
    if (!hasPermission('classification.edit')) {
      alert('Access Denied: You lack permission to modify active ingredients.');
      return;
    }
    setActiveIngredients((prev) => prev.map((i) => (i.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : i)));
    logAuditEvent(
      'classification_change',
      `Updated active ingredient: ${updated.nameEn}`,
      `تم تعديل المادة الفعالة: ${updated.nameAr}`,
      'ingredient',
      updated.id
    );
  };

  const deleteIngredient = (id: string) => {
    if (!hasPermission('classification.delete')) {
      alert('Access Denied: You lack permission to delete active ingredients.');
      return;
    }
    const target = activeIngredients.find((i) => i.id === id);
    setActiveIngredients((prev) => prev.filter((i) => i.id !== id));
    logAuditEvent(
      'classification_change',
      `Deleted active ingredient: ${target?.nameEn || id}`,
      `تم حذف المادة الفعالة: ${target?.nameAr || id}`,
      'ingredient',
      id
    );
  };

  const addTherapeuticCategory = (cat: Omit<TherapeuticCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!hasPermission('classification.create')) return;
    const newCat: TherapeuticCategory = {
      ...cat,
      id: `tc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTherapeuticCategories((prev) => [newCat, ...prev]);
    logAuditEvent('classification_change', `Created therapeutic category: ${newCat.nameEn}`, `تم إنشاء تصنيف علاجي: ${newCat.nameAr}`, 'category', newCat.id);
  };

  const updateTherapeuticCategory = (updated: TherapeuticCategory) => {
    if (!hasPermission('classification.edit')) return;
    setTherapeuticCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c)));
    logAuditEvent('classification_change', `Updated therapeutic category: ${updated.nameEn}`, `تم تحديث التصنيف العلاجي: ${updated.nameAr}`, 'category', updated.id);
  };

  const deleteTherapeuticCategory = (id: string) => {
    if (!hasPermission('classification.delete')) return;
    setTherapeuticCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addDosageForm = (df: Omit<DosageForm, 'id' | 'createdAt'>) => {
    if (!hasPermission('classification.create')) return;
    const newDf: DosageForm = {
      ...df,
      id: `df-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    setDosageForms((prev) => [...prev, newDf]);
    logAuditEvent('classification_change', `Added custom dosage form: ${newDf.nameEn}`, `تمت إضافة شكل صيدلاني: ${newDf.nameAr}`);
  };

  const updateDosageForm = (updated: DosageForm) => {
    if (!hasPermission('classification.edit')) return;
    setDosageForms((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const deleteDosageForm = (id: string) => {
    if (!hasPermission('classification.delete')) return;
    setDosageForms((prev) => prev.filter((d) => d.id !== id));
  };

  const addHierarchicalCategory = (cat: Omit<HierarchicalCategory, 'id'>) => {
    if (!hasPermission('classification.create')) return;
    const newCat: HierarchicalCategory = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    setHierarchicalCategories((prev) => [...prev, newCat]);
    logAuditEvent('classification_change', `Added category node: ${newCat.nameEn}`, `تمت إضافة عقدة تصنيف شجري: ${newCat.nameAr}`, 'category', newCat.id);
  };

  const updateHierarchicalCategory = (updated: HierarchicalCategory) => {
    if (!hasPermission('classification.edit')) return;
    setHierarchicalCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteHierarchicalCategory = (id: string) => {
    if (!hasPermission('classification.delete')) return;
    setHierarchicalCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const linkProductClassification = (
    productId: string,
    ingredientIds?: string[],
    therapeuticCategoryIds?: string[],
    dosageFormId?: string,
    hierarchicalCategoryId?: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          ingredientIds: ingredientIds !== undefined ? ingredientIds : p.ingredientIds,
          therapeuticCategoryIds: therapeuticCategoryIds !== undefined ? therapeuticCategoryIds : p.therapeuticCategoryIds,
          dosageFormId: dosageFormId !== undefined ? dosageFormId : p.dosageFormId,
          hierarchicalCategoryId: hierarchicalCategoryId !== undefined ? hierarchicalCategoryId : p.hierarchicalCategoryId,
          updatedAt: new Date().toISOString()
        };
      })
    );
    logAuditEvent('classification_change', `Updated classification links for product ID: ${productId}`, `تم تحديث روابط التصنيف للمنتج: ${productId}`, 'product', productId);
  };

  // ---------------------------------------------------------------------------
  // Custom Collections Engine (Module 2)
  // ---------------------------------------------------------------------------
  const createCollection = (colData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'items'>): string => {
    if (!hasPermission('collections.create')) {
      alert('Access Denied: You lack permissions to create collections.');
      return '';
    }
    const newColId = `col-${Date.now()}`;
    const newCol: Collection = {
      ...colData,
      id: newColId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections((prev) => [newCol, ...prev]);
    logAuditEvent(
      'collection_change',
      `Created new collection: ${newCol.nameEn} (${newCol.type.toUpperCase()})`,
      `تم إنشاء مجموعة جديدة: ${newCol.nameAr} (${newCol.type})`,
      'collection',
      newCol.id
    );
    return newColId;
  };

  const updateCollection = (col: Collection) => {
    if (!hasPermission('collections.edit')) {
      alert('Access Denied: You lack permissions to edit collections.');
      return;
    }
    setCollections((prev) => prev.map((c) => (c.id === col.id ? { ...col, updatedAt: new Date().toISOString() } : c)));
    logAuditEvent(
      'collection_change',
      `Updated collection properties: ${col.nameEn}`,
      `تم تعديل بيانات المجموعة: ${col.nameAr}`,
      'collection',
      col.id
    );
  };

  const deleteCollection = (collectionId: string) => {
    if (!hasPermission('collections.delete')) {
      alert('Access Denied: You lack permissions to delete collections.');
      return;
    }
    const target = collections.find((c) => c.id === collectionId);
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    if (activeCollectionId === collectionId) {
      setActiveCollectionId(null);
    }
    logAuditEvent(
      'collection_change',
      `Deleted collection: ${target?.nameEn || collectionId}`,
      `تم حذف المجموعة: ${target?.nameAr || collectionId}`,
      'collection',
      collectionId
    );
  };

  const duplicateCollection = (collectionId: string) => {
    const target = collections.find((c) => c.id === collectionId);
    if (!target) return;
    const dup: Collection = {
      ...target,
      id: `col-${Date.now()}`,
      nameEn: `${target.nameEn} (Copy)`,
      nameAr: `${target.nameAr} (نسخة)`,
      items: [...target.items],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections((prev) => [dup, ...prev]);
    logAuditEvent('collection_change', `Duplicated collection: ${target.nameEn}`, `تم تكرار المجموعة: ${target.nameAr}`, 'collection', dup.id);
  };

  const archiveCollection = (collectionId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const newStatus = c.status === 'archived' ? 'active' : 'archived';
        return { ...c, status: newStatus, updatedAt: new Date().toISOString() };
      })
    );
  };

  const addProductsToCollection = (collectionId: string, productIds: string[]) => {
    if (!hasPermission('collections.manage_members')) {
      alert('Access Denied: You lack permissions to modify collection membership.');
      return;
    }
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const existingIds = new Set(c.items.map((it) => it.productId));
        const newItems: CollectionItem[] = [...c.items];
        let currentMaxPriority = c.items.length > 0 ? Math.max(...c.items.map((it) => it.priority)) : 0;

        productIds.forEach((pid) => {
          if (!existingIds.has(pid)) {
            currentMaxPriority += 1;
            newItems.push({
              productId: pid,
              priority: currentMaxPriority,
              addedAt: new Date().toISOString()
            });
          }
        });

        return { ...c, items: newItems, updatedAt: new Date().toISOString() };
      })
    );
    logAuditEvent(
      'collection_change',
      `Added ${productIds.length} product(s) to collection ID: ${collectionId}`,
      `تمت إضافة ${productIds.length} منتج إلى المجموعة`,
      'collection',
      collectionId
    );
  };

  const removeProductFromCollection = (collectionId: string, productId: string) => {
    if (!hasPermission('collections.manage_members')) return;
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        // Removing a product from a collection NEVER deletes the product itself!
        const filtered = c.items.filter((it) => it.productId !== productId);
        // Renumber remaining items 1..N
        const renumbered = filtered.map((it, idx) => ({ ...it, priority: idx + 1 }));
        return { ...c, items: renumbered, updatedAt: new Date().toISOString() };
      })
    );
    logAuditEvent(
      'collection_change',
      `Removed product ${productId} from collection ID: ${collectionId}`,
      `تمت إزالة المنتج ${productId} من المجموعة دون حذفه من المنصة`,
      'collection',
      collectionId
    );
  };

  // Independent ordering within a collection
  const reorderCollectionProduct = (collectionId: string, fromIndex: number, toIndex: number) => {
    if (!hasPermission('collections.reorder')) return;
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const itemsCopy = [...c.items];
        if (fromIndex < 0 || fromIndex >= itemsCopy.length || toIndex < 0 || toIndex >= itemsCopy.length) return c;

        const [moved] = itemsCopy.splice(fromIndex, 1);
        itemsCopy.splice(toIndex, 0, moved);

        // Assign clean 1..N priorities within this collection
        const updatedItems = itemsCopy.map((item, idx) => ({
          ...item,
          priority: idx + 1
        }));

        return { ...c, items: updatedItems, updatedAt: new Date().toISOString() };
      })
    );
    // Note: Global product priority sequence in 'products' array is completely untouched!
    logAuditEvent(
      'reorder',
      `Reordered product in collection ID ${collectionId} from rank ${fromIndex + 1} to ${toIndex + 1}`,
      `تم تغيير ترتيب صنف داخل المجموعة من #${fromIndex + 1} إلى #${toIndex + 1}`,
      'collection',
      collectionId
    );
  };

  const assignCollectionPriority = (collectionId: string, productId: string, newPriority: number) => {
    if (!hasPermission('collections.reorder')) return;
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const itemIdx = c.items.findIndex((it) => it.productId === productId);
        if (itemIdx === -1) return c;

        const itemsCopy = [...c.items];
        const [target] = itemsCopy.splice(itemIdx, 1);
        const targetPos = Math.max(0, Math.min(itemsCopy.length, newPriority - 1));
        itemsCopy.splice(targetPos, 0, target);

        const renumbered = itemsCopy.map((it, idx) => ({
          ...it,
          priority: idx + 1
        }));

        return { ...c, items: renumbered, updatedAt: new Date().toISOString() };
      })
    );
  };

  const moveCollectionProduct = (collectionId: string, productId: string, direction: 'top' | 'up' | 'down' | 'bottom') => {
    if (!hasPermission('collections.reorder')) return;
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const idx = c.items.findIndex((it) => it.productId === productId);
        if (idx === -1) return c;

        let targetIdx = idx;
        if (direction === 'top') targetIdx = 0;
        else if (direction === 'bottom') targetIdx = c.items.length - 1;
        else if (direction === 'up') targetIdx = Math.max(0, idx - 1);
        else if (direction === 'down') targetIdx = Math.min(c.items.length - 1, idx + 1);

        if (targetIdx === idx) return c;

        const itemsCopy = [...c.items];
        const [moved] = itemsCopy.splice(idx, 1);
        itemsCopy.splice(targetIdx, 0, moved);

        const renumbered = itemsCopy.map((it, i) => ({
          ...it,
          priority: i + 1
        }));

        return { ...c, items: renumbered, updatedAt: new Date().toISOString() };
      })
    );
  };

  const autoRenumberCollection = (collectionId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const renumbered = c.items.map((it, idx) => ({ ...it, priority: idx + 1 }));
        return { ...c, items: renumbered, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Dynamic products getter for a collection (Manual vs Smart)
  const getCollectionProducts = (col: Collection): (Product & { collectionPriority: number })[] => {
    const productMap = new Map(products.map((p) => [p.id, p]));

    if (col.type === 'smart' && col.smartRules && col.smartRules.conditions.length > 0) {
      const isOr = col.smartRules.logicalOperator === 'OR';
      const matchingProducts = products.filter((p) => {
        const matches = col.smartRules!.conditions.map((cond) => {
          const val = String(cond.value || '').toLowerCase();
          if (cond.field === 'ingredient') {
            return (
              p.scientificName.toLowerCase().includes(val) ||
              p.tradeNameEn.toLowerCase().includes(val) ||
              p.tradeNameAr.toLowerCase().includes(val)
            );
          }
          if (cond.field === 'dosage_form') {
            return (
              p.dosageFormEn.toLowerCase().includes(val) ||
              p.dosageFormAr.toLowerCase().includes(val)
            );
          }
          if (cond.field === 'therapeutic_use' || cond.field === 'product_type') {
            return (
              p.categoryEn.toLowerCase().includes(val) ||
              p.categoryAr.toLowerCase().includes(val)
            );
          }
          if (cond.field === 'status') {
            return p.status.toLowerCase() === val;
          }
          if (cond.field === 'name') {
            return (
              p.tradeNameEn.toLowerCase().includes(val) ||
              p.tradeNameAr.toLowerCase().includes(val)
            );
          }
          if (cond.field === 'priority_range' && Array.isArray(cond.value)) {
            const min = Number(cond.value[0]);
            const max = Number(cond.value[1]);
            return p.priority >= min && p.priority <= max;
          }
          return false;
        });
        return isOr ? matches.some(Boolean) : matches.every(Boolean);
      });

      // Preserve any custom ordering in col.items, or default to matching order
      const priorityMap = new Map(col.items.map((it) => [it.productId, it.priority]));
      return matchingProducts
        .map((p, idx) => ({
          ...p,
          collectionPriority: priorityMap.get(p.id) || idx + 1
        }))
        .sort((a, b) => a.collectionPriority - b.collectionPriority);
    }

    // Manual / Classification Collection
    return col.items
      .map((item) => {
        const p = productMap.get(item.productId);
        if (!p) return null;
        return {
          ...p,
          collectionPriority: item.priority
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.collectionPriority - b!.collectionPriority) as (Product & { collectionPriority: number })[];
  };

  // ---------------------------------------------------------------------------
  // Master Catalog Priority Operations (Global Sequence)
  // ---------------------------------------------------------------------------
  const pushSnapshot = (description: string) => {
    const snap: PriorityHistorySnapshot = {
      timestamp: new Date().toISOString(),
      sequence: products.map((p) => ({ id: p.id, priority: p.priority })),
      description
    };
    setHistoryStack((prev) => [snap, ...prev.slice(0, 20)]);
  };

  const reorderProduct = (fromIndex: number, toIndex: number) => {
    if (!hasPermission('priorities.reorder')) {
      alert('Access Denied: You do not have permission to reorder products.');
      return;
    }
    pushSnapshot(`Reorder from row ${fromIndex + 1} to ${toIndex + 1}`);
    const updated = [...products];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const renumbered = updated.map((item, idx) => ({
      ...item,
      priority: idx + 1,
      updatedAt: new Date().toISOString()
    }));

    setProducts(renumbered);
    logAuditEvent(
      'reorder',
      `Moved product "${moved.tradeNameEn}" to Priority #${toIndex + 1}`,
      `تم نقل الصنف "${moved.tradeNameAr}" إلى الأولوية رقم ${toIndex + 1}`,
      'product',
      moved.id,
      moved.id,
      moved.tradeNameEn,
      `#${fromIndex + 1}`,
      `#${toIndex + 1}`
    );
  };

  const assignPriority = (productId: string, newPriority: number) => {
    if (!hasPermission('priorities.edit')) {
      alert('Access Denied: You lack permission to edit product priority.');
      return;
    }
    const currentIdx = products.findIndex((p) => p.id === productId);
    if (currentIdx === -1) return;

    pushSnapshot(`Direct Priority Change for ${products[currentIdx].tradeNameEn} to #${newPriority}`);
    const updated = [...products];
    const [target] = updated.splice(currentIdx, 1);
    const targetIdx = Math.max(0, Math.min(updated.length, newPriority - 1));
    updated.splice(targetIdx, 0, target);

    const renumbered = updated.map((item, idx) => ({
      ...item,
      priority: idx + 1,
      updatedAt: new Date().toISOString()
    }));

    setProducts(renumbered);
    logAuditEvent(
      'update',
      `Assigned priority #${newPriority} to "${target.tradeNameEn}"`,
      `تم تعيين الأولوية رقم #${newPriority} للصنف "${target.tradeNameAr}"`,
      'product',
      target.id,
      target.id,
      target.tradeNameEn
    );
  };

  const moveProduct = (productId: string, direction: 'top' | 'up' | 'down' | 'bottom') => {
    if (!hasPermission('priorities.reorder')) return;
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return;

    let targetIdx = idx;
    if (direction === 'top') targetIdx = 0;
    else if (direction === 'bottom') targetIdx = products.length - 1;
    else if (direction === 'up') targetIdx = Math.max(0, idx - 1);
    else if (direction === 'down') targetIdx = Math.min(products.length - 1, idx + 1);

    if (targetIdx !== idx) {
      reorderProduct(idx, targetIdx);
    }
  };

  const autoRenumberAll = () => {
    if (!hasPermission('priorities.bulk_edit')) return;
    pushSnapshot('Auto Renumber All Products 1..N');
    const sorted = [...products].sort((a, b) => a.priority - b.priority);
    const renumbered = sorted.map((p, idx) => ({
      ...p,
      priority: idx + 1,
      updatedAt: new Date().toISOString()
    }));
    setProducts(renumbered);
    logAuditEvent(
      'bulk_update',
      `Sequentially renumbered all ${renumbered.length} products (1 to ${renumbered.length})`,
      `تمت إعادة الترقيم التسلسلي لكافة الأصناف (${renumbered.length} صنف)`,
      'product'
    );
  };

  const undoLastReorder = () => {
    if (historyStack.length === 0) return;
    const [lastSnap, ...rest] = historyStack;
    const seqMap = new Map(lastSnap.sequence.map((s) => [s.id, s.priority]));

    const restored = products
      .map((p) => ({
        ...p,
        priority: seqMap.get(p.id) || p.priority
      }))
      .sort((a, b) => a.priority - b.priority);

    setProducts(restored);
    setHistoryStack(rest);
    logAuditEvent(
      'reorder',
      `Rolled back priority sequence: ${lastSnap.description}`,
      `تم التراجع عن تعديل الترتيب: ${lastSnap.description}`,
      'product'
    );
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!hasPermission('products.create')) {
      alert('Access Denied: You lack permissions to create products.');
      return;
    }
    const newProduct: Product = {
      ...productData,
      id: `UMCO-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    const renumbered = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    logAuditEvent(
      'create',
      `Added new product: ${newProduct.tradeNameEn} (SKU: ${newProduct.sku})`,
      `تمت إضافة صنف جديد: ${newProduct.tradeNameAr} (${newProduct.sku})`,
      'product',
      newProduct.id,
      newProduct.id,
      newProduct.tradeNameEn
    );
  };

  const updateProduct = (updated: Product) => {
    if (!hasPermission('products.edit')) {
      alert('Access Denied: You lack permissions to edit products.');
      return;
    }
    const oldProduct = products.find((p) => p.id === updated.id);
    const stamped = { ...updated, updatedAt: new Date().toISOString() };
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? stamped : p)));
    logAuditEvent(
      'update',
      `Updated product specifications: ${updated.tradeNameEn}`,
      `تم تعديل مواصفات الصنف: ${updated.tradeNameAr}`,
      'product',
      updated.id,
      updated.id,
      updated.tradeNameEn,
      oldProduct?.status,
      updated.status
    );
  };

  const deleteProduct = (productId: string) => {
    if (!hasPermission('products.delete')) {
      alert('Access Denied: You lack permissions to delete products.');
      return;
    }
    const target = products.find((p) => p.id === productId);
    const filtered = products.filter((p) => p.id !== productId);
    const renumbered = filtered.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    logAuditEvent(
      'delete',
      `Deleted product: ${target?.tradeNameEn || productId}`,
      `تم حذف الصنف: ${target?.tradeNameAr || productId}`,
      'product',
      productId,
      productId,
      target?.tradeNameEn
    );
  };

  const duplicateProduct = (productId: string) => {
    if (!hasPermission('products.create')) return;
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const dup: Product = {
      ...target,
      id: `UMCO-${Date.now().toString().slice(-4)}`,
      sku: `${target.sku}-DUP`,
      tradeNameEn: `${target.tradeNameEn} (Copy)`,
      tradeNameAr: `${target.tradeNameAr} (نسخة)`,
      priority: target.priority + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...products];
    updated.splice(target.priority, 0, dup);
    const renumbered = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    logAuditEvent(
      'create',
      `Duplicated product ${target.tradeNameEn} as ${dup.tradeNameEn}`,
      `تم استنساخ الصنف ${target.tradeNameAr} كصنف جديد`,
      'product',
      dup.id,
      dup.id,
      dup.tradeNameEn
    );
  };

  // Bulk operations
  const bulkUpdateStatus = (status: string) => {
    if (selectedProductIds.length === 0 || !hasPermission('priorities.bulk_edit')) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (selectedProductIds.includes(p.id)) {
          return { ...p, status, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
    logAuditEvent(
      'bulk_update',
      `Bulk updated status to "${status}" for ${selectedProductIds.length} products`,
      `تم التحديث الجماعي للحالة إلى "${status}" لـ ${selectedProductIds.length} صنف`,
      'product'
    );
    setSelectedProductIds([]);
  };

  const bulkMoveToTop = () => {
    if (selectedProductIds.length === 0 || !hasPermission('priorities.reorder')) return;
    pushSnapshot(`Bulk Move ${selectedProductIds.length} products to top`);
    const selected = products.filter((p) => selectedProductIds.includes(p.id));
    const unselected = products.filter((p) => !selectedProductIds.includes(p.id));
    const combined = [...selected, ...unselected];
    const renumbered = combined.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    setSelectedProductIds([]);
  };

  const bulkAssignPriority = (startPriority: number) => {
    if (selectedProductIds.length === 0 || !hasPermission('priorities.bulk_edit')) return;
    pushSnapshot(`Bulk Assign Priority starting at #${startPriority}`);
    const selected = products.filter((p) => selectedProductIds.includes(p.id));
    const unselected = products.filter((p) => !selectedProductIds.includes(p.id));
    const insertPos = Math.max(0, Math.min(unselected.length, startPriority - 1));
    unselected.splice(insertPos, 0, ...selected);
    const renumbered = unselected.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    setSelectedProductIds([]);
  };

  const bulkDelete = () => {
    if (selectedProductIds.length === 0 || !hasPermission('products.delete')) return;
    const count = selectedProductIds.length;
    const remaining = products.filter((p) => !selectedProductIds.includes(p.id));
    const renumbered = remaining.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    setSelectedProductIds([]);
    logAuditEvent(
      'delete',
      `Bulk deleted ${count} products`,
      `تم الحذف الجماعي لـ ${count} أصناف`,
      'product'
    );
  };

  const applyImportData = (newItems: Product[], updatedItems: Product[]) => {
    if (!hasPermission('products.import')) return;
    const updatedMap = new Map(updatedItems.map((u) => [u.sku.toLowerCase(), u]));
    let merged = products.map((p) => {
      const match = updatedMap.get(p.sku.toLowerCase());
      return match ? { ...match, priority: p.priority, updatedAt: new Date().toISOString() } : p;
    });

    if (newItems.length > 0) {
      merged = [...merged, ...newItems];
    }

    const renumbered = merged.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProducts(renumbered);
    logAuditEvent(
      'import',
      `Imported batch: ${newItems.length} new records, ${updatedItems.length} updated records`,
      `تم استيراد ${newItems.length} صنف جديد وتحديث ${updatedItems.length} صنف`,
      'product'
    );
  };

  const updateStatusConfig = (newStatuses: StatusConfig[]) => {
    if (!hasPermission('settings.edit')) return;
    setStatuses(newStatuses);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (!hasPermission('settings.edit')) return;
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const toggleLanguage = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'ar' : 'en'
    }));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterCategory('ALL');
    setFilterPriorityRange([1, 1000]);
    setSortOption('priority_asc');
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered and Sorted Products Computation
  // ---------------------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTradeEn = p.tradeNameEn.toLowerCase().includes(q);
          const matchTradeAr = p.tradeNameAr.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchSci = p.scientificName.toLowerCase().includes(q);
          const matchInd = (p.indicationsEn + ' ' + p.indicationsAr).toLowerCase().includes(q);
          const matchCat = (p.categoryEn + ' ' + p.categoryAr).toLowerCase().includes(q);
          const matchDosage = (p.dosageFormEn + ' ' + p.dosageFormAr).toLowerCase().includes(q);
          if (!matchTradeEn && !matchTradeAr && !matchSku && !matchSci && !matchInd && !matchCat && !matchDosage) {
            return false;
          }
        }

        if (filterStatus !== 'ALL' && p.status !== filterStatus) {
          return false;
        }

        if (filterCategory !== 'ALL' && p.categoryEn !== filterCategory && p.categoryAr !== filterCategory) {
          return false;
        }

        if (p.priority < filterPriorityRange[0] || p.priority > filterPriorityRange[1]) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'priority_asc') return a.priority - b.priority;
        if (sortOption === 'priority_desc') return b.priority - a.priority;
        if (sortOption === 'name_asc') return a.tradeNameEn.localeCompare(b.tradeNameEn);
        if (sortOption === 'name_desc') return b.tradeNameEn.localeCompare(a.tradeNameEn);
        if (sortOption === 'updated_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
      });
  }, [products, searchQuery, filterStatus, filterCategory, filterPriorityRange, sortOption]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count += 1;
    if (filterStatus !== 'ALL') count += 1;
    if (filterCategory !== 'ALL') count += 1;
    if (filterPriorityRange[0] !== 1 || filterPriorityRange[1] !== 1000) count += 1;
    return count;
  }, [searchQuery, filterStatus, filterCategory, filterPriorityRange]);

  return (
    <ProductContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        products,
        categories: initialCategories,
        statuses,
        currentUser,
        users,
        roles,
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
        deleteHierarchicalCategory,
        linkProductClassification,
        collections,
        activeCollectionId,
        setActiveCollectionId,
        createCollection,
        updateCollection,
        deleteCollection,
        duplicateCollection,
        archiveCollection,
        addProductsToCollection,
        removeProductFromCollection,
        reorderCollectionProduct,
        assignCollectionPriority,
        moveCollectionProduct,
        autoRenumberCollection,
        getCollectionProducts,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        addUser,
        updateUser,
        toggleUserStatus,
        resetUserPassword,
        addRole,
        updateRole,
        switchUser,
        updateStatusConfig,
        updateSettings,
        toggleTheme,
        toggleLanguage,
        logAuditEvent
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
export default ProductContext;
