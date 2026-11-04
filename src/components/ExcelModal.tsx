import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import {
  exportProductsToExcel,
  exportProductsToCSV,
  parseAndValidateExcel,
  ImportValidationResult
} from '../utils/excelManager';
import { translations } from '../utils/translations';
import { Product } from '../types';

interface ExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelModal: React.FC<ExcelModalProps> = ({ isOpen, onClose }) => {
  const { products, settings, currentUser, applyImportData } = useProducts();
  const t = translations[settings.language];
  const isViewer = currentUser.role === 'viewer';

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [updateDuplicates, setUpdateDuplicates] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportProductsToExcel(products, 'UMCO_Product_Priority_Catalog');
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products, 'UMCO_Product_Priority_Catalog');
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    try {
      const result = await parseAndValidateExcel(file, products);
      setImportResult(result);
    } catch (err) {
      console.error('Import parse error:', err);
      alert('Could not read the spreadsheet file. Please verify format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult) return;

    const newItems = importResult.validProducts;
    const updatedItems = updateDuplicates ? importResult.duplicateProducts.map((d) => d.incoming) : [];

    applyImportData(newItems, updatedItems);
    alert(`Successfully imported ${newItems.length} new products and updated ${updatedItems.length} existing records.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Excel & Spreadsheet Management
              </h2>
              <span className="text-xs text-slate-500">Bi-directional XLSX / CSV Operations</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Export vs Import */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-ymco-primary text-ymco-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Export to Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab('import')}
            disabled={isViewer}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-ymco-primary text-ymco-primary'
                : isViewer
                ? 'border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Import Catalog
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Export the currently active sequence of <strong>{products.length}</strong> pharmaceutical products into fully formatted spreadsheet files. Suitable for procurement teams, clinical auditing, and ERP integrations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Excel Export Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-slate-900 dark:text-white text-sm mb-1">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <span>Excel Workbook (.xlsx)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Complete dataset with styled headers, custom column widths, dual-language names, dosages, and indications.
                    </p>
                  </div>
                  <button
                    onClick={handleExportExcel}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                    Download XLSX
                  </button>
                </div>

                {/* CSV Export Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-slate-900 dark:text-white text-sm mb-1">
                      <Download className="w-5 h-5 text-blue-600" />
                      <span>Standard CSV File (.csv)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lightweight UTF-8 encoded comma-separated values compatible with any database, script, or ERP system.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                    Download CSV
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Uploader Box */}
              {!importResult && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-ymco-primary dark:hover:border-ymco-primary rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {t.dropFileHere}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports .xlsx, .xls, and .csv files. Automatic duplicate SKU conflict detection.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              )}

              {/* Import Verification Breakdown */}
              {importResult && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      File: {fileName}
                    </span>
                    <button
                      onClick={() => setImportResult(null)}
                      className="text-ymco-primary hover:underline font-bold text-xs"
                    >
                      Upload Different File
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-xl font-black text-emerald-600 block">
                        {importResult.validProducts.length}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        {t.validRows}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-xl font-black text-amber-600 block">
                        {importResult.duplicateProducts.length}
                      </span>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        {t.duplicateRows}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <span className="text-xl font-black text-rose-600 block">
                        {importResult.invalidRows.length}
                      </span>
                      <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                        {t.invalidRows}
                      </span>
                    </div>
                  </div>

                  {/* Overwrite option */}
                  {importResult.duplicateProducts.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
                      <label className="flex items-start space-x-2 rtl:space-x-reverse cursor-pointer">
                        <input
                          type="checkbox"
                          checked={updateDuplicates}
                          onChange={(e) => setUpdateDuplicates(e.target.checked)}
                          className="rounded mt-0.5 border-slate-300 text-ymco-primary focus:ring-ymco-primary"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Update existing catalog records when duplicate SKUs are encountered (safely merges incoming updates).
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Preview table of incoming items */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-start text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase sticky top-0">
                        <tr>
                          <th className="p-2 text-start">SKU</th>
                          <th className="p-2 text-start">Product Name</th>
                          <th className="p-2 text-start">Category</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importResult.validProducts.slice(0, 10).map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-2 font-mono">{p.sku}</td>
                            <td className="p-2 font-bold">{p.tradeNameEn}</td>
                            <td className="p-2">{p.categoryEn}</td>
                            <td className="p-2 text-center text-emerald-600 font-bold">New</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Confirm CTA */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleConfirmImport}
                      disabled={importResult.validProducts.length === 0 && importResult.duplicateProducts.length === 0}
                      className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-lg shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                      <span>{t.confirmImport}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

