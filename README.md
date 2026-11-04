# UMCO Product Priority Manager | نظام إدارة أولويات وترتيب المنتجات الطبية

[![Live Platform](https://img.shields.io/badge/Live%20Platform-ymco--priority.surge.sh-dc2626.svg)](https://ymco-priority.surge.sh)
[![Developer Portfolio](https://img.shields.io/badge/Developer-Eng.%20Dhiaa%20Al--Himyari-2563eb.svg)](https://en-dhiaa.surge.sh/)
[![UMCO 2026 Catalog](https://img.shields.io/badge/Catalog-59%20Genuine%202026%20Products-059669.svg)](https://ymco-priority.surge.sh)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

A high-performance enterprise pharmaceutical product priority management web platform engineered for **UMCO (Yemen Modern Pharma Co. / الشركة اليمنية لصناعة وتجارة الأدوية)**. It empowers corporate leadership, supply chain directors, and regulatory teams to organize, sequence, prioritize, audit, and export the official 2026 pharmaceutical catalog.

---

## 🌐 Production URLs
- **Independent UMCO Platform:** [https://ymco-priority.surge.sh](https://ymco-priority.surge.sh)
- **Lead Developer Portfolio (م. ضياء الحميري):** [https://en-dhiaa.surge.sh/](https://en-dhiaa.surge.sh/)
- **GitHub Repository:** [https://github.com/En-Dhiaa/ymco-product-priority-manager](https://github.com/En-Dhiaa/ymco-product-priority-manager)

---

## 🌟 Key Features & 2026 Upgrades

### 1. Authentic 2026 Word Catalog Integration (59 Products)
- Fully extracted and decrypted from the official company catalog (`قائمة الاصناف تسعيرات معدلة 2026.docx`).
- Complete dataset of **59 genuine pharmaceutical items** spanning:
  1. Topical Creams & Ointments (المراهم والكريمات والجل الموضعي)
  2. Skin Care, Lightening & Antiseptics (العناية بالبشرة والتبييض ومطهرات حب الشباب)
  3. Sterile Drops, Nasal/Ear Sprays & Solutions (المحاليل والقطرات الطبية وبخاخات الأنف والأذن)
  4. Feminine Care Washes & Powders (الغسول والمطهرات والمساحيق الأنثوية)
  5. Antiseptic Liters, Medicated Shampoos & Lotions (المعقمات الكبيرة والشامبو الطبي)
- Exact 2026 official approved pricing in Yemeni Rials (**YER**).
- Real medical photos extracted, cropped, and bound to their corresponding trade records.

### 2. Transparent UMCO Capsule Logo
- Authentic red pill logo extracted from the company document.
- Precision flood-fill transparency algorithm applied to remove outer background artifacts while retaining crisp interior typography and vibrant corporate red branding.

### 3. Re-Engineered Mobile Header UX (Uncrowded & Touch-Optimized)
- Clean, compact top bar on mobile (< 1024px) featuring:
  - Scaled UMCO transparent logo.
  - Quick language toggle (`EN` / `عربي`).
  - Quick theme toggle (Sun / Moon).
  - Direct developer portfolio shortcut button (`م. ضياء`).
  - Sleek collapsible hamburger trigger (`Menu`).
- **Mobile Action Sheet / Drawer:** Slides smoothly to provide immediate touch-friendly access to:
  - Developer Showcase Card with direct portfolio link.
  - User session profile and role switcher.
  - Quick PDF Export.
  - Excel/CSV Manager.
  - Status Configuration.
  - Audit Trail Log.
  - System Settings.

### 4. High-Precision Product Reordering
- **HTML5 Drag-and-Drop:** Intuitive row grabbing and real-time repositioning.
- **Inline Numeric Assignment:** Click any priority badge to assign an exact rank with instant conflict resolution.
- **Micro-Move Controls:** Move to Top (`⤊`), Move Up (`↑`), Move Down (`↓`), and Move to Bottom (`⤋`).
- **Sequential Auto-Renumbering:** Re-indexes all 59 products cleanly from 1 to N without gaps.
- **Multi-Level Undo/Restore:** Snapshot state history allowing instant rollback of priority changes.

### 5. Corporate PDF Dossier & Catalog Generator
- Powered by `jsPDF` and `jspdf-autotable` (**zero** dependence on `window.print()` or screenshots).
- **Mode A (Priority Summary):** High-density tabular overview with priority ranks, product thumbnails, names, categories, 2026 prices, and status indicators.
- **Mode B (Detailed Product Dossier):** Full clinical specification sheets with product images, composition, indications, dosage, storage, 2026 prices, and timestamps.
- Repeating corporate header with authentic UMCO logo, reference ID, timestamps, and page numbers (`Page X of Y`).

### 6. Excel & CSV Data Management
- Bi-directional export to `.xlsx` and `.csv` formatted with timestamps and 2026 pricing.
- Import wizard with file drag-and-drop, field validation, duplicate SKU detection, and conflict preview before committing.

### 7. Bilingual & Theme Persistence
- 100% Bilingual Interface: **English (LTR)** & **العربية (RTL)** with fluid layout flipping.
- Theme switching: **Corporate Light Mode** & **Executive Dark Mode** with persistent `localStorage`.

---

## 📁 Project Architecture

```
UMCO Tasks/
├── public/
│   ├── images/
│   │   ├── logos/           # Authentic transparent UMCO corporate pill logo
│   │   └── products/        # 59 genuine UMCO pharmaceutical product packages
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Responsive header with mobile drawer & dev credit
│   │   ├── DashboardStats.tsx       # 6 interactive KPI cards
│   │   ├── Toolbar.tsx              # Search, filter pills, sorting, density, bulk actions
│   │   ├── ProductTable.tsx         # Drag-and-drop priority table with 2026 pricing
│   │   ├── ProductDetailModal.tsx   # Product clinical dossier with image zoom & price
│   │   ├── ProductFormModal.tsx     # Add / Edit product modal with image upload
│   │   ├── PdfExportModal.tsx       # Mode A/B PDF configuration and generator
│   │   ├── ExcelModal.tsx           # Excel/CSV import/export with duplicate SKU preview
│   │   ├── StatusManagerModal.tsx   # Custom status manager with color picker
│   │   ├── SettingsModal.tsx        # System branding, priority rules & dev attribution
│   │   ├── AuditHistoryModal.tsx    # Chronological activity log
│   │   └── UserRoleModal.tsx        # RBAC role switcher
│   ├── context/
│   │   └── ProductContext.tsx       # Comprehensive React Context state engine
│   ├── data/
│   │   ├── initialConfig.ts         # Initial statuses, categories, and settings
│   │   ├── productsData.json        # 59 extracted 2026 UMCO medical products
│   │   └── productsData.ts          # Strongly typed initial dataset
│   ├── types.ts                     # TypeScript data interfaces with pricing
│   ├── utils/
│   │   ├── excelManager.ts          # SheetJS import/export engine
│   │   ├── pdfGenerator.ts          # jsPDF corporate document generator
│   │   └── translations.ts          # English & Arabic localization dictionaries
│   ├── App.tsx                      # Root component with footer dev badge
│   ├── index.css                    # Tailwind CSS configuration
│   └── main.tsx                     # Application entry point
├── scripts/
│   ├── parse_catalog.py             # Word document parser and extractor
│   └── build_final_dataset.py       # Dataset synthesizer and image binder
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/En-Dhiaa/ymco-product-priority-manager.git

# Navigate into the project folder
cd ymco-product-priority-manager

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build & Deployment
```bash
# Build production bundle
npm run build

# Deploy to independent Surge domain
npx surge dist ymco-priority.surge.sh
```

---

## 👨‍💻 Platform Architect & Lead Developer

- **Engineer:** Dhiaa Al-Himyari (المهندس ضياء الحميري)
- **Portfolio:** [https://en-dhiaa.surge.sh/](https://en-dhiaa.surge.sh/)
- **GitHub:** [@En-Dhiaa](https://github.com/En-Dhiaa)

---

## 📄 License
Developed for UMCO (Yemen Medical Company / الشركة اليمنية لصناعة وتجارة الأدوية) by Eng. Dhiaa Al-Himyari. All rights reserved.
