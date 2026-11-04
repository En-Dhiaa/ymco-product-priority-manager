import { Product, ProductCategory } from '../types';
import productsJson from './productsData.json';

export const initialCategories: ProductCategory[] = [
  {
    id: 1,
    slug: 'dermatological-creams-ointments',
    name_ar: 'المراهم والكريمات الجلدية',
    name_en: 'Dermatological Creams & Ointments',
    description_ar: 'مراهم وكريمات جلدية علاجية متقدمة وفق أحدث معايير التصنيع الدوائي',
    description_en: 'Advanced therapeutic dermatological creams, ointments and gels',
    icon: 'shield-check',
    sort_order: 1
  },
  {
    id: 2,
    slug: 'skin-care-antiseptics',
    name_ar: 'العناية بالبشرة والمطهرات',
    name_en: 'Skin Care & Antiseptics',
    description_ar: 'مستحضرات تفتيح البشرة، المقشرات، ومطهرات حب الشباب والحماية الجلدية',
    description_en: 'Skin lightening, exfoliating, acne care, and dermatological protection',
    icon: 'sparkles',
    sort_order: 2
  },
  {
    id: 3,
    slug: 'solutions-drops-sprays',
    name_ar: 'المحاليل والقطرات والبخاخات',
    name_en: 'Solutions, Drops & Sprays',
    description_ar: 'قطرات الأذن، بخاخات وبخاخات الأنف المعقمة، ومحاليل العناية التنفسية',
    description_en: 'Sterile ear drops, nasal sprays, physiological solutions and respiratory care',
    icon: 'droplets',
    sort_order: 3
  },
  {
    id: 4,
    slug: 'feminine-care-antiseptics',
    name_ar: 'العناية النسائية والمطهرات',
    name_en: 'Feminine Care & Antiseptics',
    description_ar: 'غسول ومساحيق العناية النسائية والتطهير المتخصص بتركيبات ملطفة ومطهرة',
    description_en: 'Specialized feminine washes, cleansing powders, and antiseptic solutions',
    icon: 'heart',
    sort_order: 4
  },
  {
    id: 5,
    slug: 'specialized-products-antiseptics',
    name_ar: 'المستحضرات المتخصصة والمطهرات العامة',
    name_en: 'Specialized Products & Antiseptics',
    description_ar: 'المطهرات العامة الكبيرة، شامبوهات القمل والقشرة، ومستحضرات التعقيم الموسعة',
    description_en: 'Bulk antiseptic solutions, medicated shampoos, and comprehensive hygiene lines',
    icon: 'flask-conical',
    sort_order: 5
  }
];

export const initialProducts: Product[] = productsJson as Product[];
export default initialProducts;
