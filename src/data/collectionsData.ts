import { Collection } from '../types';

export const initialCollections: Collection[] = [
  {
    id: 'col-1',
    nameEn: 'Priority Launch 2026',
    nameAr: 'حملة تدشين الأولويات لعام 2026',
    descriptionEn: 'Flagship pharmaceutical products scheduled for immediate market supply and priority sales campaign.',
    descriptionAr: 'المستحضرات الدوائية الاستراتيجية المقررة للتدشين الفوري والحملات التسويقية للأولويات.',
    color: '#dc2626', // UMCO red
    icon: 'flame',
    manager: 'Eng. Dhiaa Al-Himyari',
    visibility: 'public',
    type: 'manual',
    status: 'active',
    items: [
      { productId: 'UMCO-001', priority: 1, addedAt: '2026-01-10T08:00:00Z', notes: 'Core dermatology line' },
      { productId: 'UMCO-003', priority: 2, addedAt: '2026-01-10T08:00:00Z', notes: 'High demand antifungal' },
      { productId: 'UMCO-010', priority: 3, addedAt: '2026-01-10T08:00:00Z', notes: 'Steroid anti-inflammatory' },
      { productId: 'UMCO-032', priority: 4, addedAt: '2026-01-10T08:00:00Z', notes: 'Fast acting decongestant' },
      { productId: 'UMCO-041', priority: 5, addedAt: '2026-01-10T08:00:00Z', notes: 'Sterile ear drops' },
      { productId: 'UMCO-053', priority: 6, addedAt: '2026-01-10T08:00:00Z', notes: 'Hospital grade povidone' }
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'col-2',
    nameEn: 'Dermatological Fast-Movers',
    nameAr: 'أصناف الجلدية سريعة الحركة',
    descriptionEn: 'High-turnover creams, ointments, and soothing gels for pharmacies and clinics.',
    descriptionAr: 'المراهم والكريمات الجلدية الأكثر طلباً وتوزيعاً في الصيدليات والعيادات.',
    color: '#0284c7',
    icon: 'shield-check',
    manager: 'Dr. Abdullah Ishaq',
    visibility: 'internal',
    type: 'manual',
    status: 'active',
    items: [
      { productId: 'UMCO-002', priority: 1, addedAt: '2026-01-12T09:30:00Z' },
      { productId: 'UMCO-004', priority: 2, addedAt: '2026-01-12T09:30:00Z' },
      { productId: 'UMCO-005', priority: 3, addedAt: '2026-01-12T09:30:00Z' },
      { productId: 'UMCO-007', priority: 4, addedAt: '2026-01-12T09:30:00Z' },
      { productId: 'UMCO-012', priority: 5, addedAt: '2026-01-12T09:30:00Z' }
    ],
    createdAt: '2026-01-12T09:30:00Z',
    updatedAt: '2026-01-12T09:30:00Z'
  },
  {
    id: 'col-3',
    nameEn: 'All Topical Formulations (Smart)',
    nameAr: 'كافة المستحضرات الموضعية (مجموعة ذكية)',
    descriptionEn: 'Automatically matched products with dosage form: Topical Cream, Ointment, or Gel.',
    descriptionAr: 'تجميع ذكي تلقائي لكافة المنتجات ذات الأشكال الصيدلانية الموضعية (كريم، مرهم، جل).',
    color: '#8b5cf6',
    icon: 'sparkles',
    manager: 'Automated Rule Engine',
    visibility: 'public',
    type: 'smart',
    status: 'active',
    smartRules: {
      logicalOperator: 'OR',
      conditions: [
        {
          id: 'rule-1',
          field: 'dosage_form',
          operator: 'contains',
          value: 'كريم'
        },
        {
          id: 'rule-2',
          field: 'dosage_form',
          operator: 'contains',
          value: 'مرهم'
        },
        {
          id: 'rule-3',
          field: 'dosage_form',
          operator: 'contains',
          value: 'جل'
        }
      ]
    },
    items: [],
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z'
  },
  {
    id: 'col-4',
    nameEn: 'Hospital Antiseptics & Sprays (Smart)',
    nameAr: 'المطهرات وبخاخات المشافي (مجموعة ذكية)',
    descriptionEn: 'Active medical items classified under disinfectants, surgical washes, or sterile drops.',
    descriptionAr: 'تجميع تلقائي لكافة المحاليل المعقمة والقطرات والمطهرات الجراحية النشطة.',
    color: '#059669',
    icon: 'flask-conical',
    manager: 'Automated Rule Engine',
    visibility: 'internal',
    type: 'smart',
    status: 'active',
    smartRules: {
      logicalOperator: 'OR',
      conditions: [
        {
          id: 'rule-4',
          field: 'product_type',
          operator: 'contains',
          value: 'المحاليل والقطرات والبخاخات'
        },
        {
          id: 'rule-5',
          field: 'product_type',
          operator: 'contains',
          value: 'المستحضرات المتخصصة والمطهرات العامة'
        }
      ]
    },
    items: [],
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z'
  }
];
