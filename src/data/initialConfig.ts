import { StatusConfig, User, AppSettings, Role, PermissionKey } from '../types';

export const ALL_PERMISSIONS: {
  key: PermissionKey;
  category: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
}[] = [
  // Products
  { key: 'products.view', category: 'PRODUCTS', labelEn: 'View Products', labelAr: 'عرض المنتجات', descriptionEn: 'Browse products catalog', descriptionAr: 'استعراض بيانات الأصناف' },
  { key: 'products.create', category: 'PRODUCTS', labelEn: 'Create Products', labelAr: 'إضافة أصناف جديدة', descriptionEn: 'Add new pharmaceutical products', descriptionAr: 'إنشاء أصناف جديدة' },
  { key: 'products.edit', category: 'PRODUCTS', labelEn: 'Edit Products', labelAr: 'تعديل بيانات المنتجات', descriptionEn: 'Modify clinical and commercial fields', descriptionAr: 'تعديل المواصفات' },
  { key: 'products.delete', category: 'PRODUCTS', labelEn: 'Delete Products', labelAr: 'حذف المنتجات', descriptionEn: 'Remove items permanently', descriptionAr: 'حذف الأصناف' },
  { key: 'products.export', category: 'PRODUCTS', labelEn: 'Export Products', labelAr: 'تصدير المنتجات', descriptionEn: 'Export catalog to file formats', descriptionAr: 'تصدير الملفات' },
  { key: 'products.import', category: 'PRODUCTS', labelEn: 'Import Products', labelAr: 'استيراد دفعات المنتجات', descriptionEn: 'Batch import via Excel/CSV', descriptionAr: 'استيراد من إكسل' },

  // Priorities
  { key: 'priorities.view', category: 'PRIORITIES', labelEn: 'View Priorities', labelAr: 'عرض أرقام الأولوية', descriptionEn: 'See current priority ranks', descriptionAr: 'معاينة تسلسل الأولويات' },
  { key: 'priorities.edit', category: 'PRIORITIES', labelEn: 'Edit Priority Number', labelAr: 'تعديل رقم الأولوية', descriptionEn: 'Change rank of individual product', descriptionAr: 'تغيير أسبقية الصنف' },
  { key: 'priorities.reorder', category: 'PRIORITIES', labelEn: 'Reorder & Move', labelAr: 'إعادة الترتيب والسحب', descriptionEn: 'Drag-and-drop and micro move actions', descriptionAr: 'السحب والتحريك' },
  { key: 'priorities.bulk_edit', category: 'PRIORITIES', labelEn: 'Bulk Priority & Renumber', labelAr: 'إعادة الترقيم التلقائي', descriptionEn: 'Renumber 1..N and bulk adjustments', descriptionAr: 'ترقيم تسلسلي كامل' },

  // Classification
  { key: 'classification.view', category: 'CLASSIFICATION', labelEn: 'View Classifications', labelAr: 'عرض التصنيفات', descriptionEn: 'Access ingredients, therapeutic and tree', descriptionAr: 'استعراض المواد والتصنيفات' },
  { key: 'classification.create', category: 'CLASSIFICATION', labelEn: 'Create Classification', labelAr: 'إضافة تصنيفات جديدة', descriptionEn: 'Create ingredients, forms, categories', descriptionAr: 'إضافة مواد وأشكال وأقسام' },
  { key: 'classification.edit', category: 'CLASSIFICATION', labelEn: 'Edit Classification', labelAr: 'تعديل التصنيفات', descriptionEn: 'Modify classification nodes and properties', descriptionAr: 'تحديث بيانات التصنيف' },
  { key: 'classification.delete', category: 'CLASSIFICATION', labelEn: 'Delete Classification', labelAr: 'حذف التصنيفات', descriptionEn: 'Remove unused classification entries', descriptionAr: 'حذف التصنيفات' },

  // Collections
  { key: 'collections.view', category: 'COLLECTIONS', labelEn: 'View Collections', labelAr: 'عرض المجموعات', descriptionEn: 'Browse manual and smart collections', descriptionAr: 'استعراض المجموعات' },
  { key: 'collections.create', category: 'COLLECTIONS', labelEn: 'Create Collections', labelAr: 'إنشاء مجموعات جديدة', descriptionEn: 'Create manual and smart rule collections', descriptionAr: 'إنشاء مجموعات ذكية ويدوية' },
  { key: 'collections.edit', category: 'COLLECTIONS', labelEn: 'Edit Collections', labelAr: 'تعديل المجموعات', descriptionEn: 'Edit metadata, color, rules', descriptionAr: 'تعديل قواعد المجموعات' },
  { key: 'collections.delete', category: 'COLLECTIONS', labelEn: 'Delete Collections', labelAr: 'حذف المجموعات', descriptionEn: 'Delete custom collections', descriptionAr: 'حذف المجموعات' },
  { key: 'collections.manage_members', category: 'COLLECTIONS', labelEn: 'Manage Members', labelAr: 'إضافة وإزالة الأصناف', descriptionEn: 'Add or remove products from collection', descriptionAr: 'إدارة أعضاء المجموعة' },
  { key: 'collections.reorder', category: 'COLLECTIONS', labelEn: 'Reorder Collection Priority', labelAr: 'ترتيب أولوية المجموعة', descriptionEn: 'Independent ordering within collection', descriptionAr: 'ترتيب أسبقية المجموعة' },
  { key: 'collections.export', category: 'COLLECTIONS', labelEn: 'Export Collection PDF', labelAr: 'تصدير تقرير المجموعة', descriptionEn: 'Generate collection specific report', descriptionAr: 'تصدير PDF للمجموعة' },

  // Users
  { key: 'users.view', category: 'USERS', labelEn: 'View Users', labelAr: 'عرض المستخدمين', descriptionEn: 'View user accounts list', descriptionAr: 'استعراض الحسابات' },
  { key: 'users.create', category: 'USERS', labelEn: 'Create Users', labelAr: 'إنشاء مستخدم جديد', descriptionEn: 'Provision new staff accounts', descriptionAr: 'إنشاء حسابات جديدة' },
  { key: 'users.edit', category: 'USERS', labelEn: 'Edit Users', labelAr: 'تعديل بيانات المستخدم', descriptionEn: 'Modify user profiles and settings', descriptionAr: 'تعديل بيانات الحساب' },
  { key: 'users.disable', category: 'USERS', labelEn: 'Disable / Activate Users', labelAr: 'تعطيل وتفعيل الحسابات', descriptionEn: 'Suspend or restore account access', descriptionAr: 'إيقاف وتفعيل الحسابات' },
  { key: 'users.assign_roles', category: 'USERS', labelEn: 'Assign Roles & Permissions', labelAr: 'تعيين الصلاحيات والأدوار', descriptionEn: 'Grant or revoke access permissions', descriptionAr: 'إسناد مصفوفة الصلاحيات' },

  // Reports
  { key: 'reports.view', category: 'REPORTS', labelEn: 'View Reports', labelAr: 'عرض التقارير', descriptionEn: 'Access report generation tools', descriptionAr: 'استعراض شاشات التقارير' },
  { key: 'reports.export_pdf', category: 'REPORTS', labelEn: 'Generate PDF Reports', labelAr: 'توليد ملفات PDF', descriptionEn: 'Mode A and Mode B custom PDF reports', descriptionAr: 'طباعة وتصدير PDF' },
  { key: 'reports.export_excel', category: 'REPORTS', labelEn: 'Generate Excel Sheets', labelAr: 'توليد جداول Excel', descriptionEn: 'Download structured xlsx files', descriptionAr: 'تصدير إكسل' },

  // Settings
  { key: 'settings.view', category: 'SETTINGS', labelEn: 'View Settings', labelAr: 'عرض الإعدادات', descriptionEn: 'View app configuration', descriptionAr: 'استعراض الإعدادات' },
  { key: 'settings.edit', category: 'SETTINGS', labelEn: 'Edit Settings', labelAr: 'تعديل الإعدادات', descriptionEn: 'Change branding, defaults, metadata', descriptionAr: 'تعديل إعدادات المنصة' },

  // Audit
  { key: 'audit.view', category: 'AUDIT', labelEn: 'View Audit Logs', labelAr: 'عرض سجل التدقيق', descriptionEn: 'Inspect chronological system events', descriptionAr: 'معاينة سجل العمليات' },
  { key: 'audit.export', category: 'AUDIT', labelEn: 'Export Audit Logs', labelAr: 'تصدير سجل التدقيق', descriptionEn: 'Download historical activity records', descriptionAr: 'تصدير سجل الأنشطة' }
];

