# YMCO Product Priority Manager | نظام إدارة أولويات وترتيب المنتجات الطبية

[![YMCO Pharma](https://img.shields.io/badge/YMCO-Pharma%20Enterprise-dc2626.svg)](https://en-dhiaa.surge.sh/#/ymco)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gray.svg)]()

A high-performance enterprise pharmaceutical product priority management web application developed for **YMCO (Yemen Modern Pharma Co.)**. It empowers product managers and regulatory teams to organize, sequence, prioritize, audit, and export 47+ genuine YMCO medical products.

---

## 🌟 Key Features

### 1. High-Precision Product Reordering
- **HTML5 Drag-and-Drop:** Intuitive row grabbing and real-time repositioning.
- **Inline Numeric Assignment:** Click any priority badge to assign an exact rank with instant conflict resolution.
- **Micro-Move Controls:** Move to Top (`⤊`), Move Up (`↑`), Move Down (`↓`), and Move to Bottom (`⤋`).
- **Sequential Auto-Renumbering:** Re-indexes all 47 products cleanly from 1 to N without gaps.
- **Multi-Level Undo/Restore:** Snapshot state history allowing instant rollback of priority changes.

### 2. Multi-Criteria Search & Filtering
- Instant multi-field search across English & Arabic trade names, SKU/Product IDs, therapeutic categories, composition, and clinical indications.
- Dynamic filtering by **Status**, **Therapeutic Category**, and **Priority Range**.
- Quick sorting by Priority (Ascending/Descending), Alphabetical (EN/AR), and Recently Updated.
- Interactive Dashboard KPI Cards with instant table filtering on click.

### 3. Corporate PDF Dossier & Catalog Generator
- Powered by `jsPDF` and `jspdf-autotable` (**zero** dependence on `window.print()` or screenshots).
- **Mode A (Priority Summary):** High-density tabular overview with priority ranks, product thumbnails, names, categories, and status indicators.
- **Mode B (Detailed Product Dossier):** Full clinical specification sheets with product images, composition, indications, dosage, storage, and timestamps.
- Repeating corporate header with authentic YMCO logo, reference ID, timestamps, and page numbers (`Page X of Y`).
- Custom export scopes: All Products, Filtered Results, Selected Items, or Specific Statuses.

### 4. Excel & CSV Data Management
- Bi-directional export to `.xlsx` and `.csv` formatted with timestamps.
- Import wizard with file drag-and-drop, field validation, duplicate SKU detection, and conflict preview before committing.

### 5. Role-Based Access Control (RBAC) & Audit Log
- Simulated RBAC roles: **Administrator** (Full CRUD, Settings, Status config), **Editor** (Priority reordering & editing), and **Viewer** (Read-only + Export).
- Immutable Chronological Audit Trail tracking all create, update, delete, reorder, and import events.

### 6. Bilingual & Theme Support
- 100% Bilingual Interface: **English (LTR)** & **العربية (RTL)** with fluid layout flipping.
- Theme switching: **Corporate Light Mode** & **Executive Dark Mode** with persistent `localStorage`.

---

## 📁 Project Architecture

```
YMCO Tasks/
├── public/
│   ├── images/
│   │   ├── logos/           # Authentic YMCO corporate emblems and logos
│   │   └── products/        # 47 genuine YMCO pharmaceutical product packages
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Corporate header with brand, language, theme, and session
│   │   ├── DashboardStats.tsx       # 6 interactive KPI cards
│   │   ├── Toolbar.tsx              # Search, filter pills, sorting, density, bulk actions
│   │   ├── ProductTable.tsx         # Drag-and-drop priority table with micro-controls
│   │   ├── ProductDetailModal.tsx   # Product clinical dossier with image zoom
│   │   ├── ProductFormModal.tsx     # Add / Edit product modal with image upload
│   │   ├── PdfExportModal.tsx       # Mode A/B PDF configuration and generator
│   │   ├── ExcelModal.tsx           # Excel/CSV import/export with duplicate SKU preview
│   │   ├── StatusManagerModal.tsx   # Custom status manager with color picker
│   │   ├── SettingsModal.tsx        # System branding and priority rules
│   │   ├── AuditHistoryModal.tsx    # Chronological activity log
│   │   └── UserRoleModal.tsx        # RBAC role switcher
│   ├── context/
│   │   └── ProductContext.tsx       # Comprehensive React Context state engine
│   ├── data/
│   │   ├── initialConfig.ts         # Initial statuses, categories, and settings
│   │   ├── productsData.json        # 47 extracted YMCO medical products
│   │   └── productsData.ts          # Strongly typed initial dataset
│   ├── types.ts                     # TypeScript data interfaces
│   ├── utils/
│   │   ├── excelManager.ts          # SheetJS import/export engine
│   │   ├── pdfGenerator.ts          # jsPDF corporate document generator
│   │   └── translations.ts          # English & Arabic localization dictionaries
│   ├── App.tsx                      # Root component
│   ├── index.css                    # Tailwind CSS configuration
│   └── main.tsx                     # Application entry point
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

### Production Build
```bash
npm run build
```

---

## 🌐 Production Deployment

- **Live URL:** [https://en-dhiaa.surge.sh/#/ymco](https://en-dhiaa.surge.sh/#/ymco)
- **GitHub Repository:** [https://github.com/En-Dhiaa/ymco-product-priority-manager](https://github.com/En-Dhiaa/ymco-product-priority-manager)

---

## 📄 License
Developed for YMCO (Yemen Modern Pharma Co.) by Eng. Dhiaa Al-Hmiri. All rights reserved.
