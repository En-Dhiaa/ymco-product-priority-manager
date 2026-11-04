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
import { ExternalLink, Sparkles } from 'lucide-react';
import { Product } from './types';

export const MainContent: React.FC = () => {
  const { settings, products } = useProducts();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <img src="./images/logos/ymco-transparent-logo.png" alt="YMCO" className="h-7 w-auto object-contain" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {isAr ? settings.companyNameAr : settings.companyNameEn}
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'نظام إدارة أولويات المنتجات الصيدلانية • إصدار 2026' : 'YMCO Product Priority Manager • Enterprise 2026'}
              </span>
            </div>
          </div>

          {/* Prominent Lead Developer Credit */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-ymco-primary" />
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

          <div className="text-[11px] text-slate-400">
            <span>ISO 9001 / GMP Compliant • Dual-Storage Engine</span>
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