export const initialRoles: Role[] = [
  {
    id: 'super_admin',
    nameEn: 'Super Administrator',
    nameAr: 'المدير العام للنظام (صلاحيات مطلقة)',
    descriptionEn: 'Full uncontrolled access to all clinical, priority, classification, collection, and user administration features.',
    descriptionAr: 'تحكم كامل وشامل في كافة وظائف المنتجات، التصنيفات، المجموعات، وإدارة المستخدمين والمصفوفة.',
    isSystemRole: true,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    permissions: ALL_PERMISSIONS.map((p) => p.key)
  },
  {
    id: 'product_manager',
    nameEn: 'Product & Catalog Manager',
    nameAr: 'مدير المنتجات والأولويات',
    descriptionEn: 'Full management of products, priorities, classifications, collections, and reports without user administration.',
    descriptionAr: 'إدارة كاملة للأصناف والأولويات والتصنيفات والمجموعات وإصدار التقارير بدون صلاحية إدارة المستخدمين.',
    isSystemRole: true,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    permissions: ALL_PERMISSIONS.filter((p) => !p.key.startsWith('users.') && p.key !== 'settings.edit').map((p) => p.key)
  },
  {
    id: 'editor',
    nameEn: 'Priority & Catalog Editor',
    nameAr: 'محرر ومسؤول ترتيب',
    descriptionEn: 'Can edit product details, reorder priorities, manage collection members, and export reports.',
    descriptionAr: 'صلاحيات تعديل بيانات الأصناف، سحب وإعادة ترتيب الأولويات، وإدارة أعضاء المجموعات.',
    isSystemRole: true,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    permissions: [
      'products.view', 'products.create', 'products.edit', 'products.export',
      'priorities.view', 'priorities.edit', 'priorities.reorder',
      'classification.view',
      'collections.view', 'collections.manage_members', 'collections.reorder', 'collections.export',
      'reports.view', 'reports.export_pdf', 'reports.export_excel'
    ]
  },
  {
    id: 'viewer',
    nameEn: 'Compliance & Clinical Viewer',
    nameAr: 'مشاهد ومدقق جودة',
    descriptionEn: 'Read-only access across catalog, classification, collections, and reports.',
    descriptionAr: 'صلاحية قراءة واطلاع وتدقيق فقط بدون إمكانية التعديل أو إعادة الترتيب.',
    isSystemRole: true,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    permissions: [
      'products.view', 'priorities.view', 'classification.view', 'collections.view', 'reports.view'
    ]
  }
];

