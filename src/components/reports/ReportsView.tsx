import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { 
  FileText, FileDown, Layers, Table, Check, Download,
  Calendar, Eye, Sparkles, Filter, ShieldCheck, Printer
} from 'lucide-react';
import { generateYmcoPdf } from '../../utils/pdfGenerator';
import { exportProductsToExcel, exportProductsToCSV } from '../../utils/excelManager';

export const ReportsView: React.FC = () => {
  const { 
    products, 
    collections, 
    getCollectionProducts, 
    settings, 
    currentUser,
    logAuditEvent 
  } = useProducts();

  const isAr = settings.language === 'ar';

  const [pdfMode, setPdfMode] = useState<'summary' | 'detailed'>('summary');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [reportNote, setReportNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Handle Master PDF Export
  const handleExportMasterPdf = async () => {
    setIsExporting(true);
    try {
      await generateYmcoPdf({
        products,
        settings,
        mode: pdfMode,
        orientation: pdfOrientation,
        refNumber: `UMCO-CAT-${new Date().getFullYear()}`,
        preparedBy: currentUser?.name || 'UMCO Administration',
        scopeTitle: isAr 
          ? `كتالوج أولويات أصناف شركة الأدوية الحديثة 2026 (${pdfMode === 'summary' ? 'الملخص التنفيذي' : 'التفصيلي الشامل'})` 
          : `UMCO Master Pharmaceutical Priority Catalog 2026 (${pdfMode.toUpperCase()})`
      });
      logAuditEvent('bulk_update', 'Exported master priority catalog PDF', 'تصدير تقرير أولويات الكتالوج العام كملف PDF');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Collection PDF Export
  const handleExportCollectionPdf = async (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    setIsExporting(true);
    try {
      const colProducts = getCollectionProducts(col);
      await generateYmcoPdf({
        products: colProducts,
        settings,
        mode: pdfMode,
        orientation: pdfOrientation,
        refNumber: `COL-${col.id.toUpperCase()}`,
        preparedBy: col.manager || currentUser?.name || 'UMCO Priority Manager',
        scopeTitle: isAr ? `تقرير أولويات المجموعة: ${col.nameAr}` : `Collection Priority Report: ${col.nameEn}`
      });
      logAuditEvent('collection_change', `Exported PDF for collection "${col.nameEn}"`, `تصدير تقرير أولويات المجموعة "${col.nameAr}" كملف PDF`, 'collection', col.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = () => {
    exportProductsToExcel(products, `UMCO_Pharmaceutical_Catalog_2026`);
    logAuditEvent('bulk_update', 'Exported products catalog to Excel', 'تصدير كتالوج الأصناف إلى ملف Excel');
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    exportProductsToCSV(products, `UMCO_Products_2026.csv`);
    logAuditEvent('bulk_update', 'Exported products catalog to CSV', 'تصدير كتالوج الأصناف إلى ملف CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'مركز التقارير والتصدير المؤسسي' : 'Reports & Exports Hub'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAr 
                ? 'تصدير تقارير PDF احترافية مطبوعة للكتالوج العام أو المجموعات المستقلة وجداول Excel/CSV الرسمية' 
                : 'Generate print-ready executive PDFs for master priorities, collection sequences, and Excel/CSV spreadsheets'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Reporting Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Master Catalog Priority PDF Generator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <FileDown className="w-5 h-5 text-red-600" />
              <span>{isAr ? 'تقرير أولويات الكتالوج العام (PDF)' : 'Master Priority Catalog (PDF)'}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
              {products.length} {isAr ? 'صنف مسجل' : 'Products'}
            </span>
          </div>

          {/* Options */}
          <div className="space-y-4 text-xs">
            {/* Mode: Summary vs Detailed */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isAr ? 'نمط التقرير:' : 'Report Presentation Mode:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPdfMode('summary')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    pdfMode === 'summary'
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{isAr ? 'النمط أ: ملخص تنفيذي' : 'Mode A: Executive Summary'}</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {isAr ? 'جدول مضغوط، تسلسل الأولويات والأسعار' : 'Compact table with priorities, names, forms & prices'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfMode('detailed')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    pdfMode === 'detailed'
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{isAr ? 'النمط ب: تفصيلي دوائي' : 'Mode B: Full Formulary'}</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {isAr ? 'دواعي الاستعمال، التركيز، وشروط الحفظ' : 'Includes indications, package sizes, storage & notes'}
                  </div>
                </button>
              </div>
            </div>

            {/* Page Orientation */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isAr ? 'اتجاه الصفحة:' : 'Page Orientation:'}
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="orient"
                    checked={pdfOrientation === 'landscape'}
                    onChange={() => setPdfOrientation('landscape')}
                    className="text-red-600"
                  />
                  <span>{isAr ? 'أفقي (Landscape - مستحسن)' : 'Landscape (Recommended for wide tables)'}</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="orient"
                    checked={pdfOrientation === 'portrait'}
                    onChange={() => setPdfOrientation('portrait')}
                    className="text-red-600"
                  />
                  <span>{isAr ? 'عمودي (Portrait)' : 'Portrait'}</span>
                </label>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-3">
              <button
                disabled={isExporting}
                onClick={handleExportMasterPdf}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'إنشاء وتنزيل تقرير الكتالوج العام (PDF)' : 'Download Master Catalog PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Collection Specific Priority PDF Reports */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>{isAr ? 'تقارير أولويات المجموعات والحملات' : 'Collection Priority Reports'}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
              {collections.length} {isAr ? 'مجموعات' : 'Collections'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {isAr 
              ? 'تصدير تقرير أولويات فوري لأي مجموعة مستقلة مع حفظ الترتيب الخاص بها دون التأثير على الترتيب العام' 
              : 'Export dedicated priority reports for each decoupled collection preserving its independent ranks'}
          </p>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {collections.map(col => {
              const count = col.items?.length || 0;
              return (
                <div 
                  key={col.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: col.color || '#990000' }} 
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {isAr ? col.nameAr : col.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {count} {isAr ? 'أصناف مرتبة' : 'prioritized items'} • {col.type === 'smart' ? 'Smart Rule' : 'Manual'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExportCollectionPdf(col.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصدير PDF' : 'PDF'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 3: Spreadsheet Data Exports (Excel & CSV) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Table className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'تصدير الجداول الإلكترونية (Excel & CSV)' : 'Spreadsheet Exports (Excel & CSV)'}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              {isAr ? 'بيانات كاملة 2026' : 'Complete 2026 Dataset'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  {isAr ? 'مصنف إكسل رسمي (.xlsx)' : 'Microsoft Excel Workbook (.xlsx)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'يشمل كافة الحقول، الأسعار بالريال اليمني، التصنيفات، وترتيب الأولوية' : 'Full dataset with formulas, prices in YER, classifications and priorities'}
                </p>
              </div>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل Excel' : 'Export Excel'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  {isAr ? 'ملف نصي مفصول بفواصل (.csv)' : 'Comma Separated Values (.csv)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'مناسب للربط مع أنظمة ERP وقواعد البيانات وقراءة البيانات السريعة' : 'Optimized for ERP integration and automated data processing'}
                </p>
              </div>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
