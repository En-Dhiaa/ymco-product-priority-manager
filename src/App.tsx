import React, { useState } from 'react';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { Toolbar } from './components/Toolbar';
import { ProductTable } from './components/ProductTable';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { PdfExportModal } from './components/PdfExportModal';
import { ExcelModal } from './components/ExcelModal';
import { StatusManagerModal } from './components/StatusManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { UserRoleModal } from './components/UserRoleModal';
import { ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from './utils/translations';
import { Product } from './types';

export const MainContent: React.FC = () => {
  const { settings, products, lastSavedAt } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  // Modal States
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        onOpenPdf={() => setIsPdfModalOpen(true)}
        onOpenExcel={() => setIsExcelModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenStatusManager={() => setIsStatusModalOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Statistics Bar */}
        <DashboardStats />

        {/* Search, Filters, and Bulk Actions Toolbar */}
        <Toolbar
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenPdf={() => setIsPdfModalOpen(true)}
        />

        {/* Central Product Priority Management Table */}
        <ProductTable
          onOpenDetailModal={(product) => setDetailProduct(product)}
          onOpenEditModal={(product) => setEditingProduct(product)}
        />

      </main>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 transition-colors text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start">
            
            {/* Brand Section */}
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <img src="./images/logos/ymco-transparent-logo.png" alt="UMCO" className="h-7 w-auto object-contain" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {isAr ? settings.companyNameAr : settings.companyNameEn}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'نظام إدارة أولويات وترتيب المنتجات الطبية • إصدار 2026' : 'UMCO Product Priority Manager • Official Catalog'}
                </span>
              </div>
            </div>

            {/* Badges: Enterprise 2026 & Persistent Auto-Save (Moved from Header as requested) */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Enterprise 2026 Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-ymco-50 text-ymco-700 border border-ymco-200 dark:bg-ymco-950/40 dark:text-ymco-300 dark:border-ymco-800 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-ymco-600" />
                Enterprise 2026
              </span>

              {/* Changes Saved Persistently Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-emerald-500" />
                <span>{t.savedNotification}</span>
                {lastSavedAt && (
                  <span className="ml-1.5 rtl:mr-1.5 text-[10px] opacity-75">
                    ({lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Lead Developer Credit */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">
                {isAr ? 'هندسة وتطوير المنصة:' : 'Platform Architect:'}
              </span>
              <a
                href="https://en-dhiaa.surge.sh/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-ymco-primary hover:text-ymco-dark hover:underline inline-flex items-center space-x-1 rtl:space-x-reverse"
              >
                <span>{isAr ? 'م. ضياء الحميري' : 'Eng. Dhiaa Al-Himyari'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>ISO 9001 / GMP Compliant • Dual-Storage Engine</span>
            <span>All rights reserved © 2026 UMCO (Yemen Medical Company / الشركة اليمنية لصناعة وتجارة الأدوية)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(p) => setEditingProduct(p)}
      />

      <ProductFormModal
        isOpen={isAddModalOpen || Boolean(editingProduct)}
        productToEdit={editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      <StatusManagerModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <AuditHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <UserRoleModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProductProvider>
      <MainContent />
    </ProductProvider>
  );
};

export default App;

