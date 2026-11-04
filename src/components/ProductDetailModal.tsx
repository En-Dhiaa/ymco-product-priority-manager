import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Hash,
  Tag,
  FileText,
  ShieldCheck,
  Package,
  Layers,
  Save,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit
}) => {
  const { settings, statuses, currentUser, updateProduct } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isViewer = currentUser.role === 'viewer';

  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(product?.imageUrl || '');
  const [editableNotes, setEditableNotes] = useState<string>(product?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  if (!product) return null;

  const statusCfg = statuses.find((s) => s.id === product.status) || {
    labelEn: product.status,
    labelAr: product.status,
    color: '#64748b',
    badgeClass: 'bg-slate-100 text-slate-700'
  };

  const handleSaveNotes = () => {
    updateProduct({ ...product, notes: editableNotes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const imagesList = [
    product.imageUrl || './images/logos/ymco-pill-logo.png',
    './images/logos/ymco-emblem.jpg',
    './images/logos/ymco-banner-logo.webp'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex items-center justify-center px-3 py-1 bg-ymco-primary text-white rounded-lg font-black text-sm shadow-xs">
              #{product.priority}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {isAr ? product.tradeNameAr : product.tradeNameEn}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                SKU: {product.sku}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {!isViewer && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {t.editProduct}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Product Image & Gallery with Zoom */}
            <div className="md:col-span-5 flex flex-col items-center">
              
              {/* Main Image Box */}
              <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4 overflow-hidden group">
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={activeImage || product.imageUrl || './images/logos/ymco-pill-logo.png'}
                    alt={product.tradeNameEn}
                    className="max-w-full max-h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './images/logos/ymco-pill-logo.png';
                    }}
                  />
                </div>

                {/* Floating Zoom Controls */}
                <div className="absolute bottom-3 right-3 rtl:left-3 rtl:right-auto flex items-center space-x-1 rtl:space-x-reverse bg-white/90 dark:bg-slate-900/90 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-md">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                    title="Zoom Out"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-ymco-primary"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold px-1 text-slate-500">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    title="Zoom In"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-ymco-primary"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    title="Reset Zoom"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-ymco-primary"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
                {imagesList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImage(img);
                      setZoomLevel(1);
                    }}
                    className={`w-14 h-14 rounded-lg border-2 p-1 bg-white dark:bg-slate-800 transition-all ${
                      activeImage === img ? 'border-ymco-primary scale-105' : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* Status Badge below image */}
              <div className="mt-4 w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">{t.colStatus}:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                  <span className="w-2 h-2 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0" style={{ backgroundColor: statusCfg.color }} />
                  {isAr ? statusCfg.labelAr : statusCfg.labelEn}
                </span>
              </div>

            </div>

            {/* Right Column: Complete Specifications */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Names Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.englishName}</span>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {product.tradeNameEn}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.arabicName}</span>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {product.tradeNameAr}
                  </div>
                </div>
                {product.scientificName && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.scientificName}</span>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono">
                      {product.scientificName}
                    </div>
                  </div>
                )}
              </div>

              {/* Pharmaceutical Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-medium mb-1">{t.category}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? product.categoryAr : product.categoryEn}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-medium mb-1">{t.dosageForm}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {product.dosageFormEn || product.concentration || 'Standard'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block font-medium mb-1">{t.packageSize}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {product.packageSize || 'Hospital Pack'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-300 block font-bold mb-1">
                    {isAr ? 'السعر المعتمد (2026)' : 'Approved Price (2026)'}
                  </span>
                  <span className="font-black text-emerald-800 dark:text-emerald-200 text-sm">
                    {product.priceFormatted || 'حسب التسعيرة الرسمية'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 col-span-2">
                  <span className="text-slate-400 block font-medium mb-1">{t.colPriority}</span>
                  <span className="font-black text-ymco-primary text-sm">
                    #{product.priority} in Sequence
                  </span>
                </div>
              </div>

              {/* Clinical Indications */}
              {(product.indicationsEn || product.indicationsAr) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.indications}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isAr ? (product.indicationsAr || product.indicationsEn) : (product.indicationsEn || product.indicationsAr)}
                  </p>
                </div>
              )}

              {/* Usage & Administration */}
              {(product.usageEn || product.usageAr) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.usageInstructions}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isAr ? (product.usageAr || product.usageEn) : (product.usageEn || product.usageAr)}
                  </p>
                </div>
              )}

              {/* Storage Conditions */}
              {(product.storageEn || product.storageAr) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.storageConditions}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isAr ? (product.storageAr || product.storageEn) : (product.storageEn || product.storageAr)}
                  </p>
                </div>
              )}

              {/* Editable Notes Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.internalNotes}
                  </span>
                  {!isViewer && (
                    <button
                      onClick={handleSaveNotes}
                      className="inline-flex items-center text-xs font-bold text-ymco-primary hover:text-ymco-dark"
                    >
                      <Save className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                      <span>{notesSaved ? 'Saved!' : t.saveChanges}</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  disabled={isViewer}
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-ymco-primary"
                  placeholder="Add internal production or priority notes..."
                />
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                  {t.lastUpdated}: {new Date(product.updatedAt).toLocaleDateString()}
                </span>
                <span>ID: {product.id}</span>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

