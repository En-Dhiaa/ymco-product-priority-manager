import React, { useState } from 'react';
import { X, FileText, Download, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { generateYmcoPdf } from '../utils/pdfGenerator';
import { translations } from '../utils/translations';
import { Product } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose }) => {
  const { products, filteredProducts, selectedProductIds, settings, statuses } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  const [mode, setMode] = useState<'summary' | 'detailed'>('summary');
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected' | 'status'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [refNumber, setRefNumber] = useState<string>(settings.pdfRefNumber || 'UMCO-PPL-2026-V1');
  const [preparedBy, setPreparedBy] = useState<string>(settings.pdfPreparedBy || 'Supply Chain Management');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Compute products to export based on selected scope
  let exportList: Product[] = [];
  let scopeLabel = '';

  if (scope === 'all') {
    exportList = [...products].sort((a, b) => a.priority - b.priority);
    scopeLabel = 'Complete Master Catalog';
  } else if (scope === 'filtered') {
    exportList = [...filteredProducts].sort((a, b) => a.priority - b.priority);
    scopeLabel = 'Active Search & Filter Selection';
  } else if (scope === 'selected') {
    exportList = products.filter((p) => selectedProductIds.includes(p.id)).sort((a, b) => a.priority - b.priority);
    scopeLabel = 'User Selected Products';
  } else if (scope === 'status') {
    exportList = products.filter((p) => p.status === selectedStatus).sort((a, b) => a.priority - b.priority);
    scopeLabel = `Status: ${selectedStatus}`;
  }

  const handleGenerate = async () => {
    if (exportList.length === 0) {
      alert('No products available in the chosen export scope.');
      return;
    }

    setIsGenerating(true);
    try {
      await generateYmcoPdf({
        products: exportList,
        settings,
        mode,
        orientation,
        refNumber,
        preparedBy,
        scopeTitle: scopeLabel
      });
      onClose();
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Please check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-ymco-50 dark:bg-ymco-950/50 text-ymco-primary border border-ymco-200 dark:border-ymco-800">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.pdfExportTitle}
              </h2>
              <span className="text-xs text-slate-500">Corporate Dedicated PDF Engine</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Document Export Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('summary')}
                className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                  mode === 'summary'
                    ? 'border-ymco-primary bg-ymco-50/50 dark:bg-ymco-950/30 ring-2 ring-ymco-primary/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                  Mode A: Priority Summary
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Compact corporate table displaying priorities, images, dual-language names, status pills, and SKUs.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('detailed')}
                className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                  mode === 'detailed'
                    ? 'border-ymco-primary bg-ymco-50/50 dark:bg-ymco-950/30 ring-2 ring-ymco-primary/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                  Mode B: Detailed Product Dossier
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  In-depth clinical report including active composition, therapeutic indications, administration, and notes.
                </div>
              </button>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Export Scope ({exportList.length} products selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  scope === 'all'
                    ? 'border-ymco-primary bg-ymco-primary text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                All ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  scope === 'filtered'
                    ? 'border-ymco-primary bg-ymco-primary text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Filtered ({filteredProducts.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('selected')}
                disabled={selectedProductIds.length === 0}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  scope === 'selected'
                    ? 'border-ymco-primary bg-ymco-primary text-white font-bold'
                    : selectedProductIds.length === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Selected ({selectedProductIds.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('status')}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  scope === 'status'
                    ? 'border-ymco-primary bg-ymco-primary text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Status
              </button>

            </div>

            {/* Status dropdown if status scope is picked */}
            {scope === 'status' && (
              <div className="mt-2.5">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.labelAr : s.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Page Layout & Orientation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Page Orientation (A4 Format)
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  orientation === 'portrait'
                    ? 'border-ymco-primary bg-ymco-50 dark:bg-ymco-950/40 text-ymco-primary font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Portrait (A4 Vertical)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
                  orientation === 'landscape'
                    ? 'border-ymco-primary bg-ymco-50 dark:bg-ymco-950/40 text-ymco-primary font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Landscape (A4 Horizontal)
              </button>
            </div>
          </div>

          {/* Reference & Prepared By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Reference Number
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. UMCO-PPL-2026-V1"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ymco-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Prepared By Department / Author
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="e.g. Quality Assurance & Production"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ymco-primary"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Generating {exportList.length} products with repeating corporate headers
          </div>

          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || exportList.length === 0}
              className="inline-flex items-center px-5 py-2 text-xs sm:text-sm font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-lg shadow-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                  <span>{t.generatingPdf}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{t.downloadPdf}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