export const initialStatuses: StatusConfig[] = [
  {
    id: 'Active',
    labelEn: 'Active',
    labelAr: 'نشط / متوفر',
    color: '#16a34a', // green-600
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    isActive: true
  },
  {
    id: 'Under Development',
    labelEn: 'Under Development',
    labelAr: 'قيد التطوير والإنتاج',
    color: '#2563eb', // blue-600
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    isActive: true
  },
  {
    id: 'Suspended',
    labelEn: 'Suspended',
    labelAr: 'معلّق مؤقتاً',
    color: '#dc2626', // red-600
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    isActive: true
  },
  {
    id: 'Pending Approval',
    labelEn: 'Pending Approval',
    labelAr: 'بانتظار الاعتماد',
    color: '#ea580c', // orange-600
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    isActive: true
  },
  {
    id: 'Completed',
    labelEn: 'Completed',
    labelAr: 'مكتمل الإنتاج',
    color: '#0d9488', // teal-600
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    isActive: true
  },
  {
    id: 'Under Review',
    labelEn: 'Under Review',
    labelAr: 'قيد المراجعة الفنية',
    color: '#9333ea', // purple-600
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    isActive: true
  },
  {
    id: 'Discontinued',
    labelEn: 'Discontinued',
    labelAr: 'متوقف نهائياً',
    color: '#64748b', // slate-500
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    isActive: true
  },
  {
    id: 'On Hold',
    labelEn: 'On Hold',
    labelAr: 'موقوف احترازياً',
    color: '#d97706', // amber-600
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
    isActive: true
  },
  {
    id: 'Approved',
    labelEn: 'Approved',
    labelAr: 'معتمد رسمياً',
    color: '#059669', // emerald-600
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    isActive: true
  }
];

