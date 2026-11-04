export type UserRole = 'admin' | 'editor' | 'viewer';

export type PermissionKey =
  // Products
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.export'
  | 'products.import'
  // Priorities
  | 'priorities.view'
  | 'priorities.edit'
  | 'priorities.reorder'
  | 'priorities.bulk_edit'
  // Classification
  | 'classification.view'
  | 'classification.create'
  | 'classification.edit'
  | 'classification.delete'
  // Collections
  | 'collections.view'
  | 'collections.create'
  | 'collections.edit'
  | 'collections.delete'
  | 'collections.manage_members'
  | 'collections.reorder'
  | 'collections.export'
  // Users
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.disable'
  | 'users.assign_roles'
  // Reports
  | 'reports.view'
  | 'reports.export_pdf'
  | 'reports.export_excel'
  // Settings
  | 'settings.view'
  | 'settings.edit'
  // Audit
  | 'audit.view'
  | 'audit.export';

export type RoleId = 'super_admin' | 'product_manager' | 'editor' | 'viewer' | string;

export interface Role {
  id: RoleId;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isSystemRole: boolean;
  permissions: PermissionKey[];
  badgeColor: string;
}

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  roleId?: RoleId;
  status?: 'active' | 'disabled';
  avatarUrl?: string;
  department?: string;
  customPermissions?: PermissionKey[];
  lastLogin?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
}

export interface ActiveIngredient {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  defaultStrength?: string;
  unit?: string; // mg, %, ml, g, mcg, IU
  casNumber?: string;
  isCombination?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredientLink {
  ingredientId: string;
  strength: string;
  unit: string;
  isPrimary?: boolean;
}

export interface TherapeuticCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  code?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DosageForm {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  routeEn?: string; // Topical, Oral, Ophthalmic, Otic, Nasal, Inhalation
  routeAr?: string;
  icon?: string;
  isCustom?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface HierarchicalCategory {
  id: string;
  parentId: string | null;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  children?: HierarchicalCategory[];
}

export type CollectionType = 'manual' | 'smart' | 'classification';
export type CollectionVisibility = 'public' | 'internal' | 'restricted';
export type CollectionStatus = 'active' | 'archived' | 'draft';

export interface SmartRuleCondition {
  id: string;
  field: 'ingredient' | 'therapeutic_use' | 'dosage_form' | 'product_type' | 'status' | 'name' | 'priority_range';
  operator: 'equals' | 'contains' | 'in_range' | 'is_one_of';
  value: string | number | [number, number] | string[];
}

export interface SmartCollectionRules {
  logicalOperator: 'AND' | 'OR';
  conditions: SmartRuleCondition[];
}

export interface CollectionItem {
  productId: string;
  priority: number; // Independent ranking inside this collection
  addedAt: string;
  notes?: string;
}

export interface Collection {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  color: string;
  icon: string;
  imageUrl?: string;
  manager: string;
  visibility: CollectionVisibility;
  type: CollectionType;
  status: CollectionStatus;
  items: CollectionItem[];
  smartRules?: SmartCollectionRules;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  priority: number;
  tradeNameEn: string;
  tradeNameAr: string;
  scientificName: string;
  categoryEn: string;
  categoryAr: string;
  dosageFormEn: string;
  dosageFormAr: string;
  concentration: string;
  packageSize: string;
  indicationsEn: string;
  indicationsAr: string;
  usageEn: string;
  usageAr: string;
  storageEn: string;
  storageAr: string;
  imageUrl: string;
  additionalImages?: string[];
  status: string;
  price?: number;
  priceFormatted?: string;
  priceRaw?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;

  // Advanced Classification & Collection links
  ingredientIds?: string[];
  productIngredients?: ProductIngredientLink[];
  therapeuticCategoryIds?: string[];
  dosageFormId?: string;
  hierarchicalCategoryId?: string;
  collectionIds?: string[];
}

export interface ProductCategory {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  icon: string;
  sort_order: number;
}

export interface StatusConfig {
  id: string;
  labelEn: string;
  labelAr: string;
  color: string; // hex
  badgeClass: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'reorder'
    | 'bulk_update'
    | 'import'
    | 'status_change'
    | 'login'
    | 'logout'
    | 'classification_change'
    | 'collection_change'
    | 'user_change'
    | 'permission_change';
  entityType?: 'product' | 'ingredient' | 'category' | 'collection' | 'user' | 'role';
  entityId?: string;
  productId?: string;
  productName: string;
  descriptionEn: string;
  descriptionAr: string;
  previousValue?: string;
  newValue?: string;
}

export interface AppSettings {
  companyNameEn: string;
  companyNameAr: string;
  appTitleEn: string;
  appTitleAr: string;
  logoType: 'emblem' | 'pill' | 'banner';
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  tableDensity: 'compact' | 'comfortable';
  pdfRefNumber: string;
  pdfPreparedBy: string;
  pdfFooterNoteEn: string;
  pdfFooterNoteAr: string;
  autoRenumberOnReorder: boolean;
  autoSave: boolean;
}

export interface PriorityHistorySnapshot {
  timestamp: string;
  sequence: { id: string; priority: number }[];
  description: string;
}

export type AppNavigationSection =
  | 'dashboard'
  | 'products'
  | 'classification'
  | 'collections'
  | 'reports'
  | 'users'
  | 'audit'
  | 'settings';
