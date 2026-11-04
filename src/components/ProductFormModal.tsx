import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose
}) => {
  const { products, categories, statuses, settings, addProduct, updateProduct } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isEdit = Boolean(productToEdit);

  // Form State
  const [sku, setSku] = useState('');
  const [priority, setPriority] = useState<number>(products.length + 1);
  const [tradeNameEn, setTradeNameEn] = useState('');
  const [tradeNameAr, setTradeNameAr] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [categoryEn, setCategoryEn] = useState(categories[0]?.name_en || 'General Medicine');
  const [categoryAr, setCategoryAr] = useState(categories[0]?.name_ar || 'أدوية عامة');
  const [dosageFormEn, setDosageFormEn] = useState('');
  const [dosageFormAr, setDosageFormAr] = useState('');
  const [concentration, setConcentration] = useState('');
  const [packageSize, setPackageSize] = useState('');
  const [status, setStatus] = useState('Active');
  const [indicationsEn, setIndicationsEn] = useState('');
  const [indicationsAr, setIndicationsAr] = useState('');
  const [usageEn, setUsageEn] = useState('');
  const [usageAr, setUsageAr] = useState('');
  const [storageEn, setStorageEn] = useState('');
  const [storageAr, setStorageAr] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('./images/logos/ymco-pill-logo.png');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setPriority(productToEdit.priority);
      setTradeNameEn(productToEdit.tradeNameEn);
      setTradeNameAr(productToEdit.tradeNameAr);
      setScientificName(productToEdit.scientificName || '');
      setCategoryEn(productToEdit.categoryEn);
      setCategoryAr(productToEdit.categoryAr);
      setDosageFormEn(productToEdit.dosageFormEn || '');
      setDosageFormAr(productToEdit.dosageFormAr || '');
      setConcentration(productToEdit.concentration || '');
      setPackageSize(productToEdit.packageSize || '');
      setStatus(productToEdit.status);
      setIndicationsEn(productToEdit.indicationsEn || '');
      setIndicationsAr(productToEdit.indicationsAr || '');
      setUsageEn(productToEdit.usageEn || '');
      setUsageAr(productToEdit.usageAr || '');
      setStorageEn(productToEdit.storageEn || '');
      setStorageAr(productToEdit.storageAr || '');
      setNotes(productToEdit.notes || '');
      setImageUrl(productToEdit.imageUrl || '');
      setImagePreview(productToEdit.imageUrl || '');
    } else {
      setSku(`UMCO-${Date.now().toString().slice(-4)}`);
      setPriority(products.length + 1);
      setTradeNameEn('');
      setTradeNameAr('');
      setScientificName('');
      setCategoryEn(categories[0]?.name_en || 'General Medicine');
      setCategoryAr(categories[0]?.name_ar || 'أدوية عامة');
      setDosageFormEn('');
      setDosageFormAr('');
      setConcentration('');
      setPackageSize('');
      setStatus('Active');
      setIndicationsEn('');
      setIndicationsAr('');
      setUsageEn('');
      setUsageAr('');
      setStorageEn('');
      setStorageAr('');
      setNotes('');
      setImageUrl('./images/logos/ymco-pill-logo.png');
      setImagePreview('./images/logos/ymco-pill-logo.png');
    }
    setErrors({});
  }, [productToEdit, isOpen, categories, products.length]);

  if (!isOpen) return null;

  // Handle local image file upload & convert to Data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (selectedNameEn: string) => {
    const matched = categories.find((c) => c.name_en === selectedNameEn);
    if (matched) {
      setCategoryEn(matched.name_en);
      setCategoryAr(matched.name_ar);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!sku.trim()) newErrors.sku = 'Product SKU / ID is required.';
    if (!tradeNameEn.trim()) newErrors.tradeNameEn = 'English Trade Name is required.';
    if (!categoryEn) newErrors.categoryEn = 'Category is required.';
    if (!status) newErrors.status = 'Status is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit && productToEdit) {
      updateProduct({
        ...productToEdit,
        sku,
        priority: Number(priority) || productToEdit.priority,
        tradeNameEn,
        tradeNameAr: tradeNameAr || tradeNameEn,
        scientificName,
        categoryEn,
        categoryAr: categoryAr || categoryEn,
        dosageFormEn,
        dosageFormAr: dosageFormAr || dosageFormEn,
        concentration,
        packageSize,
        status,
        indicationsEn,
        indicationsAr,
        usageEn,
        usageAr,
        storageEn,
        storageAr,
        notes,
        imageUrl: imageUrl || './images/logos/ymco-pill-logo.png'
      });
    } else {
      addProduct({
        sku,
        priority: Number(priority) || products.length + 1,
        tradeNameEn,
        tradeNameAr: tradeNameAr || tradeNameEn,
        scientificName,
        categoryEn,
        categoryAr: categoryAr || categoryEn,
        dosageFormEn,
        dosageFormAr: dosageFormAr || dosageFormEn,
        concentration,
        packageSize,
        status,
        indicationsEn,
        indicationsAr,
        usageEn,
        usageAr,
        storageEn,
        storageAr,
        notes,
        imageUrl: imageUrl || './images/logos/ymco-pill-logo.png'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {isEdit ? t.editProduct : t.addNewProduct}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Top Section: Photo upload & Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            {/* Image Preview Box */}
            <div className="relative w-24 h-24 rounded-lg bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0 group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain p-1"
                  onError={() => setImagePreview('./images/logos/ymco-pill-logo.png')}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-start">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Image (Upload or specify URL)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-ymco-primary" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, AVIF up to 5MB</span>
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Or paste image URL..."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ymco-primary"
              />
            </div>
          </div>

          {/* Row 1: SKU, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.colSku} *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. UMCO-STR-01"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
              {errors.sku && <p className="text-[10px] text-rose-500 mt-0.5">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.colPriority} (Order Number)
              </label>
              <input
                type="number"
                min="1"
                max={products.length + 10}
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.colStatus} *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAr ? s.labelAr : s.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Names (English & Arabic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.englishName} *
              </label>
              <input
                type="text"
                required
                value={tradeNameEn}
                onChange={(e) => setTradeNameEn(e.target.value)}
                placeholder="e.g. UMCANOL (Ethyl Alcohol 96%)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
              {errors.tradeNameEn && <p className="text-[10px] text-rose-500 mt-0.5">{errors.tradeNameEn}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.arabicName}
              </label>
              <input
                type="text"
                value={tradeNameAr}
                onChange={(e) => setTradeNameAr(e.target.value)}
                placeholder="مثال: يمكانول (كحول إيثيلي 96%)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>
          </div>

          {/* Row 3: Scientific Composition & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.scientificName}
              </label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Ethyl Alcohol 96% v/v"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.category} *
              </label>
              <select
                value={categoryEn}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name_en}>
                    {isAr ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Dosage form, concentration, package size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.dosageForm}
              </label>
              <input
                type="text"
                value={dosageFormEn}
                onChange={(e) => setDosageFormEn(e.target.value)}
                placeholder="e.g. Topical Solution"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Concentration
              </label>
              <input
                type="text"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                placeholder="e.g. 96% v/v"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.packageSize}
              </label>
              <input
                type="text"
                value={packageSize}
                onChange={(e) => setPackageSize(e.target.value)}
                placeholder="e.g. 500ml Bottle"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>
          </div>

          {/* Row 5: Indications & Usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.indications}
              </label>
              <textarea
                rows={2}
                value={indicationsEn}
                onChange={(e) => setIndicationsEn(e.target.value)}
                placeholder="Indications in English or Arabic..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.usageInstructions}
              </label>
              <textarea
                rows={2}
                value={usageEn}
                onChange={(e) => setUsageEn(e.target.value)}
                placeholder="Dosage and administration..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
              />
            </div>
          </div>

          {/* Row 6: Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.internalNotes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal batch notes, GMP checks, prioritization reasons..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ymco-primary"
            />
          </div>

          {/* Submit & Cancel */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2 text-xs sm:text-sm font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>{t.saveChanges}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