export const initialUsers: User[] = [
  {
    id: 'u-1',
    name: 'Eng. Dhiaa Al-Himyari',
    nameAr: 'م. ضياء الحميري',
    email: 'dhiaa.org@gmail.com',
    role: 'admin',
    roleId: 'super_admin',
    status: 'active',
    department: 'Software Architecture & Lead Engineering',
    avatarUrl: './images/logos/ymco-transparent-logo.png',
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-11-04T10:00:00Z'
  },
  {
    id: 'u-2',
    name: 'Dr. Abdullah Ishaq',
    nameAr: 'د. عبدالله إسحاق',
    email: 'dr.abdullah@umcopharma.com',
    role: 'admin',
    roleId: 'super_admin',
    status: 'active',
    department: 'General Management & Quality Direction',
    avatarUrl: './images/logos/ymco-transparent-logo.png',
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-11-04T09:15:00Z'
  },
  {
    id: 'u-3',
    name: 'Sami Al-Hamadani',
    nameAr: 'أ. سامي الهمداني',
    email: 'sami.manager@umcopharma.com',
    role: 'admin',
    roleId: 'product_manager',
    status: 'active',
    department: 'Supply Chain & Product Management',
    avatarUrl: './images/logos/ymco-transparent-logo.png',
    createdAt: '2026-01-05T00:00:00Z',
    lastLogin: '2026-11-03T16:20:00Z'
  },
  {
    id: 'u-4',
    name: 'Rasha Al-Kholani',
    nameAr: 'د. رشا الخولاني',
    email: 'rasha.editor@umcopharma.com',
    role: 'editor',
    roleId: 'editor',
    status: 'active',
    department: 'Regulatory Affairs & Catalog Operations',
    avatarUrl: './images/logos/ymco-transparent-logo.png',
    createdAt: '2026-01-10T00:00:00Z',
    lastLogin: '2026-11-02T11:45:00Z'
  },
  {
    id: 'u-5',
    name: 'Quality Inspector',
    nameAr: 'مدقق الجودة والامتثال الدوائي',
    email: 'quality@umcopharma.com',
    role: 'viewer',
    roleId: 'viewer',
    status: 'active',
    department: 'GMP & Clinical Compliance Audit',
    avatarUrl: './images/logos/ymco-transparent-logo.png',
    createdAt: '2026-01-15T00:00:00Z',
    lastLogin: '2026-10-30T14:10:00Z'
  }
];

export const defaultSettings: AppSettings = {
  companyNameEn: 'UMCO Pharmaceutical Industries',
  companyNameAr: 'الشركة اليمنية لصناعة وتجارة الأدوية والمستلزمات الطبية (يمكو)',
  appTitleEn: 'UMCO Product Priority Manager',
  appTitleAr: 'نظام إدارة أولويات وترتيب المنتجات الطبية',
  logoType: 'emblem',
  language: 'en',
  theme: 'light',
  tableDensity: 'compact',
  pdfRefNumber: 'UMCO-PPL-2026-V1',
  pdfPreparedBy: 'Supply Chain & Product Management Dept',
  pdfFooterNoteEn: 'Confidential & Proprietary — Yemen Medical Company (UMCO). Generated by UMCO Product Priority Manager.',
  pdfFooterNoteAr: 'وثيقة رسمية معتمدة — الشركة اليمنية لصناعة وتجارة الأدوية والمستلزمات الطبية (يمكو). للاستخدام الداخلي فقط.',
  autoRenumberOnReorder: true,
  autoSave: true
};
