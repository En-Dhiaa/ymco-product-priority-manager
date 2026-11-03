export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
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
  notes: string;
  createdAt: string;
  updatedAt: string;
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
  userName: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'delete' | 'reorder' | 'bulk_update' | 'import' | 'status_change';
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
